import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import AeText from "@/components/AeText";

export const metadata: Metadata = {
  title: "Invest & Partner · Vimtra Chennai Lions GC",
  description:
    "Join a franchise on day one of a decade. The Chennai Lions investment thesis, the first-mover window in franchise golf, and the four commercial tiers open to new partners.",
};

// Every claim on this page is sourced from the Chennai Lions IGPL brochure
// (pp. 17–19) and the Vimtra Ventures profile. No fictional partners,
// deal terms, minimum tickets, or valuation figures appear here — those
// belong in a private commercial conversation, not the public site.

// Brochure p. 17 — the market case, verbatim numbers.
const MARKET = [
  { v: "$1B+", l: "India Golf Market Today" },
  { v: "17.1%", l: "Sports Tourism CAGR" },
  { v: "10", l: "IGPL Franchises · Chennai is one" },
];

// Vimtra Ventures profile — canonical partner categories the firm welcomes.
const WELCOME = [
  {
    label: "Individuals",
    body: "High-net-worth individuals who share a passion for golf.",
  },
  {
    label: "Family Offices",
    body: "Long-horizon capital aligned with the golf-led-community thesis.",
  },
  {
    label: "Institutions",
    body:
      "Strategic institutional partners bringing capital and relationships.",
  },
  {
    label: "Corporate Partners",
    body:
      "Brand partners bringing category expertise and audience reach.",
  },
  {
    label: "Strategic Investors",
    body:
      "Investors bringing capital, expertise, industry knowledge, and a shared commitment.",
  },
];

// Brochure p. 19 — four commercial tiers, verbatim structure.
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
    headline: "Season-long content stack + curated tournament hospitality.",
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

