import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { OrderStatus, PaymentStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { FALLBACK_LOGO, inr } from "@/lib/products";
import AdminShell from "@/components/admin/AdminShell";
import {
  getOrderByIdForAdmin,
  readShippingSnapshot,
  canTransition,
} from "@/lib/orders";
import {
  formatOrderDate,
  orderStatusLabel,
  orderStatusStyle,
  paymentStatusLabel,
  paymentStatusStyle,
  paymentMethodLabel,
} from "@/lib/orders-format";
import { updateOrderStatusAction, updatePaymentStatusAction } from "../actions";

export const metadata: Metadata = {
  title: "Order · Lions Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const ALL_ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "PAYMENT_PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];
const ALL_PAYMENT_STATUSES: PaymentStatus[] = [
  "UNPAID",
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
];

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAdmin();
  const { id } = await params;
  const order = await getOrderByIdForAdmin(id);
  if (!order) notFound();

  const shipping = readShippingSnapshot(order);
  const itemCount = order.items.reduce((sum, it) => sum + it.qty, 0);
  // Only the transitions lib/orders.ts's own FORWARD table actually allows —
  // no invented next-states.
  const nextStatuses = ALL_ORDER_STATUSES.filter((s) =>
    canTransition(order.status, s)
  );

  return (
    <AdminShell email={user.email} active="orders">
      <Link
        href="/admin/orders"
        className="font-manrope font-semibold text-[13px] text-crimson-600 no-underline"
      >
        ← Back to Orders
      </Link>
      <div className="admin-head mt-3">
        <div>
          <h1>{order.orderNumber}</h1>
          <p>
            Placed on {formatOrderDate(order.createdAt)} · {itemCount}{" "}
            {itemCount === 1 ? "item" : "items"} · {order.user.name} (
            {order.user.email})
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 items-start">
        <div className="grid gap-4 min-w-0">
          <section className="admin-card">
            <h2 className="acct-panel-title !mb-4">Items</h2>
            <ul className="acct-line-items">
              {order.items.map((it) => (
                <li key={it.id} className="acct-line-item">
                  <div className="acct-line-thumb">
                    <Image
                      src={it.productImage || FALLBACK_LOGO}
                      alt={it.productName}
                      width={60}
                      height={60}
                      className="object-contain w-full h-full"
                    />
                  </div>
                  <div className="acct-line-copy min-w-0">
                    <div className="font-sora font-bold text-[15px] text-ink truncate">
                      {it.productName}
                    </div>
                    <div className="font-manrope text-[12.5px] text-muted mt-0.5">
                      {inr(it.unitPrice)} × {it.qty}
                    </div>
                  </div>
                  <div className="font-sora font-extrabold text-[15px] text-crimson-600 shrink-0">
                    {inr(it.lineTotal)}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="admin-card">
            <h2 className="acct-panel-title !mb-4">Delivery</h2>
            <div className="font-manrope text-[13.5px] text-ink leading-[1.55]">
              <div className="font-bold">{shipping.fullName}</div>
              <div className="text-muted">
                {shipping.line1}
                {shipping.line2 ? `, ${shipping.line2}` : ""}
              </div>
              <div className="text-muted">
                {shipping.city}, {shipping.state} {shipping.postalCode},{" "}
                {shipping.country}
              </div>
              <div className="text-muted mt-1">
                {shipping.phone} · {order.contactEmail}
              </div>
            </div>
          </section>

          {order.notes ? (
            <section className="admin-card">
              <h2 className="acct-panel-title !mb-4">Notes</h2>
              <div className="font-manrope text-[13.5px] text-muted whitespace-pre-line">
                {order.notes}
              </div>
            </section>
          ) : null}

          <section className="admin-card">
            <div className="admin-card-title">Order status</div>
            <p className="admin-card-sub">
              Current: {orderStatusLabel(order.status)}. Only the transitions
              this order&apos;s current status actually allows are shown —
              cancelling here also restocks the items.
            </p>
            {nextStatuses.length === 0 ? (
              <p className="font-manrope text-[13px] text-muted m-0">
                This order is in a final state — no further status change is
                possible.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {nextStatuses.map((s) => (
                  <form action={updateOrderStatusAction} key={s}>
                    <input type="hidden" name="id" value={order.id} />
                    <input type="hidden" name="status" value={s} />
                    <button
                      type="submit"
                      className={s === "CANCELLED" ? "btn-ghost btn-danger" : "btn-ghost"}
                    >
                      Mark as {orderStatusLabel(s)}
                    </button>
                  </form>
                ))}
              </div>
            )}
          </section>

          <section className="admin-card">
            <div className="admin-card-title">Payment status</div>
            <p className="admin-card-sub">
              Current: {paymentStatusLabel(order.paymentStatus)} ·{" "}
              {paymentMethodLabel(order.paymentMethod)}
            </p>
            <form
              action={updatePaymentStatusAction}
              className="flex flex-wrap items-center gap-2"
            >
              <input type="hidden" name="id" value={order.id} />
              <select
                name="paymentStatus"
                defaultValue={order.paymentStatus}
                className="!w-auto"
              >
                {ALL_PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {paymentStatusLabel(s)}
                  </option>
                ))}
              </select>
              <button type="submit" className="btn-ghost">
                Update payment status
              </button>
            </form>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 min-w-0">
          <div className="summary">
            <h3>Summary</h3>
            <div className="line">
              <span>Subtotal</span>
              <span>{inr(order.subtotal)}</span>
            </div>
            <div className="line">
              <span>Shipping</span>
              <span>{order.shipping > 0 ? inr(order.shipping) : "Free"}</span>
            </div>
            <div className="line">
              <span>GST</span>
              <span>{inr(order.tax)}</span>
            </div>
            <div className="total">
              <span>Total</span>
              <span>{inr(order.total)}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="tier-badge" style={orderStatusStyle(order.status)}>
                Order · {orderStatusLabel(order.status)}
              </span>
              <span className="tier-badge" style={paymentStatusStyle(order.paymentStatus)}>
                Payment · {paymentStatusLabel(order.paymentStatus)}
              </span>
            </div>
            <div className="mt-4 font-manrope text-[12.5px] text-white/70">
              Payment method: {paymentMethodLabel(order.paymentMethod)}
            </div>
          </div>
        </aside>
      </div>
    </AdminShell>
  );
}
