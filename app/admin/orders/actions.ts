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
const PAYMENT_STATUSES: PaymentStatus[] = [
  "UNPAID",
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
];

function revalidateOrder(id: string) {
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}

/**
 * Advances an order to a new status. A target of CANCELLED is routed to
 * cancelOrderAndRestock() instead of the generic setOrderStatus() — that
 * is the function this codebase already has for cancellation, and it is
 * the one that actually restocks the items; setOrderStatus() would accept
 * the same transition (per the FORWARD table in lib/orders.ts) but skip
 * the restock. Every other target goes through setOrderStatus(), which
 * itself refuses anything canTransition() doesn't allow.
 */
export async function updateOrderStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const raw = String(formData.get("status") ?? "").toUpperCase();
  if (!id || !(ORDER_STATUSES as string[]).includes(raw)) return;
  const next = raw as OrderStatus;

  if (next === "CANCELLED") {
    await cancelOrderAndRestock(id);
  } else {
    // setOrderStatus() itself checks canTransition() and no-ops on an
    // illegal jump; the explicit check here just keeps a stray/forged
    // form value from doing anything even before that.
    const order = await getOrderByIdForAdmin(id);
    if (!order || !canTransition(order.status, next)) return;
    await setOrderStatus(id, next);
  }

  revalidateOrder(id);
}

export async function updatePaymentStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const raw = String(formData.get("paymentStatus") ?? "").toUpperCase();
  if (!id || !(PAYMENT_STATUSES as string[]).includes(raw)) return;
  await setPaymentStatus(id, raw as PaymentStatus);
  revalidateOrder(id);
}
