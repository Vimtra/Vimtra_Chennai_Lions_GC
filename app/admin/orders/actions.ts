"use server";

import { revalidatePath } from "next/cache";
import type { OrderStatus, PaymentStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import {
  setOrderStatus,
  setPaymentStatus,
  cancelOrderAndRestock,
  canTransition,
  getOrderByIdForAdmin,
} from "@/lib/orders";
import { orderStatusLabel, paymentStatusLabel } from "@/lib/orders-format";
import type { ActionResult } from "@/lib/admin-action-result";

const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "PAYMENT_PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];
const PAYMENT_STATUSES: PaymentStatus[] = ["UNPAID", "PENDING", "PAID", "FAILED", "REFUNDED"];

function revalidateOrder(id: string) {
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin");
  // The buyer's own order page reads the same row.
  revalidatePath(`/orders/${id}`);
  revalidatePath("/profile/orders");
}

/**
 * Advances an order to a new status. A target of CANCELLED is routed to
 * cancelOrderAndRestock(), which restocks the items AND enforces the same
 * FORWARD transition table setOrderStatus() does — so a forged form value
 * can no longer cancel (and restock) an order that has already shipped.
 */
export async function updateOrderStatusAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const raw = String(formData.get("status") ?? "").toUpperCase();
  if (!id || !(ORDER_STATUSES as string[]).includes(raw)) {
    return { ok: false, error: "That status is not valid." };
  }
  const next = raw as OrderStatus;

  const order = await getOrderByIdForAdmin(id);
  if (!order) return { ok: false, error: "That order no longer exists." };
  if (order.status === next) return { ok: true, message: `Already ${orderStatusLabel(next)}.` };
  if (!canTransition(order.status, next)) {
    return {
      ok: false,
      error: `An order that is ${orderStatusLabel(order.status)} cannot be marked ${orderStatusLabel(next)}.`,
    };
  }

  const updated =
    next === "CANCELLED" ? await cancelOrderAndRestock(id) : await setOrderStatus(id, next);
  if (!updated) {
    return { ok: false, error: "The order could not be updated. Reload and try again." };
  }

  revalidateOrder(id);
  return {
    ok: true,
    message:
      next === "CANCELLED"
        ? `${order.orderNumber} cancelled and its items returned to stock.`
        : `${order.orderNumber} marked ${orderStatusLabel(next)}.`,
  };
}

export async function updatePaymentStatusAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const raw = String(formData.get("paymentStatus") ?? "").toUpperCase();
  const paymentRef = String(formData.get("paymentRef") ?? "").trim();
  if (!id || !(PAYMENT_STATUSES as string[]).includes(raw)) {
    return { ok: false, error: "That payment status is not valid." };
  }
  const updated = await setPaymentStatus(id, raw as PaymentStatus, paymentRef || null);
  if (!updated) return { ok: false, error: "That order no longer exists." };
  revalidateOrder(id);
  return { ok: true, message: `Payment marked ${paymentStatusLabel(raw as PaymentStatus)}.` };
}
