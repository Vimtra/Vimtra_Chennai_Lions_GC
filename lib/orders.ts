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

  return prisma.$transaction(async (tx) => {
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

    // Decrement stock atomically per row (conditional WHERE to make the
    // race-safety belt-and-braces even inside the transaction).
    for (const l of lines) {
      const upd = await tx.product.updateMany({
        where: { id: l.productId, stock: { gte: l.qty }, active: true },
        data: { stock: { decrement: l.qty } },
      });
      if (upd.count !== 1) {
        // Snapshot went stale between the read and the write — abort.
        const fresh = await tx.product.findUnique({ where: { id: l.productId } });
        throw new InsufficientStockError(l.productId, l.qty, fresh?.stock ?? 0);
      }
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
        // P2002 = unique-constraint violation on orderNumber. Retry.
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === "P2002"
        ) {
          continue;
        }
        throw e;
      }
    }
    throw new Error("Failed to allocate a unique order number after 5 attempts");
  });
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

export async function listOrdersForUser(userId: string): Promise<Order[]> {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
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

/** Cancel an order and restock its items. Admin-only. */
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
    for (const item of existing.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.qty } },
      });
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
