import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Ban, CheckCircle2, Circle, RotateCcw } from "lucide-react";
import type { OrderStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { FALLBACK_LOGO, inr } from "@/lib/products";
import { getOrderByIdForAdmin, readShippingSnapshot, canTransition } from "@/lib/orders";
import { formatOrderDate, orderStatusLabel, paymentMethodLabel } from "@/lib/orders-format";
import PageHeader from "@/components/admin/ui/PageHeader";
import { OrderPill, PaymentPill } from "@/components/admin/ui/StatusPill";
import QuickActionButton from "@/components/admin/ui/QuickActionButton";
import ConfirmActionButton from "@/components/admin/ui/ConfirmActionButton";
import PaymentStatusForm from "@/components/admin/orders/PaymentStatusForm";
import { updateOrderStatusAction } from "../actions";

export const metadata: Metadata = {
  title: "Order",
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

/** The happy path, for the progress strip. Cancelled / refunded sit outside it. */
const FLOW: OrderStatus[] = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"];

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const order = await getOrderByIdForAdmin(id);
  if (!order) notFound();

  const shipping = readShippingSnapshot(order);
  const itemCount = order.items.reduce((sum, it) => sum + it.qty, 0);
  // Only the transitions lib/orders.ts's own FORWARD table allows.
  const nextStatuses = ALL_ORDER_STATUSES.filter((s) => canTransition(order.status, s));
  const forward = nextStatuses.filter((s) => s !== "CANCELLED" && s !== "REFUNDED");
  const canCancel = nextStatuses.includes("CANCELLED");
  const canRefund = nextStatuses.includes("REFUNDED");
  const terminal = order.status === "CANCELLED" || order.status === "REFUNDED";
  const flowIndex = FLOW.indexOf(order.status === "PAYMENT_PENDING" ? "PENDING" : order.status);

  return (
    <>
      <PageHeader
        back={{ href: "/admin/orders", label: "Orders" }}
        eyebrow="Order"
        title={order.orderNumber}
        lede={
          <>
            Placed {formatOrderDate(order.createdAt)} · {itemCount} {itemCount === 1 ? "item" : "items"} ·{" "}
            {order.user.name} ({order.user.email})
          </>
        }
        actions={
          <>
            <OrderPill status={order.status} />
            <PaymentPill status={order.paymentStatus} />
          </>
        }
      />

      <div className="adm-grid adm-grid-sidebar">
        <div className="adm-stack">
          <section className="adm-panel">
            <div className="adm-panel-head">
              <h2 className="adm-h3">Fulfilment</h2>
              {!terminal && (
                <div className="adm-flow" aria-label="Order progress">
                  {FLOW.map((s, i) => (
                    <span key={s} className="adm-inline" style={{ gap: 6 }}>
                      {i > 0 && <span className="adm-flow-sep" />}
                      <span className={`adm-flow-step ${i < flowIndex ? "is-done" : i === flowIndex ? "is-current" : ""}`}>
                        {i < flowIndex ? <CheckCircle2 /> : <Circle />}
                        {orderStatusLabel(s)}
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="adm-panel-pad">
              {nextStatuses.length === 0 ? (
                <div className="adm-alert" data-tone="info">
                  <span>
                    This order is {orderStatusLabel(order.status).toLowerCase()} — a final state. No further change is possible.
                  </span>
                </div>
              ) : (
                <>
                  <p className="adm-sub" style={{ marginTop: 0, marginBottom: 12 }}>
                    Currently <strong>{orderStatusLabel(order.status)}</strong>. Only the steps allowed from here are offered.
                    {order.status === "PAYMENT_PENDING" && " Marking Paid also records the payment as received."}
                  </p>
                  <div className="adm-inline">
                    {forward.map((s) => (
                      <QuickActionButton
                        key={s}
                        action={updateOrderStatusAction}
                        fields={{ id: order.id, status: s }}
                        className={`adm-btn ${s === "PAID" || s === "DELIVERED" ? "adm-btn-primary" : ""}`}
                      >
                        Mark {orderStatusLabel(s).toLowerCase()}
                      </QuickActionButton>
                    ))}
                    {canCancel && (
                      <ConfirmActionButton
                        action={updateOrderStatusAction}
                        fields={{ id: order.id, status: "CANCELLED" }}
                        title={`Cancel ${order.orderNumber}?`}
                        description={
                          <>
                            <p>
                              The order becomes <strong>Cancelled</strong> and every line item is returned to stock (
                              {itemCount} {itemCount === 1 ? "unit" : "units"} across {order.items.length}{" "}
                              {order.items.length === 1 ? "product" : "products"}).
                            </p>
                            <p>This cannot be undone. Notify the customer separately — no email is sent automatically.</p>
                          </>
                        }
                        confirmLabel="Cancel order and restock"
                        triggerClassName="adm-btn adm-btn-danger"
                      >
                        <Ban /> Cancel order
                      </ConfirmActionButton>
                    )}
                    {canRefund && (
                      <ConfirmActionButton
                        action={updateOrderStatusAction}
                        fields={{ id: order.id, status: "REFUNDED" }}
                        title={`Mark ${order.orderNumber} as refunded?`}
                        description={
                          <>
                            <p>
                              Records that {inr(order.total)} has been returned to the customer. Stock is <strong>not</strong>{" "}
                              adjusted — put returned goods back through Inventory if they come back saleable.
                            </p>
                            <p>This is a final state and cannot be undone.</p>
                          </>
                        }
                        confirmLabel="Mark refunded"
                        triggerClassName="adm-btn adm-btn-danger"
                      >
                        <RotateCcw /> Refund
                      </ConfirmActionButton>
                    )}
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="adm-panel">
            <div className="adm-panel-head">
              <h2 className="adm-h3">Payment</h2>
              <span className="adm-sub" style={{ margin: 0 }}>
                {paymentMethodLabel(order.paymentMethod)}
              </span>
            </div>
            <div className="adm-panel-pad">
              <PaymentStatusForm orderId={order.id} current={order.paymentStatus} paymentRef={order.paymentRef} />
            </div>
          </section>

          <section className="adm-panel">
            <div className="adm-panel-head">
              <h2 className="adm-h3">Items</h2>
              <span className="adm-sub" style={{ margin: 0 }}>
                Prices frozen at time of order
              </span>
            </div>
            <div className="adm-panel-pad" style={{ paddingTop: 4, paddingBottom: 4 }}>
              <ul className="adm-lines">
                {order.items.map((it) => (
                  <li key={it.id} className="adm-line">
                    <span className="adm-thumb is-contain">
                      <Image src={it.productImage || FALLBACK_LOGO} alt="" width={44} height={44} style={{ width: "100%", height: "100%" }} />
                    </span>
                    <div className="adm-line-copy">
                      <div className="adm-cell-title">
                        <Link href={`/admin/products/${it.productId}/edit`} style={{ color: "inherit", textDecoration: "none" }}>
                          {it.productName}
                        </Link>
                      </div>
                      <div className="adm-cell-sub">
                        {inr(it.unitPrice)} × {it.qty}
                      </div>
                    </div>
                    <div className="adm-line-total">{inr(it.lineTotal)}</div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <div className="adm-grid adm-grid-2">
            <section className="adm-panel adm-panel-pad">
              <div className="adm-kicker">Deliver to</div>
              <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.6 }}>
                <div style={{ fontWeight: 700 }}>{shipping.fullName}</div>
                <div className="adm-tone-muted" style={{ color: "var(--adm-text-2)" }}>
                  {shipping.line1}
                  {shipping.line2 ? `, ${shipping.line2}` : ""}
                  <br />
                  {shipping.city}, {shipping.state} {shipping.postalCode}
                  <br />
                  {shipping.country}
                </div>
              </div>
            </section>
            <section className="adm-panel adm-panel-pad">
              <div className="adm-kicker">Contact</div>
              <dl className="adm-dl" style={{ marginTop: 10 }}>
                <div>
                  <dt>Phone</dt>
                  <dd>
                    <a href={`tel:${shipping.phone || order.contactPhone}`} className="adm-link">
                      {shipping.phone || order.contactPhone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>
                    <a href={`mailto:${order.contactEmail}`} className="adm-link">
                      {order.contactEmail}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt>Account</dt>
                  <dd>
                    {order.user.name} · {order.user.email}
                  </dd>
                </div>
              </dl>
            </section>
          </div>

          {order.notes ? (
            <section className="adm-panel adm-panel-pad">
              <div className="adm-kicker">Customer notes</div>
              <p className="adm-prose" style={{ marginTop: 10 }}>
                {order.notes}
              </p>
            </section>
          ) : null}
        </div>

        <aside className="adm-stack adm-sticky">
          <section className="adm-panel adm-panel-dark adm-panel-pad">
            <div className="adm-kicker">Summary</div>
            <div className="adm-totals" style={{ marginTop: 12 }}>
              <div>
                <span>Subtotal</span>
                <span>{inr(order.subtotal)}</span>
              </div>
              <div>
                <span>Shipping</span>
                <span>{order.shipping > 0 ? inr(order.shipping) : "Free"}</span>
              </div>
              <div>
                <span>GST</span>
                <span>{inr(order.tax)}</span>
              </div>
              <div className="is-total">
                <span>Total</span>
                <span>{inr(order.total)}</span>
              </div>
            </div>
            <div className="adm-divider" style={{ background: "var(--adm-hair-ink)" }} />
            <dl className="adm-dl">
              <div>
                <dt style={{ color: "var(--adm-on-ink-faint)" }}>Method</dt>
                <dd style={{ color: "var(--adm-ivory)" }}>{paymentMethodLabel(order.paymentMethod)}</dd>
              </div>
              <div>
                <dt style={{ color: "var(--adm-on-ink-faint)" }}>Reference</dt>
                <dd style={{ color: "var(--adm-ivory)" }}>{order.paymentRef || "—"}</dd>
              </div>
              <div>
                <dt style={{ color: "var(--adm-on-ink-faint)" }}>Updated</dt>
                <dd style={{ color: "var(--adm-ivory)" }}>{formatOrderDate(order.updatedAt)}</dd>
              </div>
              {order.paymentMethod === "COD" && (
                <div>
                  <dt style={{ color: "var(--adm-on-ink-faint)" }}>COD emails</dt>
                  <dd style={{ color: "var(--adm-ivory)" }}>
                    Customer {order.codUserEmailSentAt ? "sent" : "not sent"} · Admin {order.codAdminEmailSentAt ? "sent" : "not sent"}
                  </dd>
                </div>
              )}
            </dl>
          </section>
        </aside>
      </div>
    </>
  );
}
