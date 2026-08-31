import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import ProductCard from "@/components/shop/ProductCard";
import { listProducts } from "@/lib/db";
import PageHero from "@/components/site/PageHero";
import { Section, IndexLabel } from "@/components/site/Section";

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
      <PageHero
        eyebrow="Official Chennai Lions Store"
        title={["SHOP"]}
        lead={
    <>
      Match-day kit, performance apparel, and tour-tested accessories — engineered for play, built for the gallery. Fan-priced, single units, shipped across India.
    </>
  }
      />

            <Section surface="ivory" size="tight">
          {hasAnything ? (
            <div className="grid gap-[22px] [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
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
            <Reveal
              variant="fade-up"
              className="rounded-[22px] border border-dashed border-black/[0.18] bg-cream-50 p-10 md:p-14 max-w-[720px] mx-auto text-center"
            >
              <div className="font-manrope font-bold text-[10.5px] tracking-[0.28em] text-crimson-600 uppercase">
                Store · Restocking
              </div>
              <h2 className="mt-3 mb-4 font-sora font-extrabold text-[clamp(24px,3.4vw,32px)] leading-[1.15] tracking-[-0.02em] text-ink">
                The Chennai Lions store is between drops.
              </h2>
              <p className="font-manrope text-[15px] leading-[1.68] text-muted">
                New product listings will land here shortly. In the meantime,
                say hello — we&apos;re happy to talk merchandise.
              </p>
              <div className="mt-6">
                <Link
                  href="/contact?topic=Merchandise%20Support"
                  className="cta-gold press"
                  style={{ padding: "12px 22px", fontSize: 13 }}
                >
                  CONTACT MERCHANDISE
                </Link>
              </div>
            </Reveal>
          )}
        </Section>
    </>
  );
}
