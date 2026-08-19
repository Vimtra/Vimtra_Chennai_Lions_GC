import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import AeText from "@/components/AeText";
import ProductCard from "@/components/shop/ProductCard";
import { listProducts } from "@/lib/db";

export const metadata: Metadata = {
  title: "Shop · Vimtra Chennai Lions GC",
  description:
    "Official IGPL franchise merchandise. Match-day kit, performance apparel, and tour-tested accessories.",
};

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await listProducts();

  return (
    <>
      <section
        className="relative overflow-hidden px-8 pt-[88px] pb-[70px]"
        style={{
          background:
            "radial-gradient(125% 105% at 50% -5%,#C9242E 0%,#A8181F 58%,#871119 100%)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 84% 16%,rgba(233,203,142,0.16),transparent 42%)",
          }}
        />
        <div className="relative max-w-[1200px] mx-auto">
          <Reveal
            variant="fade-up"
            className="font-manrope font-bold text-[12px] tracking-[0.32em] text-[#E9CB8E] uppercase"
          >
            Vimtra × Lions Pro Gear
          </Reveal>
          <AeText
            text="SHOP"
            mode="words"
            as="h1"
            className="mt-[14px] font-sora font-extrabold text-white"
            style={{
              fontSize: "clamp(56px,9.4vw,142px)",
              lineHeight: 0.9,
              letterSpacing: "-0.035em",
            }}
          />
          <Reveal
            variant="fade-up"
            delay={100}
            as="p"
            className="max-w-[540px] mt-[22px] font-manrope text-[16px] leading-[1.6] text-white/85"
          >
            Official IGPL franchise merchandise. Match-day kit, performance
            apparel, and tour-tested accessories — engineered for play, built for
            the gallery.
          </Reveal>
        </div>
      </section>

      <section className="bg-cream-100 px-8 pt-16 pb-24">
        <div className="max-w-[1200px] mx-auto">
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
        </div>
      </section>
    </>
  );
}
