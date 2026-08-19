import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import AeText from "@/components/AeText";

export const metadata: Metadata = {
  title: "News · Vimtra Chennai Lions GC",
  description: "From the Den — features, player news, tournament wraps, and notebook from the Vimtra Chennai Lions.",
};

const FEATURE = {
  init: "GB",
  cat: "Feature",
  title: 'Bhullar’s Lions move: “The franchise window is the right window.”',
  excerpt:
    "The 11-time Asian Tour winner sits down to talk roster construction, the Tamil Nadu junior pipeline, and why a long-term partnership made sense at this stage of his career.",
  byline: "By Chennai Lions Editorial · 5 min read",
};

const CARDS = [
  { init: "HS", cat: "Player News", title: "Sethie returns to Coimbatore as defending champion", excerpt: "A look at the playoff that lifted him 70 places on the PGTI in a single week." },
  { init: "R1", cat: "Tournament Wrap", title: "Hyderabad T3 finish: the read on a steady Lions week", excerpt: "Bhullar's T2 individual and a solid team finish set up the Chennai Open run." },
  { init: "AC", cat: "Academy", title: "Five Tamil Nadu schools enter Year 2 of the Lions Junior Academy", excerpt: "A 40-club kit drop and a six-month coaching plan kick off this month." },
  { init: "SD", cat: "Notebook", title: "Dwivedi's 7-under: anatomy of an IGPL '25 standout round", excerpt: "Strokes-gained breakdown of the round that earned him a T4." },
  { init: "YC", cat: "Rising Talent", title: "Yashas Chandra: the quiet four-round case", excerpt: "Bharath Classic 75-68 to one-under shows the swing is closer than the position suggests." },
  { init: "VV", cat: "Franchise", title: "Vimtra Ventures extends Lions commitment through 2030", excerpt: "A multi-year extension covering roster, infrastructure, and Pride memberships." },
];

function ImgBlock({ init, className = "", big = false }: { init: string; className?: string; big?: boolean }) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#C9242E] to-[#871119] ${className}`}
    >
      <div className="absolute top-0 right-0 w-20 h-20 opacity-90 bg-gradient-to-br from-[#E6C57E] to-[#C39A52] [clip-path:polygon(100%_0,0_0,100%_100%)]" />
      <span className={`font-sora font-extrabold tracking-[-0.04em] text-white/20 ${big ? "text-[96px]" : "text-[80px]"}`}>
        {init}
      </span>
    </div>
  );
}

export default function NewsPage() {
  return (
    <>
      <section
        className="relative overflow-hidden px-8 pt-[88px] pb-[70px]"
        style={{ background: "radial-gradient(125% 105% at 50% -5%,#C9242E 0%,#A8181F 58%,#871119 100%)" }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 84% 16%,rgba(233,203,142,0.16),transparent 42%)" }} />
        <div className="relative max-w-[1200px] mx-auto">
          <div className="font-manrope font-bold text-[12px] tracking-[0.32em] text-[#E9CB8E] uppercase">From the Den</div>
          <AeText
            text="NEWS"
            mode="words"
            as="h1"
            className="mt-[14px] font-sora font-extrabold text-white"
            style={{ fontSize: "clamp(56px,9.4vw,142px)", lineHeight: 0.9, letterSpacing: "-0.035em" }}
          />
        </div>
      </section>

      <section className="bg-cream-100 px-8 pt-[72px] pb-24">
        <div className="max-w-[1200px] mx-auto">
          {/* Feature */}
          <Reveal variant="fade-up" className="mb-8">
            <Link href="#" className="lift flex flex-wrap no-underline text-inherit bg-cream-50 border border-black/[0.06] rounded-[22px] overflow-hidden">
              <ImgBlock init={FEATURE.init} big className="flex-[1.2] min-w-[280px] min-h-[340px]" />
              <div className="flex-1 min-w-[280px] p-[38px] flex flex-col justify-center">
                <div className="font-manrope font-bold text-[10.5px] tracking-[0.18em] uppercase text-crimson-600">{FEATURE.cat}</div>
                <h2 className="my-[14px] mb-3 font-sora font-extrabold text-[36px] leading-[1.06] tracking-[-0.022em]">{FEATURE.title}</h2>
                <p className="m-0 mb-[18px] font-manrope text-[15px] leading-[1.62] text-muted">{FEATURE.excerpt}</p>
                <div className="font-manrope text-[13px] text-[#9b8f85]">{FEATURE.byline}</div>
              </div>
            </Link>
          </Reveal>

          {/* Grid */}
          <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
            {CARDS.map((c, i) => (
              <Reveal key={c.title} variant="fade-up" delay={(i % 3) * 80}>
                <Link href="#" className="lift flex flex-col h-full no-underline text-inherit bg-cream-50 border border-black/[0.06] rounded-[22px] overflow-hidden">
                  <ImgBlock init={c.init} className="aspect-video" />
                  <div className="p-6">
                    <div className="font-manrope font-bold text-[10.5px] tracking-[0.18em] uppercase text-crimson-600">{c.cat}</div>
                    <h3 className="mt-[10px] mb-2 font-sora font-bold text-[20px] leading-[1.2] tracking-[-0.01em]">{c.title}</h3>
                    <p className="m-0 font-manrope text-[13.5px] leading-[1.55] text-muted">{c.excerpt}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
