import "server-only";
import { Prisma } from "@prisma/client";
import type {
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Address,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { addressToSnapshot } from "@/lib/addresses";
import { computeTotals } from "@/lib/orders-totals";
import { generateOrderNumber } from "@/lib/orders-format";

/**
 * Order lifecycle + placement transaction.
 *
 * The placeOrder path is the *only* place server-side that trusts item
 * quantities. Prices, images, and stock are authoritatively re-read from
 * the Product table inside the transaction — the client's cart snapshot
 * is treated as untrusted intent, never as pricing input. Stock is
 * decremented inside the same transaction; if any line would over-sell,
 * the whole transaction rolls back with an InsufficientStockError.
 *
 * The customer's saved Address is snapshotted as JSON at order time so
 * later edits (or deletions) to the address book never retro-change
 * fulfilment history.
 */

export type {
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
};

export class InsufficientStockError extends Error {
  constructor(
    public productId: string,
    public requested: number,
    public available: number
  ) {
    super(
      `Insufficient stock for ${productId}: requested ${requested}, available ${available}`
    );
    this.name = "InsufficientStockError";
  }
}

export class EmptyCartError extends Error {
  constructor() {
    super("Cart is empty");
    this.name = "EmptyCartError";
  }
}

export class InvalidAddressError extends Error {
  constructor() {
    super("Delivery address is invalid or does not belong to this user");
    this.name = "InvalidAddressError";
  }
}

/** Internal signal only — thrown when a `clientRequestId` collides inside
 *  the write transaction (a true concurrent race, not the common
 *  sequential-retry case the pre-transaction check already handles).
 *  Never escapes placeOrder(): caught immediately below and turned into a
 *  lookup of the row that won the race. */
class DuplicateClientRequestError extends Error {
  constructor() {
    super("clientRequestId already used by another order");
    this.name = "DuplicateClientRequestError";
  }
}

export interface PlaceOrderInput {
  userId: string;
  contactEmail: string;
  contactPhone: string;
  paymentMethod: PaymentMethod;
  notes?: string | null;
  /** One of these two must be supplied. */
  shippingAddressId?: string | null;
  /** Ad-hoc address (not saved to the buyer's address book). */
  shippingAddressInline?: {
    label?: string | null;
    fullName: string;
    phone: string;
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
  } | null;
  /** Cart items — quantities are trusted, prices are re-read from DB. */
  items: { productId: string; qty: number }[];
  /**
   * Idempotency key for this checkout attempt — generated once on the
   * client (CheckoutFlow) and resubmitted unchanged on every retry of the
   * SAME attempt (double-click, browser retry, a resumed request after a
   * timeout). Optional and backward compatible: omitted, placeOrder()
   * behaves exactly as before (every call creates a new order) — this is
   * what the test harness and any other future caller that doesn't pass
   * one still gets.
   */
  clientRequestId?: string | null;
}

export interface PlacedOrder {
  id: string;
  orderNumber: string;
}

/**
 * Atomically create an order and decrement stock. Throws
 * InsufficientStockError / EmptyCartError / InvalidAddressError on
 * validation failures — none of which write anything.
 */
export async function placeOrder(input: PlaceOrderInput): Promise<PlacedOrder> {
  if (!input.items || input.items.length === 0) {
    throw new EmptyCartError();
  }
  // De-duplicate quantities per productId in case the client sent doubles.
  const merged = new Map<string, number>();
  for (const it of input.items) {
    const qty = Math.max(0, Math.round(it.qty));
    if (qty === 0) continue;
    merged.set(it.productId, (merged.get(it.productId) ?? 0) + qty);
  }
  if (merged.size === 0) throw new EmptyCartError();

  // ---- Idempotency short-circuit ----------------------------------------
  // A plain read, outside any transaction, done BEFORE touching stock. This
  // is what makes a double-click, a browser-level retry, or a resumed
  // request after a client-side timeout return the order that was already
  // created instead of placing a second one — the common case is two
  // requests that arrive sequentially (even "simultaneous" clicks are
  // milliseconds apart over the network), and this check alone resolves
  // all of those without ever starting a second transaction. The @unique
  // constraint on clientRequestId (see the catch below) is what still
  // makes this correct for a genuine concurrent race, not just the
  // sequential case this read covers.
  const requestId = input.clientRequestId?.trim() || null;
  if (requestId) {
    const existing = await prisma.order.findUnique({ where: { clientRequestId: requestId } });
    if (existing && existing.userId === input.userId) {
      return { id: existing.id, orderNumber: existing.orderNumber };
    }
  }

  try {
    return await prisma.$transaction(async (tx) => {
    // Resolve the shipping address (either saved-book id or inline block).
    // Frozen snapshot lands on the Order row; the FK, when set, is a soft
    // pointer that ON DELETE SET NULLs.
    let shippingAddressId: string | null = null;
    let snapshotSource: Record<string, string | null>;
    if (input.shippingAddressId) {
      const addr = await tx.address.findUnique({
        where: { id: input.shippingAddressId },
      });
      if (!addr || addr.userId !== input.userId) throw new InvalidAddressError();
      shippingAddressId = addr.id;
      snapshotSource = addressToSnapshot(addr);
    } else if (input.shippingAddressInline) {
      const a = input.shippingAddressInline;
      const missing =
        !a.fullName?.trim() ||
        !a.phone?.trim() ||
        !a.line1?.trim() ||
        !a.city?.trim() ||
        !a.state?.trim() ||
        !a.postalCode?.trim();
      if (missing) throw new InvalidAddressError();
      snapshotSource = {
        label: a.label ?? null,
        fullName: a.fullName.trim(),
        phone: a.phone.trim(),
        line1: a.line1.trim(),
        line2: a.line2?.trim() || null,
        city: a.city.trim(),
        state: a.state.trim(),
        postalCode: a.postalCode.trim(),
        country: (a.country?.trim() || "India"),
      };
    } else {
      throw new InvalidAddressError();
    }

    // Re-read authoritative product rows. Never trust the client snapshot.
    const ids = Array.from(merged.keys());
    const products = await tx.product.findMany({ where: { id: { in: ids } } });
    const byId = new Map(products.map((p) => [p.id, p] as const));
    for (const id of ids) {
      if (!byId.has(id)) {
        throw new InsufficientStockError(id, merged.get(id) ?? 0, 0);
      }
    }

    // Build line snapshots + validate stock.
    const lines: {
      productId: string;
      productName: string;
      productImage: string | null;
      unitPrice: number;
      qty: number;
      lineTotal: number;
    }[] = [];
    for (const [productId, qty] of merged) {
      const p = byId.get(productId)!;
      if (!p.active) {
        throw new InsufficientStockError(productId, qty, 0);
      }
      if (p.stock < qty) {
        throw new InsufficientStockError(productId, qty, p.stock);
      }
      const image =
        (p.images && p.images.length > 0 ? p.images[0] : null) ?? p.img ?? null;
      lines.push({
        productId,
        productName: p.name,
        productImage: image,
        unitPrice: p.price,
        qty,
        lineTotal: p.price * qty,
      });
    }

    const totals = computeTotals(lines.map((l) => ({ price: l.unitPrice, qty: l.qty })));

    // Decrement stock atomically, in ONE statement (conditional WHERE to
    // make the race-safety belt-and-braces even inside the transaction).
    //
    // WHY ONE STATEMENT AND NOT A LOOP. This used to issue one
    // `tx.product.updateMany` per cart line. Each of those is a separate
    // network round-trip held open inside the interactive transaction, so
    // the transaction's wall-clock cost grew linearly with cart size. On
    // this deployment (app in India, Neon in us-east-2) a single round-trip
    // measures ~290ms and BEGIN/COMMIT alone ~1.2s, so Prisma's default
    // 5000ms interactive-transaction budget is exhausted at roughly nine
    // round-trips — a cart of about six lines. Past that the transaction
    // expired mid-flight and the *next* statement, `tx.order.create`,
    // failed with P2028 "Transaction already closed".
    //
    // Collapsing the loop makes the round-trip count constant (one) for
    // any cart size. The semantics are deliberately unchanged: the same
    // `active = true AND stock >= qty` guard is applied per row by the
    // database, so a row whose stock moved underneath us still refuses to
    // update and still cannot oversell. RETURNING tells us exactly which
    // rows applied.
    const stockUpdates = Prisma.join(
      lines.map((l) => Prisma.sql`(${l.productId}::text, ${l.qty}::int)`)
    );
    const applied = await tx.$queryRaw<{ id: string }[]>`
      UPDATE "Product" AS p
         SET stock = p.stock - v.qty,
             "updatedAt" = NOW()
        FROM (VALUES ${stockUpdates}) AS v(id, qty)
       WHERE p.id = v.id
         AND p.active = true
         AND p.stock >= v.qty
      RETURNING p.id
    `;

    if (applied.length !== lines.length) {
      // Snapshot went stale between the read and the write — abort. One
      // extra read on the failure path only; the transaction rolls back
      // either way, so nothing has been decremented.
      const appliedIds = new Set(applied.map((r) => r.id));
      const failed = lines.filter((l) => !appliedIds.has(l.productId));
      const fresh = await tx.product.findMany({
        where: { id: { in: failed.map((f) => f.productId) } },
        select: { id: true, stock: true },
      });
      const freshById = new Map(fresh.map((p) => [p.id, p.stock] as const));
      // `lines` order is preserved by filter, so this reports the same
      // product the old per-line loop would have failed on first.
      const first = failed[0];
      throw new InsufficientStockError(
        first.productId,
        first.qty,
        freshById.get(first.productId) ?? 0
      );
    }

    // Try to produce a unique orderNumber; collisions on a 5-char
    // alphanumeric per-day are astronomically unlikely, but retry a few
    // times just in case.
    const paymentStatus: PaymentStatus =
      input.paymentMethod === "COD"
        ? "UNPAID"
        : input.paymentMethod === "OFFLINE_INVOICE"
          ? "PENDING"
          : "UNPAID";

    for (let attempt = 0; attempt < 5; attempt++) {
      const orderNumber = generateOrderNumber();
      try {
        const created = await tx.order.create({
          data: {
            orderNumber,
            clientRequestId: requestId,
            userId: input.userId,
            shippingAddressId,
            // Prisma Json field accepts a plain object.
            shippingSnapshot: snapshotSource as unknown as Prisma.InputJsonValue,
            contactEmail: input.contactEmail.trim(),
            contactPhone: input.contactPhone.trim(),
            subtotal: totals.subtotal,
            shipping: totals.shipping,
            tax: totals.tax,
            total: totals.total,
            paymentMethod: input.paymentMethod,
            paymentStatus,
            notes: input.notes?.trim() || null,
            items: {
              create: lines.map((l) => ({
                productId: l.productId,
                productName: l.productName,
                productImage: l.productImage,
                unitPrice: l.unitPrice,
                qty: l.qty,
                lineTotal: l.lineTotal,
              })),
            },
          },
        });
        return { id: created.id, orderNumber: created.orderNumber };
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === "P2002"
        ) {
          // P2002 = unique-constraint violation. Which column decides what
          // "retry" means:
          const target = Array.isArray(e.meta?.target)
            ? (e.meta!.target as string[])
            : typeof e.meta?.target === "string"
              ? [e.meta!.target as string]
              : [];
          if (target.some((t) => t.includes("clientRequestId"))) {
            // Lost a genuine concurrent race against another request
            // carrying the SAME idempotency key. A fresh orderNumber does
            // not fix this — the correct move is to stop, let this
            // transaction roll back (including the stock decrement above,
            // which must not double-apply), and hand back whichever order
            // actually won. Caught just outside the transaction, below.
            throw new DuplicateClientRequestError();
          }
          // Otherwise: an orderNumber collision — vanishingly rare (5-char
          // alphanumeric per day). Retry with a freshly generated one.
          continue;
        }
        throw e;
      }
    }
    throw new Error("Failed to allocate a unique order number after 5 attempts");
    });
  } catch (e) {
    if (e instanceof DuplicateClientRequestError && requestId) {
      const winner = await prisma.order.findUnique({ where: { clientRequestId: requestId } });
      if (winner) return { id: winner.id, orderNumber: winner.orderNumber };
    }
    throw e;
  }
}

