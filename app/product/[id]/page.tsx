import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import ProductCard from "@/components/shop/ProductCard";
import QtyAddToCart from "@/components/shop/QtyAddToCart";
import { FALLBACK_LOGO, inr, productImage } from "@/lib/products";
import { getProductById, listProducts } from "@/lib/db";
import { Section } from "@/components/site/Section";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return { title: "Product · Vimtra Chennai Lions GC" };
  return {
    title: `${product.name} · Vimtra Chennai Lions GC`,
    description: product.desc,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();
  // Inactive products are hidden from the public store — treat as 404.
  if (!product.active) notFound();

  // Related products come from the (active-only) public catalog; drop
  // the current product from the pool.
  const related = (await listProducts())
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  // Resolve the gallery: prefer the M5 `images[]` array, then fall back
  // to the legacy `img` (single). If neither is set, we render the
  // franchise fallback — no phantom empty tiles.
  const gallery: string[] =
    product.images && product.images.length > 0
      ? product.images
      : product.img
        ? [product.img]
        : [];
  const hero = gallery[0] ?? FALLBACK_LOGO;
  const hasHeroImage = gallery.length > 0;

  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= 5;

  return (
    <Section surface="ivory" size="tight">
        {/* Breadcrumbs */}
        <div className="mb-7 font-manrope text-[13px] text-muted font-semibold flex items-center gap-2 flex-wrap">
          <Link href="/shop" className="text-inherit no-underline hover:text-crimson-600">
            Shop
          </Link>
          <span>/</span>
          <span className="text-crimson-600 uppercase tracking-[0.04em]">
            {product.cat}
          </span>
          <span>/</span>
          <span className="text-ink">{product.name}</span>
        </div>

        <div className="product-detail-grid">
          {/* Image side — hero + optional thumbnail strip */}
          <Reveal variant="fade-up" className="grid gap-3">
            <div className="img-card relative">
              {hasHeroImage ? (
                <Image
                  src={hero}
                  alt={product.name}
                  fill
                  sizes="(max-width:900px) 100vw, 480px"
                  className="object-cover"
                />
              ) : (
                <Image
                  src={FALLBACK_LOGO}
                  alt="Vimtra Chennai Lions"
                  width={300}
                  height={300}
                  className="w-1/2 h-1/2 object-contain opacity-85"
                  style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.2))" }}
                />
              )}
              {outOfStock && (
                <div
                  className="absolute top-4 right-4 rounded-[999px] px-3 py-[6px] font-sora font-extrabold text-[10.5px] tracking-[0.16em] uppercase"
                  style={{ background: "rgba(26,21,19,0.92)", color: "#fff" }}
                >
                  Out of stock
                </div>
              )}
              {lowStock && (
                <div
                  className="absolute top-4 right-4 rounded-[999px] px-3 py-[6px] font-sora font-extrabold text-[10.5px] tracking-[0.16em] uppercase"
                  style={{ background: "#C4202A", color: "#fff" }}
                >
                  Only {product.stock} left
                </div>
              )}
            </div>

            {gallery.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {gallery.slice(0, 6).map((src, i) => (
                  <div
                    key={i}
                    className="relative w-[74px] h-[74px] rounded-[12px] overflow-hidden border border-black/[0.08] bg-cream-50"
                  >
                    <Image
                      src={src}
                      alt={`${product.name} — image ${i + 1}`}
                      fill
                      sizes="74px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </Reveal>

          {/* Meta side */}
          <Reveal variant="fade-up" delay={100} className="flex flex-col">
            <span className="font-manrope font-bold text-[11px] tracking-[0.2em] text-crimson-600 uppercase">
              {product.cat}
            </span>
            <h1 className="mt-3 mb-[6px] font-sora font-extrabold text-[38px] tracking-[-0.027em] leading-[1.1] text-ink">
              {product.name}
            </h1>

            <div className="font-sora font-extrabold text-[28px] text-crimson-600 mt-[14px]">
              {inr(product.price)}
            </div>

            <div className="w-full h-px bg-black/[0.08] my-6" />

            <p className="m-0 font-manrope text-[15.5px] leading-[1.68] text-[#3A1215]/85">
              {product.desc}
            </p>

            {/* Retail spec panel — replaces the old "bulk / corporate
                gifting" copy with fan-retail-relevant details. Only
                shows rows that are actually populated. */}
            <div className="mt-5 p-4 bg-cream-50 border border-black/[0.06] rounded-[16px] flex flex-col gap-2">
              <SpecRow
                label="Availability"
                value={
                  outOfStock
                    ? "Out of stock"
                    : lowStock
                      ? `In stock · only ${product.stock} left`
                      : "In stock"
                }
                emphasise
                accent={outOfStock ? "#6B635C" : "#0E8A4F"}
              />
              {product.sku && <SpecRow label="SKU" value={product.sku} />}
              {product.weightGrams ? (
                <SpecRow
                  label="Shipping weight"
                  value={`${product.weightGrams} g`}
                />
              ) : null}
              <SpecRow
                label="Ships from"
                value="Chennai · Delivered across India"
              />
            </div>

            <QtyAddToCart product={product} />
          </Reveal>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-[84px]">
            <h2 className="font-sora font-extrabold text-[26px] tracking-[-0.02em] mb-7 text-ink">
              You May Also Like
            </h2>
            <div className="related-grid">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} delay={i * 60} />
              ))}
            </div>
          </div>
        )}
      </Section>
  );
}

function SpecRow({
  label,
  value,
  emphasise,
  accent,
}: {
  label: string;
  value: string;
  emphasise?: boolean;
  accent?: string;
}) {
  return (
    <div className="flex justify-between font-manrope text-[13px] text-muted">
      <span>{label}</span>
      <strong
        className="text-ink"
        style={emphasise && accent ? { color: accent } : undefined}
      >
        {value}
      </strong>
    </div>
  );
}
