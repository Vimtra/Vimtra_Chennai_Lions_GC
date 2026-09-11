import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ShoppingBag,
  Mail,
  Boxes,
  Newspaper,
  CalendarDays,
  Home,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getDashboardData, LOW_STOCK_THRESHOLD } from "@/lib/admin-dashboard";
import { inr } from "@/lib/products";
import { formatOrderDate } from "@/lib/orders-format";
import { formatContactDate } from "@/lib/contact-messages-format";
import { formatFixtureDate } from "@/lib/fixtures-format";
import PageHeader from "@/components/admin/ui/PageHeader";
import EmptyState from "@/components/admin/ui/EmptyState";
import { OrderPill, PaymentPill, FixturePill, StockPill } from "@/components/admin/ui/StatusPill";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * The dashboard is an inbox, not a scoreboard: it lists what an operator
 * has to deal with right now — orders waiting, enquiries unread, products
 * that cannot be sold, drafts not yet published, and the fixture in play.
 * Every number is a live count of stored rows.
 */
export default async function AdminDashboard() {
  const user = await requireAdmin();
  const data = await getDashboardData();
  const a = data.attention;

  const attention: {
    n: number;
    title: string;
    sub: string;
    href: string;
    tone: "danger" | "warn" | "info";
    icon: React.ReactNode;
  }[] = [];
  if (a.pendingOrders > 0)
    attention.push({
      n: a.pendingOrders,
      title: `Order${a.pendingOrders === 1 ? "" : "s"} awaiting action`,
      sub: "Placed and not yet acknowledged.",
      href: "/admin/orders?status=PENDING",
      tone: "danger",
      icon: <ShoppingBag />,
    });
  if (a.paymentPendingOrders > 0)
    attention.push({
      n: a.paymentPendingOrders,
      title: `Order${a.paymentPendingOrders === 1 ? "" : "s"} awaiting payment`,
      sub: "Invoice sent; payment not yet recorded.",
      href: "/admin/orders?status=PAYMENT_PENDING",
      tone: "warn",
      icon: <ShoppingBag />,
    });
  if (a.processingOrders > 0)
    attention.push({
      n: a.processingOrders,
      title: `Order${a.processingOrders === 1 ? "" : "s"} in processing`,
      sub: "Being prepared — mark as shipped when dispatched.",
      href: "/admin/orders?status=PROCESSING",
      tone: "info",
      icon: <ShoppingBag />,
    });
  if (a.newMessages > 0)
    attention.push({
      n: a.newMessages,
      title: `Unread enquir${a.newMessages === 1 ? "y" : "ies"}`,
      sub: "Submitted through the contact form.",
      href: "/admin/messages?status=NEW",
      tone: "danger",
      icon: <Mail />,
    });
  if (a.outOfStock > 0)
    attention.push({
      n: a.outOfStock,
      title: `Visible product${a.outOfStock === 1 ? "" : "s"} out of stock`,
      sub: "Listed on the shop but cannot be bought.",
      href: "/admin/inventory?stock=OUT_OF_STOCK",
      tone: "warn",
      icon: <Boxes />,
    });
  if (a.lowStock > 0)
    attention.push({
      n: a.lowStock,
      title: `Product${a.lowStock === 1 ? "" : "s"} running low`,
      sub: `${LOW_STOCK_THRESHOLD} units or fewer remaining.`,
      href: "/admin/inventory?stock=LOW_STOCK",
      tone: "warn",
      icon: <Boxes />,
    });
  if (a.draftNews > 0)
    attention.push({
      n: a.draftNews,
      title: `Official news draft${a.draftNews === 1 ? "" : "s"}`,
      sub: "Written but not yet published to /news.",
      href: "/admin/news?status=DRAFT",
      tone: "info",
      icon: <Newspaper />,
    });
  if (a.featuredNews === 0)
    attention.push({
      n: 0,
      title: "Nothing featured on the home page",
      sub: "The home news section is empty until a published story is marked “Feature on Home”.",
      href: "/admin/news",
      tone: "info",
      icon: <Home />,
    });

  const { liveFixture, nextFixture } = data.season;
  const f = data.facts;

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title={`Good day, ${user.name.split(" ")[0]}`}
        lede="What needs attention across the shop, the season and the newsroom. Changes made here publish to the live site."
      />

      <div className="adm-grid adm-grid-sidebar">
        <div className="adm-stack">
          <section className="adm-panel">
            <div className="adm-panel-head">
              <h2 className="adm-h3">Needs attention</h2>
              <span className="adm-sub" style={{ margin: 0 }}>
                {attention.length} item{attention.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="adm-panel-pad">
              {attention.length === 0 ? (
                <div className="adm-clear">
                  <CheckCircle2 />
                  All clear — no orders, enquiries, stock or drafts are waiting on you.
                </div>
              ) : (
                <div className="adm-attn">
                  {attention.map((it) => (
                    <Link key={it.title} href={it.href} className="adm-attn-item" data-tone={it.tone}>
                      <span className="adm-attn-n">{it.n > 0 ? it.n : "—"}</span>
                      <span className="adm-attn-copy">
                        <span className="adm-attn-title">{it.title}</span>
                        <span className="adm-attn-sub" style={{ display: "block" }}>
                          {it.sub}
                        </span>
                      </span>
                      <ArrowRight className="adm-attn-arrow" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="adm-panel">
            <div className="adm-panel-head">
              <h2 className="adm-h3">Recent orders</h2>
              <Link href="/admin/orders" className="adm-link">
                All orders →
              </Link>
            </div>
            {data.recentOrders.length === 0 ? (
              <EmptyState compact title="No orders yet" body="Orders placed through the shop will appear here." />
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
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentOrders.map((o) => (
                      <tr key={o.id}>
                        <td className="adm-td-primary">
                          <Link href={`/admin/orders/${o.id}`} className="adm-cell-title" style={{ textDecoration: "none" }}>
                            {o.orderNumber}
                          </Link>
                        </td>
                        <td data-label="Customer" className="adm-td-muted">
                          {o.user.name}
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="adm-panel">
            <div className="adm-panel-head">
              <h2 className="adm-h3">Stock to watch</h2>
              <Link href="/admin/inventory" className="adm-link">
                Inventory →
              </Link>
            </div>
            {data.lowStockProducts.length === 0 ? (
              <EmptyState
                compact
                title="Stock is healthy"
                body={`No visible product is at or below ${LOW_STOCK_THRESHOLD} units.`}
              />
            ) : (
              <div className="adm-table-wrap">
                <table className="adm-table is-responsive">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th className="adm-td-right">Price</th>
                      <th>Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.lowStockProducts.map((p) => (
                      <tr key={p.id}>
                        <td className="adm-td-primary">
                          <Link href={`/admin/products/${p.id}/edit`} className="adm-cell-title" style={{ textDecoration: "none" }}>
                            {p.name}
                          </Link>
                          <div className="adm-cell-sub">{p.sku ? <span className="adm-mono">{p.sku}</span> : p.id}</div>
                        </td>
                        <td data-label="Category" className="adm-td-muted">
                          {p.cat}
                        </td>
                        <td data-label="Price" className="adm-td-num adm-td-right">
                          {inr(p.price)}
                        </td>
                        <td data-label="Stock">
                          <StockPill stock={p.stock} active={p.active} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <div className="adm-stack">
          <section className="adm-panel adm-panel-dark adm-panel-pad">
            <div className="adm-kicker">Season</div>
            {liveFixture ? (
              <>
                <div className="adm-inline" style={{ marginTop: 10 }}>
                  <FixturePill status="LIVE" />
                </div>
                <h2 className="adm-h2" style={{ marginTop: 10 }}>
                  {liveFixture.name}
                </h2>
                <p className="adm-sub">
                  {liveFixture.courseName ? `${liveFixture.courseName} · ` : ""}
                  {liveFixture.city} · {formatFixtureDate(liveFixture)}
                </p>
                <div className="adm-inline" style={{ marginTop: 14 }}>
                  <Link href={`/admin/scores?fixtureId=${liveFixture.id}`} className="adm-btn adm-btn-sm">
                    Enter scores
                  </Link>
                  <Link href="/admin/leaderboards" className="adm-btn adm-btn-sm adm-btn-ink">
                    Standings
                  </Link>
                </div>
              </>
            ) : nextFixture ? (
              <>
                <div className="adm-inline" style={{ marginTop: 10 }}>
                  <FixturePill status="UPCOMING" />
                </div>
                <h2 className="adm-h2" style={{ marginTop: 10 }}>
                  {nextFixture.name}
                </h2>
                <p className="adm-sub">
                  {nextFixture.courseName ? `${nextFixture.courseName} · ` : ""}
                  {nextFixture.city} · {formatFixtureDate(nextFixture)}
                </p>
                <div className="adm-inline" style={{ marginTop: 14 }}>
                  <Link href={`/admin/fixtures/${nextFixture.id}/edit`} className="adm-btn adm-btn-sm">
                    <CalendarDays /> Edit fixture
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h2 className="adm-h2" style={{ marginTop: 10 }}>
                  No fixture scheduled
                </h2>
                <p className="adm-sub">Nothing is live or upcoming. Add the calendar under Fixtures.</p>
                <div className="adm-inline" style={{ marginTop: 14 }}>
                  <Link href="/admin/fixtures/new" className="adm-btn adm-btn-sm">
                    <CalendarDays /> Add fixture
                  </Link>
                </div>
              </>
            )}
          </section>

          <section className="adm-panel">
            <div className="adm-panel-head">
              <h2 className="adm-h3">New enquiries</h2>
              <Link href="/admin/messages" className="adm-link">
                Inbox →
              </Link>
            </div>
            {data.recentMessages.length === 0 ? (
              <EmptyState compact title="Inbox is clear" body="No unread enquiries." />
            ) : (
              <ul className="adm-lines" style={{ padding: "0 20px" }}>
                {data.recentMessages.map((m) => (
                  <li key={m.id} className="adm-line">
                    <div className="adm-line-copy">
                      <div className="adm-cell-title">{m.name}</div>
                      <div className="adm-cell-sub">
                        {m.category} · {formatContactDate(m.createdAt)}
                      </div>
                    </div>
                    <Link href={`/admin/messages?status=NEW&open=${m.id}`} className="adm-btn adm-btn-sm adm-btn-ghost">
                      Read
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="adm-facts">
            <Link href="/admin/orders" className="adm-fact">
              <div className="adm-fact-n">{f.orderTotal}</div>
              <div className="adm-fact-l">Orders, all time</div>
            </Link>
            <Link href="/admin/products" className="adm-fact">
              <div className="adm-fact-n">
                {f.activeProducts}
                <span className="adm-tone-muted" style={{ fontSize: 13 }}>
                  {" "}
                  / {f.allProducts}
                </span>
              </div>
              <div className="adm-fact-l">Products live</div>
            </Link>
            <Link href="/admin/news" className="adm-fact">
              <div className="adm-fact-n">{f.publishedNews}</div>
              <div className="adm-fact-l">News published</div>
            </Link>
            <Link href="/admin/media" className="adm-fact">
              <div className="adm-fact-n">{f.publishedMedia}</div>
              <div className="adm-fact-l">Media published</div>
            </Link>
            <Link href="/admin/fixtures" className="adm-fact">
              <div className="adm-fact-n">{f.fixtureTotal}</div>
              <div className="adm-fact-l">Fixtures</div>
            </Link>
            <Link href="/admin/users" className="adm-fact">
              <div className="adm-fact-n">{f.userTotal}</div>
              <div className="adm-fact-l">Accounts</div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