// ---------------------------------------------------------------------------
// Read helpers

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export async function getOrderById(
  userId: string,
  id: string
): Promise<OrderWithItems | null> {
  const row = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  return row && row.userId === userId ? row : null;
}

export async function getOrderByIdForAdmin(
  id: string
): Promise<(OrderWithItems & { user: { email: string; name: string } }) | null> {
  const row = await prisma.order.findUnique({
    where: { id },
    include: { items: true, user: { select: { email: true, name: true } } },
  });
  return row;
}

/** Orders for one buyer, newest first, with line items for list summaries.
 *  Always scoped by userId — never return another account's orders. */
export async function listOrdersForUser(
  userId: string
): Promise<OrderWithItems[]> {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
}

export async function listOrdersForAdmin(filters?: {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
}): Promise<Order[]> {
  return prisma.order.findMany({
    where: {
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.paymentStatus ? { paymentStatus: filters.paymentStatus } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
}

export type AdminOrderRow = Order & { user: { name: string; email: string } };

/**
 * Paged admin listing with an optional free-text search across the order
 * number, contact email/phone, and the buyer's name/email. Returns the
 * page plus the total so the UI can render a pager; the buyer is joined so
 * the list can show who ordered without a second query per row.
 */
export async function searchOrdersForAdmin(opts: {
  status?: OrderStatus;
  q?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ rows: AdminOrderRow[]; total: number }> {
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, opts.pageSize ?? 25));
  const q = opts.q?.trim();
  const where: Prisma.OrderWhereInput = {
    ...(opts.status ? { status: opts.status } : {}),
    ...(q
      ? {
          OR: [
            { orderNumber: { contains: q, mode: "insensitive" } },
            { contactEmail: { contains: q, mode: "insensitive" } },
            { contactPhone: { contains: q } },
            { user: { name: { contains: q, mode: "insensitive" } } },
            { user: { email: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };
  const [rows, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.order.count({ where }),
  ]);
  return { rows, total };
}

// ---------------------------------------------------------------------------
// Cash on Delivery email delivery tracking.
//
// Database-backed rather than an in-memory flag, deliberately: an
// in-process flag is gone the moment the server restarts or the request
// runs on a different serverless instance, which is exactly when a retry
// is most likely to happen. A column on the Order row itself survives all
// of that, and reads back correctly no matter which instance handles the
// retry.

export type CodEmailKind = "user" | "admin";

/** Marks one of the two COD emails as sent for this order — called only
 *  after the real send has returned `{ sent: true }` (see
 *  placeOrderAction). Best-effort by design: if this write itself fails,
 *  the worst outcome is a possible resend on a future retry, which is
 *  still strictly better than the pre-fix behaviour of always resending.
 *  Never throws. */
export async function recordCodEmailSent(
  orderId: string,
  kind: CodEmailKind
): Promise<void> {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data:
        kind === "user"
          ? { codUserEmailSentAt: new Date() }
          : { codAdminEmailSentAt: new Date() },
    });
  } catch (err) {
    console.error(
      `[orders] failed to record COD ${kind} email as sent for order ${orderId}:`,
      err instanceof Error ? err.message : "Unknown error."
    );
  }
}

// ---------------------------------------------------------------------------
// Admin lifecycle transitions

/** Allowed forward transitions per current status. Any state can also
 *  become CANCELLED or REFUNDED at admin's discretion. */
const FORWARD: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["PAYMENT_PENDING", "PAID", "PROCESSING", "CANCELLED"],
  PAYMENT_PENDING: ["PAID", "CANCELLED"],
  PAID: ["PROCESSING", "REFUNDED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "REFUNDED"],
  DELIVERED: ["REFUNDED"],
  CANCELLED: [],
  REFUNDED: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return FORWARD[from]?.includes(to) ?? false;
}

export async function setOrderStatus(
  id: string,
  next: OrderStatus
): Promise<Order | null> {
  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) return null;
  if (existing.status === next) return existing;
  if (!canTransition(existing.status, next)) return null;
  // If we're marking PAID via status, also lift paymentStatus if UNPAID/PENDING.
  const paymentStatus: PaymentStatus | undefined =
    next === "PAID" && existing.paymentStatus !== "PAID" ? "PAID" : undefined;
  return prisma.order.update({
    where: { id },
    data: { status: next, ...(paymentStatus ? { paymentStatus } : {}) },
  });
}

export async function setPaymentStatus(
  id: string,
  next: PaymentStatus,
  paymentRef?: string | null
): Promise<Order | null> {
  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) return null;
  return prisma.order.update({
    where: { id },
    data: {
      paymentStatus: next,
      paymentRef: paymentRef ?? existing.paymentRef,
    },
  });
}

/**
 * Cancel an order and restock its items. Admin-only.
 *
 * Refuses (returns null) unless the FORWARD table allows the current status
 * to become CANCELLED — the same rule setOrderStatus() enforces. Without
 * this check a forged form value could cancel a SHIPPED or DELIVERED order
 * and put goods that already left the building back into stock. A row that
 * is already CANCELLED / REFUNDED is returned untouched (idempotent).
 *
 * The restock is one statement for any number of lines, for the same
 * round-trip-budget reason placeOrder() collapses its decrement.
 */
export async function cancelOrderAndRestock(id: string): Promise<Order | null> {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!existing) return null;
    if (existing.status === "CANCELLED" || existing.status === "REFUNDED") {
      return existing;
    }
    if (!canTransition(existing.status, "CANCELLED")) return null;
    if (existing.items.length > 0) {
      const restock = Prisma.join(
        existing.items.map((it) => Prisma.sql`(${it.productId}::text, ${it.qty}::int)`)
      );
      await tx.$executeRaw`
        UPDATE "Product" AS p
           SET stock = p.stock + v.qty,
               "updatedAt" = NOW()
          FROM (VALUES ${restock}) AS v(id, qty)
         WHERE p.id = v.id
      `;
    }
    return tx.order.update({
      where: { id },
      data: { status: "CANCELLED" },
    });
  });
}

// ---------------------------------------------------------------------------
// Snapshot reader — the shippingSnapshot column is Json; expose a typed accessor.

export interface ShippingSnapshot {
  label: string | null;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export function readShippingSnapshot(o: Order): ShippingSnapshot {
  const raw = (o.shippingSnapshot ?? {}) as Partial<ShippingSnapshot>;
  return {
    label: raw.label ?? null,
    fullName: raw.fullName ?? "",
    phone: raw.phone ?? "",
    line1: raw.line1 ?? "",
    line2: raw.line2 ?? null,
    city: raw.city ?? "",
    state: raw.state ?? "",
    postalCode: raw.postalCode ?? "",
    country: raw.country ?? "India",
  };
}

/** Placeholder for the Phase 5.3 mail integration. Kept as a typed stub
 *  in the data layer so callers can wire it without waiting on transport. */
export type OrderReceiptResult =
  | { sent: true; provider: string }
  | { sent: false; reason: "not-configured" | "error"; detail?: string };
