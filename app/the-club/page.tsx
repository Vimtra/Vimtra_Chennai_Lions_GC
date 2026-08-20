import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import AeText from "@/components/AeText";

export const metadata: Metadata = {
  title: "The Club · Vimtra Chennai Lions GC",
  description:
    "Chennai's franchise in the AM Green IGPL — founded 2026, owned outright by Vimtra Ventures, built for the decade of franchise golf.",
};

// Every stat below is sourced from the Chennai Lions IGPL brochure (Season
// 2026) and the Vimtra Ventures profile. No membership counts, seat-of-pants
// numbers, or aspirational-as-fact stats are included.
const STATS = [
  // Brochure p. 06 — "FOUNDED · 2026 · Inaugural franchise season".
  { v: "2026", l: "Inaugural Season", dark: false },
  // Brochure p. 06 — "Season 2026 roster · Four names. One team sheet."
  { v: "04", l: "Season 2026 Roster", dark: false },
  // Brochure p. 05 — "15 EVENTS / SEASON · Ten in India, five international".
  { v: "15", l: "Events on the Calendar", dark: false },
  // Brochure p. 05 — "10 FRANCHISES · Ten Indian cities represented".
  { v: "IGPL", l: "AM Green · Franchise", dark: true },
];

// Brochure-verified positioning language used across the page. Nothing here
// is a claim of measurable performance — it's brand narrative sourced from
// the brochure's own headings ("A team built for the long game", "The
// long-game city", "Chennai's roar on the world's newest stage").
const CODE = [
  {
    n: "01",
    t: "Marquee",
    // Brochure p. 06 — "MARQUEE · A proven international marquee".
    d: "A proven international marquee at the front of the team sheet — a signal to the roster, the gallery, and the calendar.",
  },
  {
    n: "02",
    t: "Domestic Core",
    // Brochure p. 06 — "…a proven domestic winner, an internationally ranked pro,
    // and a rising IGPL competitor — balanced by design".
    d: "A proven domestic winner, an internationally ranked pro, and an active IGPL competitor — balanced by design.",
  },
  {
    n: "03",
    t: "Long Game",
    // Brochure p. 06 — "Our commitment is not to a single season. It is to the
    // decade of Indian franchise golf that begins now."
    d: "A commitment measured in decades, not seasons — every roster and infrastructure decision made against a ten-year horizon.",
  },
  {
    n: "04",
    t: "Home City",
    // Brochure p. 04 — "A coastal capital, a deep amateur golf base, and one of
    // the country's most consistent producers of touring professionals."
    d: "Chennai. A coastal capital, a deep amateur golf base, and one of the country's most consistent producers of touring pros.",
  },
];

// Named leadership — Vimtra Ventures Profile & brochure pp. 14, 16.
// Only individuals explicitly named in the source documents appear here.
const LEADERSHIP = [
  {
    init: "SY",
    name: "Subash Yammada",
    role: "Founder & CEO · Vimtra Ventures",
    // Brochure p. 14.
    d: "Serial entrepreneur and CEO of Vimtra Ventures — three decades of leadership across sports franchises, PE, VC, real estate, golf communities and academies, tech, healthcare, and hospitality.",
    bg: "linear-gradient(160deg,#C9242E,#871119)",
    color: "#fff",
  },
  {
    init: "TY",
    name: "Thimmaji Rao Yammada",
    role: "Founder & Managing Director · Vimtra Ventures",
    // Brochure p. 14.
    d: "Thirty-one years of leadership across PE, sports franchises, infrastructure, real estate, and industrial development across North America and India — with full-cycle real-estate expertise across commercial, residential, retail, and mixed-use assets.",
    bg: "linear-gradient(160deg,#E6C57E,#C39A52)",
    color: "#3A1A06",
  },
  {
    init: "RB",
    name: "Ravi Babu Mannam",
    role: "Board of Directors · Vimtra Ventures",
    // Brochure p. 16 (Vision & Advisory).
    d: "Strengthening the firm's leadership and advisory ecosystem and the expansion of its golf and community-development initiatives.",
    bg: "#1A1513",
    color: "#E9CB8E",
  },
  {
    init: "AB",
    name: "Advisory Board",
    role: "Building in Progress",
    // Brochure p. 16 — "A high-calibre Advisory Board is being assembled…".
    d: "A high-calibre Advisory Board is being assembled across business, investments, golf, real estate, infrastructure, community development, branding, and sports management.",
    bg: "#C4202A",
    color: "#fff",
  },
];

