import type { Metadata } from "next";
import Link from "next/link";
import type { OrderStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { listOrdersForAdmin } from "@/lib/orders";
import { inr } from "@/lib/products";
import {
  formatOrderDate,
  orderStatusLabel,
  orderStatusStyle,
  paymentStatusLabel,
  paymentStatusStyle,
} from "@/lib/orders-format";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Orders · Lions Admin",
  robots: { index: false, follow: false },
};

// Real enum values only — no invented statuses.
const STATUS_TABS: { key: OrderStatus | "ALL"; label: string }[] = [
  { key: "ALL", label: "ALL" },
  { key: "PENDING", label: "PENDING" },
  { key: "PAYMENT_PENDING", label: "AWAITING PAYMENT" },
  { key: "PAID", label: "PAID" },
  { key: "PROCESSING", label: "PROCESSING" },
  { key: "SHIPPED", label: "SHIPPED" },
  { key: "DELIVERED", label: "DELIVERED" },
  { key: "CANCELLED", label: "CANCELLED" },
  { key: "REFUNDED", label: "REFUNDED" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requireAdmin();
  const { status: rawStatus } = await searchParams;
  const status =
    rawStatus && (STATUS_TABS as { key: string }[]).some((t) => t.key === rawStatus) && rawStatus !== "ALL"
      ? (rawStatus as OrderStatus)
      : undefined;

  const orders = await listOrdersForAdmin(status ? { status } : undefined);

  return (
    <AdminShell email={user.email} active="orders">
      <div className="admin-head">
        <div>
          <h1>Orders</h1>
          <p>
            {orders.length} order{orders.length === 1 ? "" : "s"}
            {status ? ` · ${orderStatusLabel(status)}` : ""}
          </p>
        </div>
      </div>

      <div className="admin-chip-row">
        {STATUS_TABS.map((t) => (
          <Link
            key={t.key}
            href={t.key === "ALL" ? "/admin/orders" : `/admin/orders?status=${t.key}`}
            className={`admin-chip ${
              (status ?? "ALL") === t.key ? "is-active" : ""
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="admin-card overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Placed</th>
              <th>Contact</th>
              <th>Total</th>
              <th>Status</th>
              <th>Payment</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="font-sora font-bold text-[14px] text-ink whitespace-nowrap">
                  {o.orderNumber}
                </td>
                <td className="font-manrope text-[12.5px] text-muted whitespace-nowrap">
                  {formatOrderDate(o.createdAt)}
                </td>
                <td className="font-manrope text-[13px] text-muted">{o.contactEmail}</td>
                <td className="font-sora font-bold text-[13.5px] text-ink whitespace-nowrap">
                  {inr(o.total)}
                </td>
                <td>
                  <span className="tier-badge" style={orderStatusStyle(o.status)}>
                    {orderStatusLabel(o.status)}
                  </span>
                </td>
                <td>
                  <span className="tier-badge" style={paymentStatusStyle(o.paymentStatus)}>
                    {paymentStatusLabel(o.paymentStatus)}
                  </span>
                </td>
                <td>
                  <div className="flex items-center justify-end">
                    <Link href={`/admin/orders/${o.id}`} className="btn-ghost">
                      View
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="admin-empty">
                  <p>
                    {status
                      ? `No orders with status ${orderStatusLabel(status)}.`
                      : "No orders placed yet."}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
