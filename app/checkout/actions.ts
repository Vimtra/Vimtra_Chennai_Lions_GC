"use server";

import { revalidatePath } from "next/cache";
import { getSiteHost } from "@/lib/site-url";
import { requireUser } from "@/lib/auth";
import {
  placeOrder,
  getOrderByIdForAdmin,
  readShippingSnapshot,
  recordCodEmailSent,
  EmptyCartError,
  InsufficientStockError,
  InvalidAddressError,
  type PlaceOrderInput,
} from "@/lib/orders";
import { createAddress } from "@/lib/addresses";
import {
  sendOrderReceipt,
  sendCodOrderConfirmationToUser,
  sendCodOrderNotificationToAdmin,
} from "@/lib/mail";
import type { PaymentMethod } from "@prisma/client";

/**
 * `placeOrderAction` — the single server-side entry point for creating
 * an order from the checkout form. Discipline:
 *
 *   1. requireUser() — the buyer is always authenticated on the server;
 *      the /checkout page ALSO gates via requireUser but this action
 *      re-checks so it can't be invoked through a stale form submission
 *      after the session lapsed.
 *
 *   2. NEVER trust client prices or totals. The client posts a cart
 *      snapshot as an array of {productId, qty}; the transaction inside
 *      placeOrder() re-reads authoritative Product rows and computes
 *      totals from those. Any manipulated JSON just gets ignored — the
 *      DB is the source of truth.
 *
 *   3. If the buyer opted to save an inline address, we create the
 *      Address row FIRST (outside the order transaction, so an order
 *      failure doesn't leave a half-saved address the user has to
 *      duplicate). If saving fails we fall back to shipping-inline.
 *
 *   4. Receipt email is best-effort and MUST NOT abort the order.
 *
 * Returns a typed result to the client so the calling component can
 * clear the client cart + navigate to /orders/[id]. No `redirect()` in
 * here — that would swallow the return value.
 */

const PAYMENT_METHODS: PaymentMethod[] = ["COD", "OFFLINE_INVOICE", "ONLINE_TBD"];

function opt(raw: FormDataEntryValue | null): string | null {
  const s = String(raw ?? "").trim();
  return s ? s : null;
}
function req(raw: FormDataEntryValue | null): string {
  return String(raw ?? "").trim();
}
function toPaymentMethod(raw: FormDataEntryValue | null): PaymentMethod | null {
  const s = String(raw ?? "").toUpperCase();
  return (PAYMENT_METHODS as string[]).includes(s) ? (s as PaymentMethod) : null;
}

export type PlaceOrderResult =
  | { ok: true; orderId: string; orderNumber: string }
  | {
      ok: false;
      error: string;
      code:
        | "AUTH"
        | "EMPTY_CART"
        | "INVALID_ADDRESS"
        | "INSUFFICIENT_STOCK"
        | "INVALID_PAYMENT"
        | "SERVER";
      insufficient?: {
        productId: string;
        requested: number;
        available: number;
      };
    };

interface RawCartItem {
  productId: string;
  qty: number;
}

function parseCart(raw: FormDataEntryValue | null): RawCartItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(String(raw));
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((it) => ({
        productId: String((it as { productId?: unknown }).productId ?? "").trim(),
        qty: Math.max(0, Math.round(Number((it as { qty?: unknown }).qty ?? 0))),
      }))
      .filter((it) => it.productId && it.qty > 0);
  } catch {
    return [];
  }
}

