import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import Reveal from "@/components/Reveal";
import { FALLBACK_LOGO, inr } from "@/lib/products";
import PageHero from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
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
 * that the id exists). Admin uses the separate /admin/orders/[id]
 * route (Phase 5.5) with a different helper.
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

  return (
    <>
      <PageHero
        eyebrow={isFresh ? "Thank you · Order Placed" : "Order Details"}
        title={[order.orderNumber]}
        lead={`Placed on ${formatOrderDate(order.createdAt)}`}
      />

      <Section surface="ivory" size="tight">
          <div className="grid gap-6">
            {isFresh && <SuccessBanner order={order} />}

            <SectionCard title="Items">
              <div className="grid gap-3">
                {order.items.map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center gap-4 py-2 border-b border-black/[0.06] last:border-b-0"
                  >
                    <div className="relative w-[60px] h-[60px] rounded-[10px] overflow-hidden bg-cream-100 shrink-0 flex items-center justify-center">
                      <Image
                        src={it.productImage || FALLBACK_LOGO}
                        alt={it.productName}
                        width={60}
                        height={60}
                        className="object-contain w-full h-full"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-sora font-bold text-[15px] text-ink">
                        {it.productName}
                      </div>
                      <div className="font-manrope text-[12.5px] text-muted">
                        {inr(it.unitPrice)} × {it.qty}
                      </div>
                    </div>
                    <div className="font-sora font-extrabold text-[15px] text-crimson-600">
                      {inr(it.lineTotal)}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Delivery">
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
            </SectionCard>

            {order.notes && (
              <SectionCard title="Notes">
                <div className="font-manrope text-[13.5px] text-muted whitespace-pre-line">
                  {order.notes}
                </div>
              </SectionCard>
            )}
          </div>

          <aside className="lg:sticky lg:top-24">
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
                  className="cta-gold press w-full py-[13px] text-[13.5px] tracking-[0.06em] justify-center inline-flex"
                  style={{ textDecoration: "none" }}
                >
                  MY ORDERS
                </Link>
                <Link
                  href="/shop"
                  className="btn-ghost justify-center"
                  style={{ textDecoration: "none" }}
                >
                  Keep shopping
                </Link>
              </div>
            </div>
          </aside>
        </Section>
    </>
  );
}

// ---------------------------------------------------------------------------

function SuccessBanner({ order }: { order: OrderWithItems }) {
  return (
    <Reveal
      variant="fade-up"
      className="flex items-center gap-4 bg-white border border-black/[0.07] rounded-[20px] p-5"
      style={{ boxShadow: "0 26px 60px -38px rgba(14,138,79,0.35)" }}
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
    </Reveal>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="hp-panel">
      <div className="mb-4 font-sora font-extrabold text-[18px] tracking-[-0.005em] text-ink">
        {title}
      </div>
      {children}
    </section>
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
    <span
      className="tier-badge"
      style={{ ...style, whiteSpace: "nowrap" }}
    >
      {label}
    </span>
  );
}
