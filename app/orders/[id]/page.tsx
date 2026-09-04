import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { FALLBACK_LOGO, inr } from "@/lib/products";
import PageMasthead from "@/components/site/PageMasthead";
import { Section } from "@/components/site/Section";
import AccountNav from "@/components/profile/AccountNav";
import {
  getOrderById,
  readShippingSnapshot,
  type OrderWithItems,
} from "@/lib/orders";
import {
  formatOrderDate,
  orderStatusLabel,
  orderStatusStyle,
  paymentStatusLabel,
  paymentStatusStyle,
  paymentMethodLabel,
} from "@/lib/orders-format";

export const metadata: Metadata = {
  title: "Order · Vimtra Chennai Lions GC",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Post-purchase order confirmation / detail.
 *
 * Ownership is enforced via getOrderById(user.id, id) — another user
 * asking for the same URL sees a 404, not a redirect (avoids leaking
 * that the id exists). Admin uses a separate helper when that console
 * ships.
 *
 * Renders the frozen `shippingSnapshot` (via readShippingSnapshot) —
 * never re-derived from the Address table, so historical orders keep
 * their original shipping details even if the address book row is
 * later edited or deleted.
 */
export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Preserve the order URL as `?next=` so a receipt-email click that
  // lands the user on the sign-in page bounces them back to this
  // exact confirmation after login.
  const user = await requireUser(`/orders/${id}`);
  const order = await getOrderById(user.id, id);
  if (!order) notFound();

  const shipping = readShippingSnapshot(order);
  const isFresh =
    Date.now() - new Date(order.createdAt).getTime() < 5 * 60 * 1000; // <5 min
  const itemCount = order.items.reduce((sum, it) => sum + it.qty, 0);

  return (
    <>
      <PageMasthead
        eyebrow={isFresh ? "Thank you · Order Placed" : "Account · Order"}
        title={[order.orderNumber]}
        line={`Placed on ${formatOrderDate(order.createdAt)} · ${itemCount} ${
          itemCount === 1 ? "item" : "items"
        }`}
        above={
          <Link href="/profile/orders" className="hp-pagehero-back">
            ← My Orders
          </Link>
        }
        stats={[
          { k: "Items", v: String(itemCount) },
          { k: "Total", v: inr(order.total) },
        ]}
      />

      <Section surface="ivory" size="tight">
        <div className="profile-page acct-shell is-wide">
          <AccountNav />

          <div className="acct-order-detail grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 items-start">
            <div className="grid gap-6 min-w-0">
              {isFresh && <SuccessBanner order={order} />}

              <section className="acct-panel">
                <h2 className="acct-panel-title">Items</h2>
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

              <section className="acct-panel">
                <h2 className="acct-panel-title">Delivery</h2>
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
                <section className="acct-panel">
                  <h2 className="acct-panel-title">Notes</h2>
                  <div className="font-manrope text-[13.5px] text-muted whitespace-pre-line">
                    {order.notes}
                  </div>
                </section>
              ) : null}
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
                  <span>
                    {order.shipping > 0 ? inr(order.shipping) : "Free"}
                  </span>
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
                  <StatusChip
                    label={`Order · ${orderStatusLabel(order.status)}`}
                    style={orderStatusStyle(order.status)}
                  />
                  <StatusChip
                    label={`Payment · ${paymentStatusLabel(order.paymentStatus)}`}
                    style={paymentStatusStyle(order.paymentStatus)}
                  />
                </div>
                <div className="mt-4 font-manrope text-[12.5px] text-white/70">
                  Payment method: {paymentMethodLabel(order.paymentMethod)}
                </div>
                <div className="mt-6 flex flex-col gap-2">
                  <Link
                    href="/profile/orders"
                    className="hp-btn hp-btn-primary w-full justify-center"
                  >
                    MY ORDERS
                  </Link>
                  <Link
                    href="/shop"
                    className="hp-btn hp-btn-ghost hp-on-dark w-full justify-center"
                  >
                    Keep shopping
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </Section>
    </>
  );
}

function SuccessBanner({ order }: { order: OrderWithItems }) {
  return (
    <div
      data-rise
      className="flex items-center gap-4 border-b border-black/[0.08] pb-5"
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
        style={{ background: "rgba(14,138,79,0.10)", color: "#0E8A4F" }}
      >
        <CheckCircle2 className="w-6 h-6" />
      </div>
      <div>
        <div className="font-sora font-extrabold text-[19px] text-ink">
          Order confirmed
        </div>
        <div className="font-manrope text-[13.5px] text-muted mt-1">
          {order.orderNumber} · we&apos;ll email {order.contactEmail} with
          updates as it moves through processing.
        </div>
      </div>
    </div>
  );
}

function StatusChip({
  label,
  style,
}: {
  label: string;
  style: { background: string; color: string };
}) {
  return (
    <span className="tier-badge" style={{ ...style, whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}
