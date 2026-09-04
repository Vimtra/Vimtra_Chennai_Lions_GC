import type { Metadata } from "next";
import Link from "next/link";
import ProductCard from "@/components/shop/ProductCard";
import { listProducts } from "@/lib/db";
import StoryHero from "@/components/site/StoryHero";
import { Section, EmptyState } from "@/components/site/Section";

export const metadata: Metadata = {
  title: "Shop · Vimtra Chennai Lions GC",
  description:
    "Official Chennai Lions merchandise. Match-day kit, performance apparel, and tour-tested accessories — ship anywhere in India.",
};

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await listProducts();
  const hasAnything = products.length > 0;

  return (
    <>
      <StoryHero
        eyebrow="Official Chennai Lions Store"
        title={["SHOP"]}
        line="Match-day kit, performance apparel, and tour-tested accessories — engineered for play, built for the gallery. Fan-priced, single units, shipped across India."
        image="/assets/photo/gd-perf-putt-hole.jpg"
        imageAlt="A putter and ball beside the hole on a green"
        imagePosition="50% 55%"
      />

            <Section surface="ivory" size="tight">
        {hasAnything ? (
          <div className="shop-grid">
            {products.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                withButton
                delay={(i % 4) * 60}
              />
            ))}
          </div>
        ) : (
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
        )}
      </Section>
    </>
  );
}
