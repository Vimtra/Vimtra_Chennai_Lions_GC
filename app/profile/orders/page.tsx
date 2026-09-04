import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { listOrdersForUser } from "@/lib/orders";
import PageHero from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import AccountNav from "@/components/profile/AccountNav";
import OrdersList from "@/components/profile/OrdersList";

export const metadata: Metadata = {
  title: "My Orders · Vimtra Chennai Lions GC",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Authenticated order history. listOrdersForUser(user.id) scopes every
 * row to the signed-in buyer — no other account's orders can appear.
 */
export default async function ProfileOrdersPage() {
  const user = await requireUser("/profile/orders");
  const orders = await listOrdersForUser(user.id);

  return (
    <>
      <PageHero
        variant="compact"
        eyebrow="Account"
        title={["MY ORDERS"]}
        lead={
          orders.length === 0
            ? "Your shop orders will appear here."
            : `${orders.length} order${orders.length === 1 ? "" : "s"}`
        }
      />

      <Section surface="ivory" size="tight">
        <div className="profile-page acct-shell">
          <AccountNav />
          <div className="acct-body">
            <header className="acct-section-head">
              <p className="acct-kicker">Shop</p>
              <h2 className="acct-section-title">Order history</h2>
              <p className="acct-section-lead">
                Open an order for products, amounts, delivery details, and
                current status.
              </p>
            </header>
            <OrdersList orders={orders} />
          </div>
        </div>
      </Section>
    </>
  );
}
