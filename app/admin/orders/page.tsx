import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import type { OrderStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { searchOrdersForAdmin } from "@/lib/orders";
import { inr } from "@/lib/products";
import { formatOrderDate, orderStatusLabel, paymentMethodLabel } from "@/lib/orders-format";
import PageHeader from "@/components/admin/ui/PageHeader";
import SearchForm from "@/components/admin/ui/SearchForm";
import Pagination, { PAGE_SIZE, parsePage } from "@/components/admin/ui/Pagination";
import EmptyState from "@/components/admin/ui/EmptyState";
import { OrderPill, PaymentPill } from "@/components/admin/ui/StatusPill";

export const metadata: Metadata = {
  title: "Orders",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// Real enum values only — no invented statuses.
const STATUS_TABS: { key: OrderStatus | "ALL"; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "PAYMENT_PENDING", label: "Awaiting payment" },
  { key: "PAID", label: "Paid" },
  { key: "PROCESSING", label: "Processing" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "CANCELLED", label: "Cancelled" },
  { key: "REFUNDED", label: "Refunded" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  await requireAdmin();
  const { status: rawStatus, q, page: rawPage } = await searchParams;
  const status =
    rawStatus && rawStatus !== "ALL" && (STATUS_TABS as { key: string }[]).some((t) => t.key === rawStatus)
      ? (rawStatus as OrderStatus)
      : undefined;
  const page = parsePage(rawPage);
  const { rows, total } = await searchOrdersForAdmin({ status, q, page, pageSize: PAGE_SIZE });

  const keep = { status: status ?? undefined };
  const chipHref = (key: string) => {
    const sp = new URLSearchParams();
    if (key !== "ALL") sp.set("status", key);
    if (q) sp.set("q", q);
    const qs = sp.toString();
    return qs ? `/admin/orders?${qs}` : "/admin/orders";
  };

  return (
    <>
      <PageHeader
        eyebrow="Commerce"
        title="Orders"
        lede="Every order placed through the shop. Open an order to advance its status, record payment, or cancel and restock."
      />

      <div className="adm-toolbar">
        <SearchForm action="/admin/orders" q={q} keep={keep} placeholder="Search order no., name, email or phone" />
        <div className="adm-chips-scroll">
          <div className="adm-chips">
            {STATUS_TABS.map((t) => (
              <Link key={t.key} href={chipHref(t.key)} className={`adm-chip ${(status ?? "ALL") === t.key ? "is-active" : ""}`}>
                {t.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="adm-panel">
        {rows.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag />}
            title={q ? "No orders match that search" : status ? `No ${orderStatusLabel(status).toLowerCase()} orders` : "No orders yet"}
            body={
              q
                ? "Try the order number, the customer's name, or the email or phone used at checkout."
                : status
                  ? "Orders move here as their status changes."
                  : "Orders placed through the shop will appear here."
            }
            actions={q || status ? <Link href="/admin/orders" className="adm-btn adm-btn-sm">Clear filters</Link> : undefined}
          />
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table is-responsive">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Placed</th>
                  <th className="adm-td-right">Total</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th className="adm-td-actions">
                    <span className="adm-sr">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((o) => (
                  <tr key={o.id} className={o.status === "PENDING" ? "is-highlight" : undefined}>
                    <td className="adm-td-primary">
                      <Link href={`/admin/orders/${o.id}`} className="adm-cell-title" style={{ textDecoration: "none" }}>
                        {o.orderNumber}
                      </Link>
                      <div className="adm-cell-sub">{paymentMethodLabel(o.paymentMethod)}</div>
                    </td>
                    <td data-label="Customer">
                      <div style={{ fontWeight: 600 }}>{o.user.name}</div>
                      <div className="adm-cell-sub">{o.contactEmail}</div>
                    </td>
                    <td data-label="Placed" className="adm-td-muted adm-td-nowrap">
                      {formatOrderDate(o.createdAt)}
                    </td>
                    <td data-label="Total" className="adm-td-num adm-td-right">
                      {inr(o.total)}
                    </td>
                    <td data-label="Status">
                      <OrderPill status={o.status} />
                    </td>
                    <td data-label="Payment">
                      <PaymentPill status={o.paymentStatus} />
                    </td>
                    <td className="adm-td-actions">
                      <div className="adm-actions">
                        <Link href={`/admin/orders/${o.id}`} className="adm-btn adm-btn-sm">
                          Open
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination action="/admin/orders" page={page} total={total} params={{ status, q }} />
      </div>
    </>
  );
}
