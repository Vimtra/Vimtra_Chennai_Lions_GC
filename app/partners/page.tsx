import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import AeText from "@/components/AeText";

export const metadata: Metadata = {
  title: "Partners · Vimtra Chennai Lions GC",
  description:
    "Verified partners of the Vimtra Chennai Lions GC — league title partner am green, kit manufacturer FIRSTCUT — and the four commercial tiers open to new partners.",
};

// Only two commercial partners are named on the current record: the league
// title partner and the kit manufacturer, both documented in the brochure
// (p. 13). No sponsor slots are pre-filled with fictional brands and no
// "Slot Available" tiles are presented as marketing filler — the tiered
// section below describes what a partnership actually includes.

const CONFIRMED_PARTNERS = [
  {
    tag: "League Title Partner · Kit Sponsor",
    name: "am green",
    scope: "AM Green Indian Golf Premier League",
    // Brochure p. 13 verbatim.
    detail:
      "League-wide title partner of the AM Green IGPL and kit sponsor across the Vimtra Chennai Lions Season 2026 match kit.",
  },
  {
    tag: "Kit Manufacturer",
    name: "FIRSTCUT",
    scope: "Season 2026 Match Kit",
    // Brochure p. 13 verbatim.
    detail: "Kit production partner for the Chennai Lions Season 2026.",
  },
];

// Brochure p. 19 — "Four commercial tiers, each structured around visibility
// on player kit, event branding, digital reach, and hospitality access at
// Chennai home rounds and international events."
interface Tier {
  code: string;
  name: string;
  headline: string;
  bullets: string[];
  badgeStyle: React.CSSProperties;
}

const TIERS: Tier[] = [
  {
    code: "TIER 01",
    name: "Principal Partner",
    headline: "Front-of-jersey positioning with the team mark.",
    bullets: [
      "Front-of-jersey positioning",
      "Event lockup with the team mark",
      "Hospitality across all Chennai home rounds",
      "Co-branded press moments",
    ],
    badgeStyle: { background: "#1A1513", color: "#E9CB8E" },
  },
  {
    code: "TIER 02",
    name: "Associate Partner",
    headline: "Secondary kit branding, digital-first storytelling.",
    bullets: [
      "Secondary kit branding",
      "Event backdrops",
      "Digital-first team storytelling package",
      "Curated home-round hospitality",
    ],
    badgeStyle: {
      background: "linear-gradient(180deg,#E6C57E,#C39A52)",
      color: "#3A1A06",
    },
  },
  {
    code: "TIER 03",
    name: "Season Partner",
    headline: "Season-long content + curated tournament hospitality.",
    bullets: [
      "Season-long visibility across a defined content and event stack",
      "Curated hospitality at selected tournaments",
    ],
    badgeStyle: { background: "rgba(196,32,42,0.10)", color: "#C4202A" },
  },
  {
    code: "TIER 04",
    name: "Community Partner",
    headline: "Grassroots and junior-development co-programmes.",
    bullets: [
      "Grassroots and junior-development co-programmes with the franchise",
      "Anchored around Chennai&apos;s home fixtures",
    ],
    badgeStyle: { background: "rgba(26,21,19,0.08)", color: "#1A1513" },
  },
];

// Brochure p. 17 — "India's golf market has crossed the USD 1 billion mark.
// … 17.1% sports-tourism CAGR. … Ten franchises — Chennai is one."
const MARKET_CASE = [
  { v: "$1B+", l: "India Golf Market Today" },
  { v: "17.1%", l: "Sports Tourism CAGR" },
  { v: "10", l: "IGPL Franchises · Chennai is one" },
];