// Kit sponsors — brochure p. 13. Everything on this row is verified: title
// sponsor "am green" and kit manufacturer "FIRSTCUT". Palette also verified.
const KIT = [
  {
    tag: "Title Partner",
    name: "am green",
    // Brochure p. 13 verbatim.
    detail: "League-wide title partner and kit sponsor.",
  },
  {
    tag: "Kit Manufacturer",
    name: "FIRSTCUT",
    detail: "Kit production partner for the 2026 season.",
  },
];

// Brochure p. 13 — kit palette verbatim.
const PALETTE = [
  { label: "Pride Red", swatch: "#C4202A", ink: "#fff" },
  { label: "Highlight Gold", swatch: "#C39A52", ink: "#3A1A06" },
  { label: "Court Yellow", swatch: "#F2D66C", ink: "#3A1A06" },
  { label: "Stadium Cream", swatch: "#F4F0E8", ink: "#1A1513" },
  { label: "Jet Black", swatch: "#1A1513", ink: "#E9CB8E" },
];

export default function TheClubPage() {
  return (
    <>
      <section
        className="relative overflow-hidden px-8 pt-[96px] pb-[88px]"
        style={{ background: "radial-gradient(125% 105% at 50% -5%,#C9242E 0%,#A8181F 58%,#871119 100%)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 84% 16%,rgba(233,203,142,0.16),transparent 42%),radial-gradient(circle at 12% 88%,rgba(233,203,142,0.10),transparent 45%)" }}
        />
        <div className="relative max-w-[1200px] mx-auto">
          <div className="font-manrope font-bold text-[12px] tracking-[0.32em] text-[#E9CB8E] uppercase">
            The Franchise · Season 2026
          </div>
          <AeText
            text="THE CLUB"
            mode="words"
            as="h1"
            className="mt-[14px] font-sora font-extrabold text-white"
            style={{ fontSize: "clamp(56px,9.4vw,142px)", lineHeight: 0.9, letterSpacing: "-0.035em" }}
          />
          <Reveal variant="fade-up" delay={120} as="p" className="max-w-[640px] mt-[22px] font-manrope text-[17px] leading-[1.6] text-white/85">
            Vimtra Chennai Lions GC is Chennai&apos;s franchise in the AM Green
            Indian Golf Premier League — founded in 2026 and owned outright by
            Vimtra Ventures. A proven international marquee paired with a
            rising domestic core, built for the decade of franchise golf that
            begins now.
          </Reveal>
        </div>
      </section>

      {/* Identity */}
      <section className="bg-cream-100 px-8 pt-[104px] pb-[92px]">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-[60px] items-start">
          <Reveal variant="fade-up">
            <div className="font-manrope font-bold tracking-[0.22em] text-[11.5px] text-crimson-600 uppercase">
              Identity
            </div>
            <h2 className="mt-[14px] mb-[22px] font-sora font-extrabold text-[46px] leading-none tracking-[-0.025em] text-ink">
              A franchise built
              <br />
              for the long game.
            </h2>
            <p className="font-manrope text-[15.5px] leading-[1.66] text-muted">
              The Chennai Lions are Chennai&apos;s roar in a global league — a
              team built to compete on day one and grow through the
              international leg of a fifteen-event season. Every roster
              decision was made against the same test: can this team compete
              week to week, and can it grow through the season?
            </p>
            <p className="font-manrope text-[15.5px] leading-[1.66] text-muted mt-[14px]">
              The commitment is not to a single season. It is to the decade of
              Indian franchise golf that begins now — anchored by Vimtra
              Ventures, backed by an operating platform building coaching,
              academies, event standards, and course operations at
              international championship level.
            </p>
          </Reveal>
          <Reveal variant="fade-up" delay={120} className="grid grid-cols-2 gap-[18px]">
            {STATS.map((s) => (
              <div
                key={s.l}
                className="rounded-[20px] p-6"
                style={
                  s.dark
                    ? { background: "linear-gradient(160deg,#C9242E,#871119)", color: "#fff", boxShadow: "0 26px 60px -38px rgba(196,32,42,0.6)" }
                    : { background: "#FBF9F4", border: "1px solid rgba(26,21,19,0.08)", boxShadow: "0 26px 60px -38px rgba(26,21,19,0.45)" }
                }
              >
                <div
                  className="font-sora font-extrabold text-[42px] tracking-[-0.025em] leading-none"
                  style={{ color: s.dark ? "#E9CB8E" : "#C4202A" }}
                >
                  {s.v}
                </div>
                <div
                  className="font-manrope text-[13px] mt-2"
                  style={{ color: s.dark ? "rgba(255,255,255,0.85)" : "#6B635C" }}
                >
                  {s.l}
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* The Team Build */}
      <section className="bg-cream-50 px-8 py-24 border-y border-black/[0.06]">
        <div className="max-w-[1200px] mx-auto">
          <Reveal variant="fade-up" className="text-center mb-[54px]">
            <div className="font-manrope font-bold tracking-[0.22em] text-[11.5px] text-crimson-600 uppercase">
              How the Team Was Built
            </div>
            <h2 className="mt-[14px] font-sora font-extrabold text-[46px] leading-none tracking-[-0.025em] text-ink">
              Four names. One team sheet.
            </h2>
          </Reveal>
          <div className="grid gap-[22px] [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
            {CODE.map((c, i) => (
              <Reveal key={c.n} variant="fade-up" delay={i * 80} className="bg-white border border-black/[0.07] rounded-[22px] p-7">
                <div className="w-12 h-12 rounded-[13px] bg-crimson-600 text-white font-sora font-extrabold text-[20px] flex items-center justify-center">
                  {c.n}
                </div>
                <h3 className="mt-[18px] mb-2 font-sora font-bold text-[20px] text-ink">{c.t}</h3>
                <p className="m-0 font-manrope text-[14px] leading-[1.6] text-muted">{c.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Home Ground */}
      <section className="bg-cream-100 px-8 py-24">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-[54px] items-center">
          <Reveal variant="fade-up">
            <div className="font-manrope font-bold tracking-[0.22em] text-[11.5px] text-crimson-600 uppercase">
              Home Ground
            </div>
            <h2 className="mt-[14px] mb-[22px] font-sora font-extrabold text-[42px] leading-none tracking-[-0.025em] text-ink">
              Chennai. TNGF Cosmo. Bay of Bengal.
            </h2>
            <p className="font-manrope text-[15.5px] leading-[1.66] text-muted">
              A coastal capital, a deep amateur golf base, and a home practice
              venue in <strong>TNGF Cosmo</strong>. Chennai is the regional
              anchor of a franchise built to compete for a decade.
            </p>
          </Reveal>
          <Reveal variant="fade-up" delay={120} className="grid grid-cols-3 gap-4">
            {[
              { v: "Bay of Bengal", l: "Coastline" },
              { v: "TNGF Cosmo", l: "Home Practice Venue" },
              { v: "South India", l: "Regional Anchor" },
            ].map((tile) => (
              <div
                key={tile.l}
                className="rounded-[18px] p-5 bg-cream-50 border border-black/[0.07] text-center"
              >
                <div className="font-sora font-extrabold text-[16px] text-ink leading-tight">
                  {tile.v}
                </div>
                <div className="font-manrope text-[11.5px] text-muted mt-2 uppercase tracking-[0.08em]">
                  {tile.l}
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Kit sponsors */}
      <section className="bg-cream-50 px-8 py-24 border-y border-black/[0.06]">
        <div className="max-w-[1200px] mx-auto">
          <Reveal variant="fade-up" className="flex justify-between items-end gap-8 flex-wrap mb-[36px]">
            <div>
              <div className="font-manrope font-bold tracking-[0.22em] text-[11.5px] text-crimson-600 uppercase">
                The Kit · Season 2026
              </div>
              <h2 className="mt-[14px] font-sora font-extrabold text-[42px] leading-none tracking-[-0.025em] text-ink">
                A white-to-court-yellow gradient.
              </h2>
            </div>
            <p className="max-w-[430px] m-0 font-manrope text-[14.5px] leading-[1.62] text-muted">
              Designed to travel from Chennai heat to floodlit international
              venues without losing the team&apos;s visual identity.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            {KIT.map((k) => (
              <Reveal
                key={k.name}
                variant="fade-up"
                className="bg-white border border-black/[0.07] rounded-[20px] p-7"
              >
                <div className="font-manrope font-bold text-[10.5px] tracking-[0.28em] text-crimson-600 uppercase">
                  {k.tag}
                </div>
                <div className="mt-2 font-sora font-extrabold text-[28px] text-ink tracking-[-0.02em]">
                  {k.name}
                </div>
                <p className="mt-2 m-0 font-manrope text-[13.5px] leading-[1.6] text-muted">
                  {k.detail}
                </p>
              </Reveal>
            ))}
          </div>

          <Reveal variant="fade-up" delay={80}>
            <div className="font-manrope font-bold text-[10.5px] tracking-[0.28em] text-crimson-600 uppercase mb-3">
              Palette
            </div>
            <div className="flex flex-wrap gap-3">
              {PALETTE.map((p) => (
                <div
                  key={p.label}
                  className="rounded-[14px] px-4 py-3"
                  style={{
                    background: p.swatch,
                    color: p.ink,
                    border: "1px solid rgba(0,0,0,0.06)",
                    minWidth: 140,
                  }}
                >
                  <div className="font-sora font-bold text-[13px] tracking-[0.02em]">
                    {p.label}
                  </div>
                  <div className="font-manrope text-[10.5px] tracking-[0.16em] uppercase opacity-80 mt-1">
                    {p.swatch}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Leadership */}
      <section className="bg-cream-100 px-8 py-[104px]">
        <div className="max-w-[1200px] mx-auto">
          <Reveal variant="fade-up" className="flex justify-between items-end gap-8 flex-wrap mb-[46px]">
            <div>
              <div className="font-manrope font-bold tracking-[0.22em] text-[11.5px] text-crimson-600 uppercase">
                Leadership · Vimtra Ventures
              </div>
              <h2 className="mt-[14px] font-sora font-extrabold text-[46px] leading-none tracking-[-0.025em] text-ink">
                The brain behind the team.
              </h2>
            </div>
            <p className="max-w-[430px] m-0 font-manrope text-[15px] leading-[1.62] text-muted">
              Vimtra Ventures is a San Francisco &amp; Chennai-based PE, VC, and
              investment firm founded in 1995. The Chennai Lions are its
              sporting expression in Indian golf.
            </p>
          </Reveal>
          <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
            {LEADERSHIP.map((o, i) => (
              <Reveal key={o.init} variant="fade-up" delay={i * 100} className="bg-cream-50 border border-black/[0.07] rounded-[22px] p-6">
                <div
                  className="w-[74px] h-[74px] rounded-full font-sora font-extrabold text-[24px] flex items-center justify-center"
                  style={{ background: o.bg, color: o.color }}
                >
                  {o.init}
                </div>
                <div className="mt-[18px] font-sora font-bold text-[18px] text-ink">{o.name}</div>
                <div className="font-manrope text-[12.5px] text-crimson-600 mt-1 tracking-[0.06em] uppercase">
                  {o.role}
                </div>
                <p className="mt-[14px] font-manrope text-[13.5px] leading-[1.6] text-muted">{o.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Partner CTA — brochure p. 19 language. */}
      <section className="px-8 py-24 text-white" style={{ background: "linear-gradient(180deg,#1A1513,#241B17)" }}>
        <div className="max-w-[1100px] mx-auto text-center">
          <Reveal variant="fade-up" className="font-manrope font-bold tracking-[0.32em] text-[12px] text-[#E9CB8E] uppercase">
            Partner With the Lions
          </Reveal>
          <Reveal variant="fade-up" as="h2" className="my-[18px] font-sora font-extrabold leading-none tracking-[-0.025em]" style={{ fontSize: "clamp(38px,5vw,64px)" }}>
            Join a franchise on day one of a decade.
          </Reveal>
          <Reveal variant="fade-up" delay={120} as="p" className="max-w-[560px] mx-auto mb-8 font-manrope text-[15px] leading-[1.66] text-white/70">
            Four commercial tiers — each structured around visibility on player
            kit, event branding, digital reach, and hospitality access at
            Chennai home rounds and international events.
          </Reveal>
          <Reveal variant="fade-up" delay={200} className="flex flex-wrap gap-3 justify-center">
            <Link href="/invest" className="cta-gold press" style={{ padding: "14px 28px", fontSize: 14 }}>
              SEE THE INVESTMENT CASE
            </Link>
            <Link
              href="/vimtra-ventures"
              className="press inline-flex items-center gap-2 px-5 py-[13px] rounded-[30px] border border-white/25 text-white font-manrope font-bold text-[13.5px] no-underline"
            >
              THE FIRM · VIMTRA VENTURES →
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