export async function placeOrderAction(formData: FormData): Promise<PlaceOrderResult> {
  const user = await requireUser("/checkout");

  // ---- Parse + validate top-level fields --------------------------------
  const items = parseCart(formData.get("cart"));
  if (items.length === 0) {
    return { ok: false, code: "EMPTY_CART", error: "Your cart is empty." };
  }

  const contactEmail = req(formData.get("contactEmail")) || user.email;
  const contactPhone = req(formData.get("contactPhone"));
  const paymentMethod = toPaymentMethod(formData.get("paymentMethod"));
  const notes = opt(formData.get("notes"));
  // Idempotency key — CheckoutFlow generates this once per checkout attempt
  // and resubmits the same value on every retry of that attempt (see its
  // own comment). Absent for any caller that doesn't send one; placeOrder()
  // treats that exactly as it always has (every call creates a new order).
  const clientRequestId = opt(formData.get("clientRequestId"));

  if (!contactEmail || !/^\S+@\S+\.\S+$/.test(contactEmail)) {
    return { ok: false, code: "INVALID_ADDRESS", error: "A valid contact email is required." };
  }
  if (!contactPhone || contactPhone.replace(/\D/g, "").length < 7) {
    return { ok: false, code: "INVALID_ADDRESS", error: "A valid contact phone number is required." };
  }
  if (!paymentMethod) {
    return { ok: false, code: "INVALID_PAYMENT", error: "Select a payment method." };
  }

  // ---- Resolve shipping address -----------------------------------------
  let shippingAddressId: string | null = opt(formData.get("shippingAddressId"));
  let shippingAddressInline: PlaceOrderInput["shippingAddressInline"] = null;

  if (!shippingAddressId) {
    // Buyer is entering a fresh address inline.
    const inline = {
      label: opt(formData.get("addr_label")),
      fullName: req(formData.get("addr_fullName")),
      phone: req(formData.get("addr_phone")) || contactPhone,
      line1: req(formData.get("addr_line1")),
      line2: opt(formData.get("addr_line2")),
      city: req(formData.get("addr_city")),
      state: req(formData.get("addr_state")),
      postalCode: req(formData.get("addr_postalCode")),
      country: req(formData.get("addr_country")) || "India",
    };
    if (
      !inline.fullName ||
      !inline.phone ||
      !inline.line1 ||
      !inline.city ||
      !inline.state ||
      !inline.postalCode
    ) {
      return { ok: false, code: "INVALID_ADDRESS", error: "Please complete the delivery address." };
    }

    // If the buyer ticked "Save this address to my book", promote the
    // inline block to a saved Address row (best-effort). Do this BEFORE
    // the order transaction so a downstream order failure doesn't leave
    // the user with a partially-formed record they have to re-enter.
    const saveIt = formData.get("saveAddress") === "on";
    if (saveIt) {
      try {
        const saved = await createAddress(user.id, inline);
        shippingAddressId = saved.id;
      } catch {
        // Falling through to inline — user still gets their order.
        shippingAddressInline = inline;
      }
    } else {
      shippingAddressInline = inline;
    }
  }

  // ---- Place the order --------------------------------------------------
  let placed;
  try {
    placed = await placeOrder({
      userId: user.id,
      contactEmail,
      contactPhone,
      paymentMethod,
      notes,
      shippingAddressId,
      shippingAddressInline,
      items,
      clientRequestId,
    });
  } catch (e) {
    if (e instanceof EmptyCartError) {
      return { ok: false, code: "EMPTY_CART", error: "Your cart is empty." };
    }
    if (e instanceof InvalidAddressError) {
      return {
        ok: false,
        code: "INVALID_ADDRESS",
        error: "That delivery address is invalid.",
      };
    }
    if (e instanceof InsufficientStockError) {
      return {
        ok: false,
        code: "INSUFFICIENT_STOCK",
        error:
          e.available === 0
            ? "One of the items in your cart just went out of stock."
            : `One of the items in your cart only has ${e.available} left. Please adjust your cart and try again.`,
        insufficient: {
          productId: e.productId,
          requested: e.requested,
          available: e.available,
        },
      };
    }
    // Unknown DB / transaction error — return a generic message; do
    // NOT surface the raw error to the client.
    console.error(
      "[placeOrderAction] unknown error while placing order",
      e
    );
    return {
      ok: false,
      code: "SERVER",
      error: "Something went wrong placing your order. Please try again.",
    };
  }

  // ---- Best-effort order emails (must not abort) -------------------------
  // The order row already exists at this point — nothing below can undo
  // it, and nothing below is allowed to try.
  //
  // IMPORTANT: this action CAN now run more than once for the same order.
  // placeOrder() is idempotent on clientRequestId (double-click, browser
  // retry, or a resumed request after a client-side timeout all resolve to
  // the SAME `placed.id`, not a new row) — see that function's own
  // comment. So this block cannot assume "a fresh order ⇒ emails never
  // sent"; each email is individually gated on the order's own
  // codUserEmailSentAt / codAdminEmailSentAt column, set only after that
  // specific send actually reports `sent: true`. That is what stops a
  // retry that lands here a second time from re-sending an email that
  // already went out — a crash between the two sends (scenario: user
  // email sent, then the process dies before the admin email or before
  // the response reaches the client) means a retry sends only the one
  // that is still missing, never both again.
  if (paymentMethod === "COD") {
    // Cash on Delivery — real buyer confirmation + admin notification.
    // Every figure below is re-read from the Order/OrderItem rows
    // placeOrder() just wrote (getOrderByIdForAdmin), never recomputed
    // from the client's cart submission, so the email can never disagree
    // with what is actually stored.
    try {
      const full = await getOrderByIdForAdmin(placed.id);
      if (full) {
        const shippingAddress = readShippingSnapshot(full);
        const siteHost = getSiteHost();
        const lines = full.items.map((it) => ({
          productName: it.productName,
          qty: it.qty,
          unitPrice: it.unitPrice,
          lineTotal: it.lineTotal,
        }));

        if (!full.codUserEmailSentAt) {
          const userMail = await sendCodOrderConfirmationToUser({
            customerName: user.name,
            customerEmail: full.contactEmail,
            orderNumber: full.orderNumber,
            orderId: full.id,
            items: lines,
            subtotal: full.subtotal,
            shipping: full.shipping,
            tax: full.tax,
            total: full.total,
            shippingAddress,
            siteHost,
          }).catch((err) => ({
            sent: false as const,
            reason: "error" as const,
            detail: err instanceof Error ? err.message : "Unknown error.",
          }));
          if (userMail.sent) {
            await recordCodEmailSent(full.id, "user");
          } else if (userMail.reason === "error") {
            console.error("[placeOrderAction] COD confirmation email failed:", userMail.detail);
          }
        }

        if (!full.codAdminEmailSentAt) {
          const adminMail = await sendCodOrderNotificationToAdmin({
            customerName: user.name,
            customerEmail: full.contactEmail,
            customerPhone: full.contactPhone,
            orderNumber: full.orderNumber,
            orderId: full.id,
            items: lines,
            total: full.total,
            shippingAddress,
            siteHost,
          }).catch((err) => ({
            sent: false as const,
            reason: "error" as const,
            detail: err instanceof Error ? err.message : "Unknown error.",
          }));
          if (adminMail.sent) {
            await recordCodEmailSent(full.id, "admin");
          } else if (adminMail.reason === "error") {
            console.error("[placeOrderAction] COD admin notification failed:", adminMail.detail);
          }
        }
      }
    } catch (err) {
      // Absolutely never abort the order because of email failure.
      console.error(
        "[placeOrderAction] COD order email step failed:",
        err instanceof Error ? err.message : "Unknown error."
      );
    }
  } else {
    // OFFLINE_INVOICE / ONLINE_TBD — unchanged from before this pass:
    // sendOrderReceipt remains the dormant stub it already was (both of
    // its branches return `sent: false`), so non-COD order-email
    // behaviour is untouched. Not in scope for this change.
    try {
      await sendOrderReceipt({
        to: contactEmail,
        orderNumber: placed.orderNumber,
        totalRupees: 0,
        itemCount: items.reduce((n, i) => n + i.qty, 0),
        contactName: user.name,
      });
    } catch {
      // Absolutely never abort the order because of receipt failure.
    }
  }

  // Revalidate the paths that reflect this order.
  revalidatePath("/profile/orders");
  revalidatePath(`/orders/${placed.id}`);
  revalidatePath(`/admin/orders`);

  return { ok: true, orderId: placed.id, orderNumber: placed.orderNumber };
}