export default function PartnersPage() {
  return (
    <>
      <section
        className="relative overflow-hidden px-8 pt-[88px] pb-[70px]"
        style={{ background: "radial-gradient(125% 105% at 50% -5%,#C9242E 0%,#A8181F 58%,#871119 100%)" }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 84% 16%,rgba(233,203,142,0.16),transparent 42%)" }} />
        <div className="relative max-w-[1200px] mx-auto">
          <div className="font-manrope font-bold text-[12px] tracking-[0.32em] text-[#E9CB8E] uppercase">
            Partner With the Lions
          </div>
          <AeText
            text="PARTNERS"
            mode="words"
            as="h1"
            className="mt-[14px] font-sora font-extrabold text-white"
            style={{ fontSize: "clamp(56px,9.4vw,142px)", lineHeight: 0.9, letterSpacing: "-0.035em" }}
          />
          <Reveal variant="fade-up" delay={100} as="p" className="max-w-[600px] mt-[22px] font-manrope text-[16px] leading-[1.6] text-white/85">
            Join a franchise on day one of a decade. Four commercial tiers,
            each structured around visibility on player kit, event branding,
            digital reach, and hospitality access at Chennai home rounds and
            international events.
          </Reveal>
        </div>
      </section>

      {/* Confirmed partners */}
      <section className="bg-cream-100 px-8 pt-20 pb-[60px]">
        <div className="max-w-[1100px] mx-auto">
          <Reveal variant="fade-up" className="mb-[26px]">
            <div className="font-manrope font-bold tracking-[0.22em] text-[11.5px] text-crimson-600 uppercase">
              Confirmed Partners · Season 2026
            </div>
            <h2 className="mt-[14px] font-sora font-extrabold text-[42px] leading-[1.05] tracking-[-0.025em] text-ink">
              The partners on the kit.
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CONFIRMED_PARTNERS.map((p) => (
              <Reveal
                key={p.name}
                variant="fade-up"
                className="bg-white border border-black/[0.07] rounded-[24px] p-8"
                style={{ boxShadow: "0 26px 60px -38px rgba(26,21,19,0.45)" }}
              >
                <div className="font-manrope font-bold text-[10.5px] tracking-[0.28em] text-crimson-600 uppercase">
                  {p.tag}
                </div>
                <div className="mt-3 font-sora font-extrabold text-[36px] tracking-[-0.03em] leading-[1.05] text-ink">
                  {p.name}
                </div>
                <div className="mt-2 font-manrope text-[12.5px] tracking-[0.08em] text-muted uppercase">
                  {p.scope}
                </div>
                <p className="mt-4 m-0 font-manrope text-[14.5px] leading-[1.66] text-[#3A1215]/85">
                  {p.detail}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="bg-cream-50 px-8 py-[80px] border-y border-black/[0.06]">
        <div className="max-w-[1100px] mx-auto">
          <Reveal variant="fade-up" className="mb-[36px]">
            <div className="font-manrope font-bold tracking-[0.22em] text-[11.5px] text-crimson-600 uppercase">
              Commercial Tiers
            </div>
            <h2 className="mt-[14px] font-sora font-extrabold text-[42px] leading-[1.05] tracking-[-0.025em] text-ink">
              Four ways to partner.
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {TIERS.map((t, i) => (
              <Reveal
                key={t.code}
                variant="fade-up"
                delay={i * 80}
                className="bg-white border border-black/[0.07] rounded-[22px] p-7"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="tier-badge"
                    style={t.badgeStyle}
                  >
                    {t.code}
                  </span>
                  <span className="font-sora font-bold text-[13px] text-muted tracking-[0.04em]">
                    {t.name}
                  </span>
                </div>
                <h3 className="mt-1 font-sora font-extrabold text-[22px] tracking-[-0.015em] text-ink leading-[1.15]">
                  {t.headline}
                </h3>
                <ul className="mt-4 grid gap-2 pl-0 list-none">
                  {t.bullets.map((b) => (
                    <li
                      key={b}
                      className="font-manrope text-[14px] leading-[1.55] text-muted flex gap-2"
                    >
                      <span
                        aria-hidden
                        className="mt-[9px] w-[6px] h-[6px] rounded-full bg-crimson-600 shrink-0"
                      />
                      {/* Text is trusted — sourced from brochure copy. */}
                      <span dangerouslySetInnerHTML={{ __html: b }} />
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Market case — brochure p. 17 */}
      <section className="bg-cream-100 px-8 py-[80px]">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-[46px] items-start">
          <Reveal variant="fade-up">
            <div className="font-manrope font-bold tracking-[0.22em] text-[11.5px] text-crimson-600 uppercase">
              The Case
            </div>
            <h2 className="mt-[14px] font-sora font-extrabold text-[42px] leading-[1.05] tracking-[-0.025em] text-ink">
              A billion-dollar market. A first-mover&apos;s window.
            </h2>
          </Reveal>
          <Reveal variant="fade-up" delay={120} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {MARKET_CASE.map((c) => (
              <div
                key={c.l}
                className="rounded-[18px] p-6 bg-cream-50 border border-black/[0.07] text-center"
              >
                <div className="font-sora font-extrabold text-[36px] text-crimson-600 leading-none tracking-[-0.025em]">
                  {c.v}
                </div>
                <div className="font-manrope text-[12.5px] text-muted mt-2 leading-[1.4]">
                  {c.l}
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 py-24 text-white" style={{ background: "linear-gradient(180deg,#1A1513,#241B17)" }}>
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-10 items-center">
          <Reveal variant="fade-up">
            <div className="font-manrope font-bold tracking-[0.32em] text-[12px] text-[#E9CB8E] uppercase">
              To Discuss
            </div>
            <h2 className="my-[18px] font-sora font-extrabold leading-none tracking-[-0.025em]" style={{ fontSize: "clamp(36px,5vw,58px)" }}>
              A long-term seat at a long-term club.
            </h2>
            <p className="font-manrope text-[15px] leading-[1.66] text-white/[0.78]">
              For partnership conversations, our commercial team can walk you
              through visibility, hospitality, and content-package specifics
              tailored to your objectives.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-7 gap-y-3 font-manrope text-[14px]">
              <a href="mailto:info@vimtra.com" className="text-[#E9CB8E] no-underline hover:underline">
                info@vimtra.com
              </a>
              <a href="tel:+16504836185" className="text-white/80 no-underline">
                +1 650 483 6185
              </a>
              <a href="tel:+918939414030" className="text-white/80 no-underline">
                +91 89394 14030
              </a>
            </div>
          </Reveal>
          <Reveal variant="fade-up" delay={120} className="text-center">
            <Link
              href="/invest"
              className="cta-gold press"
              style={{ padding: "16px 30px", fontSize: 14 }}
            >
              SEE THE INVESTMENT CASE
            </Link>
            <div className="mt-4 font-manrope text-[12px] text-white/50">
              Or{" "}
              <Link
                href="/contact?topic=Partnerships"
                className="text-[#E9CB8E] no-underline"
              >
                start a conversation
              </Link>
              .
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
