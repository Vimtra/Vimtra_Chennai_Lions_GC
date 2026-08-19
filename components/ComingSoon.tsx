import Link from "next/link";
import AeText from "@/components/AeText";
import Reveal from "@/components/Reveal";

/**
 * Branded placeholder for content pages whose full static markup has not yet
 * been ported to the App Router. Keeps navigation working (no 404s) while the
 * migration continues page-by-page.
 */
export default function ComingSoon({
  eyebrow,
  title,
  blurb,
}: {
  eyebrow: string;
  title: string;
  blurb: string;
}) {
  return (
    <section
      className="relative overflow-hidden px-8 pt-[96px] pb-[120px] min-h-[70vh] flex items-center"
      style={{
        background:
          "radial-gradient(125% 105% at 50% -5%,#C9242E 0%,#A8181F 58%,#871119 100%)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 84% 16%,rgba(233,203,142,0.16),transparent 42%),radial-gradient(circle at 12% 88%,rgba(233,203,142,0.10),transparent 45%)",
        }}
      />
      <div className="relative max-w-[1200px] mx-auto w-full">
        <div className="font-manrope font-bold text-[12px] tracking-[0.32em] text-[#E9CB8E] uppercase">
          {eyebrow}
        </div>
        <AeText
          text={title}
          mode="words"
          as="h1"
          className="mt-[14px] font-sora font-extrabold text-white"
          style={{
            fontSize: "clamp(48px,8vw,120px)",
            lineHeight: 0.9,
            letterSpacing: "-0.035em",
          }}
        />
        <Reveal
          variant="fade-up"
          delay={120}
          as="p"
          className="max-w-[560px] mt-6 font-manrope text-[16px] leading-[1.65] text-white/85"
        >
          {blurb}
        </Reveal>
        <Reveal variant="fade-up" delay={220} className="mt-8 flex gap-4 flex-wrap">
          <Link href="/" className="cta-gold press">
            BACK HOME
          </Link>
          <Link
            href="/shop"
            className="press inline-flex items-center gap-2 px-5 py-[11px] rounded-[30px] border border-white/30 text-white font-manrope font-bold text-[13.5px] no-underline"
          >
            VISIT THE SHOP →
          </Link>
        </Reveal>
        <div className="mt-10 font-manrope text-[12px] tracking-[0.3em] text-white/40 uppercase">
          Being migrated to Next.js · Check back soon
        </div>
      </div>
    </section>
  );
}
