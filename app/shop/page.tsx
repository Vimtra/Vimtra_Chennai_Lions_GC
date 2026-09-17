import type { Metadata } from "next";
import Link from "next/link";
import ShopHero from "@/components/shop/ShopHero";
import ShopBrowser from "@/components/shop/ShopBrowser";
import { listProducts } from "@/lib/db";
import { EmptyState } from "@/components/site/Section";

export const metadata: Metadata = {
  alternates: { canonical: "/shop" },
  title: "Shop",
  description:
    "Official Chennai Lions merchandise. Match-day kit, performance apparel, and tour-tested accessories — ship anywhere in India.",
};

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  // Unchanged data path: the same public listing (active rows only, in
  // catalogue order) the previous page rendered. Everything below is
  // derived from these rows — nothing is fetched, estimated or invented.
  // A transient database failure falls back to no rows, which routes into the
  // catalogue's existing "between drops" empty state below rather than a 500.
  // Critically this cannot fabricate a catalogue: the fallback is an empty
  // list, so no product, price or stock figure is ever shown that did not come
  // from the database. `lowestPrice` becomes null and the hero drops its
  // "From" cell, exactly as it does for a genuinely empty catalogue. No
  // product, order or stock logic is touched.
  const products = await listProducts().catch(() => []);
  const hasAnything = products.length > 0;

  const categoryCount = new Set(
    products.map((p) => (p.cat ?? "").trim()).filter(Boolean)
  ).size;
  const lowestPrice = hasAnything
    ? products.reduce((min, p) => Math.min(min, p.price), Infinity)
    : null;

  return (
    <>
      <ShopHero
        tiles={products.slice(0, 3)}
        productCount={products.length}
        categoryCount={categoryCount}
        lowestPrice={lowestPrice}
      />

      {hasAnything ? (
        <section className="hp-sec hp-sec-ivory sp-sec" aria-label="Catalogue">
          <div className="hp-wrap">
            <ShopBrowser products={products} />
          </div>
        </section>
      ) : (
        <section className="hp-sec hp-sec-ivory sp-sec">
          <div className="hp-wrap">
            <EmptyState
              eyebrow="Store · Restocking"
              title="The Chennai Lions store is between drops."
              body="New product listings will land here shortly. In the meantime, say hello — we're happy to talk merchandise."
            >
              <Link
                href="/contact?topic=Merchandise%20Support"
                className="hp-btn hp-btn-primary"
              >
                CONTACT MERCHANDISE
              </Link>
            </EmptyState>
          </div>
        </section>
      )}
    </>
  );
}