export default function InvestPage() {
  return (
    <>
      {/* ============================= HERO ============================= */}
      <section
        className="relative overflow-hidden px-8 pt-[96px] pb-[88px]"
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
        <div className="relative max-w-[1200px] mx-auto">
          <div className="font-manrope font-bold text-[12px] tracking-[0.32em] text-[#E9CB8E] uppercase">
            Partner With the Lions
          </div>
          <AeText
            text="INVEST"
            mode="words"
            as="h1"
            className="mt-[14px] font-sora font-extrabold text-white"
            style={{
              fontSize: "clamp(56px,9.4vw,144px)",
              lineHeight: 0.9,
              letterSpacing: "-0.035em",
            }}
          />
          <Reveal
            variant="fade-up"
            delay={120}
            as="p"
            className="max-w-[680px] mt-[22px] font-manrope text-[17px] leading-[1.6] text-white/85"
          >
            Join a franchise on day one of a decade. The Vimtra Chennai Lions
            are the sporting expression of Vimtra&apos;s Indian golf platform —
            an operating firm building for a decade, not a season.
          </Reveal>
        </div>
      </section>

      {/* ================== MARKET CASE ================== */}
      <section className="bg-cream-100 px-8 pt-[100px] pb-[92px]">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-[54px] items-start">
          <Reveal variant="fade-up">
            <div className="font-manrope font-bold tracking-[0.22em] text-[11.5px] text-crimson-600 uppercase">
              The Case
            </div>
            <h2 className="mt-[14px] font-sora font-extrabold text-[46px] leading-[1.05] tracking-[-0.025em] text-ink">
              A billion-dollar market.
              <br />
              A first-mover&apos;s window.
            </h2>
            <p className="mt-6 font-manrope text-[15.5px] leading-[1.66] text-muted">
              India&apos;s golf market has crossed the USD 1 billion mark.
              Franchise sport turned cricket into a national industry — the
              earliest committed golf franchises will hold the strongest
              position when the league scales.
            </p>
          </Reveal>

          <Reveal variant="fade-up" delay={120} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {MARKET.map((m) => (
              <div
                key={m.l}
                className="rounded-[20px] p-6 bg-cream-50 border border-black/[0.07] text-center"
                style={{ boxShadow: "0 26px 60px -38px rgba(26,21,19,0.45)" }}
              >
                <div className="font-sora font-extrabold text-[40px] text-crimson-600 leading-none tracking-[-0.025em]">
                  {m.v}
                </div>
                <div className="mt-3 font-manrope text-[12.5px] text-muted leading-[1.4]">
                  {m.l}
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ================== WHY FRANCHISE / WHY NOW ================== */}
      <section className="bg-cream-50 px-8 py-[80px] border-y border-black/[0.06]">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <Reveal
            variant="fade-up"
            className="bg-white border border-black/[0.07] rounded-[22px] p-8"
            style={{ boxShadow: "0 26px 60px -38px rgba(26,21,19,0.45)" }}
          >
            <div className="font-manrope font-bold text-[10.5px] tracking-[0.28em] text-crimson-600 uppercase">
              Why Franchise Golf
            </div>
            <h3 className="mt-3 mb-3 font-sora font-extrabold text-[26px] text-ink tracking-[-0.015em] leading-[1.2]">
              A season-long story finally makes it broadcastable.
            </h3>
            <p className="m-0 font-manrope text-[14.5px] leading-[1.66] text-muted">
              Team competition builds the calendar, the audience, and the
              sponsorship inventory in a way individual golf never has in
              India.
            </p>
          </Reveal>

          <Reveal
            variant="fade-up"
            delay={120}
            className="bg-white border border-black/[0.07] rounded-[22px] p-8"
            style={{ boxShadow: "0 26px 60px -38px rgba(26,21,19,0.45)" }}
          >
            <div className="font-manrope font-bold text-[10.5px] tracking-[0.28em] text-crimson-600 uppercase">
              Why Now
            </div>
            <h3 className="mt-3 mb-3 font-sora font-extrabold text-[26px] text-ink tracking-[-0.015em] leading-[1.2]">
              The window closes as the league scales.
            </h3>
            <p className="m-0 font-manrope text-[14.5px] leading-[1.66] text-muted">
              Franchise inventory is finite. Partnership economics compress
              with every season the league runs successfully.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ==================== WHO WE WELCOME ==================== */}
      <section className="bg-cream-100 px-8 py-[100px]">
        <div className="max-w-[1200px] mx-auto">
          <Reveal variant="fade-up" className="mb-[36px]">
            <div className="font-manrope font-bold tracking-[0.22em] text-[11.5px] text-crimson-600 uppercase">
              Who We Welcome
            </div>
            <h2 className="mt-[14px] font-sora font-extrabold text-[46px] leading-[1.05] tracking-[-0.025em] text-ink">
              Capital, expertise, and shared commitment.
            </h2>
            <p className="mt-6 max-w-[820px] font-manrope text-[15.5px] leading-[1.66] text-muted">
              Vimtra welcomes participation from individuals, family offices,
              institutions, corporate partners, and strategic investors who can
              contribute not only financial capital, but also expertise,
              relationships, industry knowledge, and a shared commitment to
              building the next generation of golf-led communities.
            </p>
          </Reveal>

          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
            {WELCOME.map((w, i) => (
              <Reveal
                key={w.label}
                variant="fade-up"
                delay={i * 60}
                className="bg-cream-50 border border-black/[0.07] rounded-[20px] p-6"
              >
                <div className="font-manrope font-bold text-[10.5px] tracking-[0.28em] text-crimson-600 uppercase">
                  {w.label}
                </div>
                <p className="mt-3 m-0 font-manrope text-[14px] leading-[1.62] text-muted">
                  {w.body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FOUR TIERS ==================== */}
      <section className="bg-cream-50 px-8 py-[100px] border-y border-black/[0.06]">
        <div className="max-w-[1200px] mx-auto">
          <Reveal variant="fade-up" className="mb-[36px]">
            <div className="font-manrope font-bold tracking-[0.22em] text-[11.5px] text-crimson-600 uppercase">
              Commercial Tiers
            </div>
            <h2 className="mt-[14px] font-sora font-extrabold text-[46px] leading-[1.05] tracking-[-0.025em] text-ink">
              Four ways to partner.
            </h2>
            <p className="mt-6 max-w-[820px] font-manrope text-[15.5px] leading-[1.66] text-muted">
              Each tier is structured around visibility on player kit, event
              branding, digital reach, and hospitality access at Chennai home
              rounds and international events.
            </p>
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
                  <span className="tier-badge" style={t.badgeStyle}>
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
                      {/* Trusted text — sourced verbatim from brochure copy. */}
                      <span dangerouslySetInnerHTML={{ __html: b }} />
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ADVISORY / BEYOND SPONSORSHIP ============ */}
      <section className="bg-cream-100 px-8 py-[100px]">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-[46px] items-start">
          <Reveal variant="fade-up">
            <div className="font-manrope font-bold tracking-[0.22em] text-[11.5px] text-crimson-600 uppercase">
              Beyond Sponsorship
            </div>
            <h2 className="mt-[14px] font-sora font-extrabold text-[42px] leading-[1.05] tracking-[-0.025em] text-ink">
              Contribute more than capital.
            </h2>
            <p className="mt-5 font-manrope text-[15.5px] leading-[1.66] text-muted">
              A high-calibre Advisory Board is being assembled across the
              disciplines a golf-and-communities platform requires. If your
              contribution goes beyond a sponsorship line item — capital,
              relationships, industry knowledge — the Advisory conversation is
              the right one to have.
            </p>
            <div className="mt-6">
              <Link
                href="/vimtra-ventures"
                className="press inline-flex items-center gap-2 px-5 py-[12px] rounded-[30px] border border-ink/25 text-ink font-manrope font-bold text-[13.5px] no-underline"
              >
                READ THE FIRM PROFILE →
              </Link>
            </div>
          </Reveal>

          <Reveal
            variant="fade-up"
            delay={120}
            className="bg-cream-50 border border-black/[0.07] rounded-[22px] p-8"
          >
            <div className="font-manrope font-bold text-[10.5px] tracking-[0.28em] text-crimson-600 uppercase">
              Advisory Disciplines
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                "Business",
                "Investments",
                "Golf",
                "Real Estate",
                "Infrastructure",
                "Community Development",
                "Branding",
                "Sports Management",
              ].map((d) => (
                <div
                  key={d}
                  className="rounded-[12px] px-4 py-3 bg-white border border-black/[0.06]"
                >
                  <div className="font-sora font-bold text-[13px] text-ink">
                    {d}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ==================== CONTACT / CTA ==================== */}
      <section className="px-8 py-[100px] text-white" style={{ background: "linear-gradient(180deg,#1A1513,#241B17)" }}>
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-[1.15fr_1fr] gap-10 items-center">
          <Reveal variant="fade-up">
            <div className="font-manrope font-bold tracking-[0.32em] text-[12px] text-[#E9CB8E] uppercase">
              To Discuss
            </div>
            <h2 className="my-[18px] font-sora font-extrabold leading-none tracking-[-0.025em]" style={{ fontSize: "clamp(36px,5vw,60px)" }}>
              Chennai&apos;s roar — on the world&apos;s newest stage.
            </h2>
            <p className="font-manrope text-[15px] leading-[1.66] text-white/[0.78]">
              One city. One roster. Fifteen events. A franchise built for the
              long game — and a commercial team ready to talk visibility,
              hospitality, and strategic involvement.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 font-manrope text-[14px]">
              <a
                href="mailto:info@vimtra.com"
                className="text-[#E9CB8E] no-underline hover:underline"
              >
                info@vimtra.com
              </a>
              <a
                href="tel:+16504836185"
                className="text-white/80 no-underline"
              >
                +1 650 483 6185
              </a>
              <a
                href="tel:+918939414030"
                className="text-white/80 no-underline"
              >
                +91 89394 14030
              </a>
            </div>
          </Reveal>
          <Reveal variant="fade-up" delay={120} className="text-center">
            <Link
              href="/contact?topic=Partnerships"
              className="cta-gold press"
              style={{ padding: "16px 30px", fontSize: 14 }}
            >
              START A CONVERSATION
            </Link>
            <div className="mt-4 font-manrope text-[12px] text-white/50">
              Prefer email? <a href="mailto:info@vimtra.com" className="text-[#E9CB8E] no-underline">info@vimtra.com</a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
