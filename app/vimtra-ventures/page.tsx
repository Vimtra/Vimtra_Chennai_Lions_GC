import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import AeText from "@/components/AeText";

export const metadata: Metadata = {
  title: "Vimtra Ventures · Vimtra Chennai Lions GC",
  description:
    "The San Francisco & Chennai-based PE, VC, and investment firm behind the Chennai Lions — founded 1995, 60+ tech acquisitions, six core verticals, owner of the Chennai Lions GC and Dallas Sidekicks.",
};

// Every claim on this page is sourced from the Chennai Lions IGPL brochure
// (pp. 13, 14, 15, 16) or the Vimtra Ventures profile. No numbers, dates,
// or people appear that are not in one of those two documents.

// Brochure p. 15 — headline stats verbatim.
const FIRM_STATS = [
  { v: "1995", l: "Founded" },
  { v: "60+", l: "Technology Acquisitions" },
  { v: "55+", l: "North America Real-Estate Assets" },
  { v: "6", l: "Core Verticals" },
];

// Brochure p. 15 — the six verticals, verbatim descriptions.
const VERTICALS = [
  {
    n: "01",
    name: "Mergers & Acquisitions",
    body:
      "Identifying, acquiring, restructuring, and revitalising businesses with significant growth potential.",
  },
  {
    n: "02",
    name: "Startups",
    body:
      "Founded, incubated, and scaled multiple technology ventures — several spun off into successful independent businesses.",
  },
  {
    n: "03",
    name: "Sports Franchises",
    body:
      "Ownership positions in professional sport — IGPL Vimtra Chennai Lions GC and the Dallas Sidekicks.",
  },
  {
    n: "04",
    name: "Real Estate",
    body:
      "High-value residential and mixed-use developments integrated with lifestyle and hospitality anchors.",
  },
  {
    n: "05",
    name: "Golf Communities & Academies",
    body:
      "Luxury golf-integrated communities and player-development academies across North America and India.",
  },
  {
    n: "06",
    name: "AI Infrastructure",
    body:
      "Hyperscale data-centre ownership and operations serving cloud, enterprise, and AI-workload demand.",
  },
];

// Brochure p. 14 — verbatim leadership bios.
const FOUNDERS = [
  {
    init: "SY",
    name: "Subash Yammada",
    role: "Founder & CEO",
    body:
      "Serial entrepreneur and CEO of Vimtra Ventures — a San Francisco-based diversified global enterprise. Three decades of leadership cultivating an expansive portfolio across sports franchises, private equity, venture capital, real estate (with a focus on AI infrastructure), golf communities and academies, technology, healthcare, and hospitality.",
    bg: "linear-gradient(160deg,#C9242E,#871119)",
    color: "#fff",
  },
  {
    init: "TY",
    name: "Thimmaji Rao Yammada",
    role: "Founder & Managing Director",
    body:
      "Managing Director of Vimtra Ventures with 31 years of leadership across private equity, sports franchises, infrastructure, real estate, and industrial development in North America and India. Full-cycle real-estate expertise spanning commercial, residential, retail, and mixed-use assets, with a track record in mid- to large-scale project execution and asset restructuring.",
    bg: "linear-gradient(160deg,#E6C57E,#C39A52)",
    color: "#3A1A06",
  },
];

// Brochure p. 16 — verbatim.
const BOARD_MEMBER = {
  init: "RB",
  name: "Ravi Babu Mannam",
  role: "Board of Directors",
  body:
    "Since joining the Vimtra Ventures Board of Directors, Mr. Ravi Babu Mannam has strengthened the firm's leadership and advisory ecosystem and the expansion of its golf and community-development initiatives — an important part of Vimtra's journey toward a globally connected investment and golf-development platform.",
};

// Brochure p. 16 — Advisory Board disciplines.
const ADVISORY_DISCIPLINES = [
  "Business",
  "Investments",
  "Golf",
  "Real Estate",
  "Infrastructure",
  "Community Development",
  "Branding",
  "Sports Management",
];

// Brochure p. 15 — the two sports-franchise ownership positions, verbatim.
const FRANCHISES = [
  {
    tag: "IGPL",
    name: "Vimtra Chennai Lions GC",
    detail:
      "The franchise operating in the AM Green Indian Golf Premier League — Season 2026.",
    href: "/the-club" as const,
  },
  {
    tag: "MASL",
    name: "Dallas Sidekicks",
    detail:
      "Ownership position in professional sport in North America.",
    href: undefined,
  },
];

export default function VimtraVenturesPage() {
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
            Ownership · The Firm
          </div>
          <AeText
            text="VIMTRA VENTURES"
            mode="words"
            as="h1"
            className="mt-[14px] font-sora font-extrabold text-white"
            style={{
              fontSize: "clamp(46px,7.6vw,112px)",
              lineHeight: 0.9,
              letterSpacing: "-0.035em",
            }}
          />
          <Reveal
            variant="fade-up"
            delay={120}
            as="p"
            className="max-w-[720px] mt-[22px] font-manrope text-[17px] leading-[1.6] text-white/85"
          >
            The brain behind the team. A San Francisco &amp; Chennai-based
            private equity, venture capital, and investment firm focused on
            unlocking growth through strategic investments, corporate-finance
            expertise, operational insight, and value-driven partnerships.
          </Reveal>
        </div>
      </section>

      {/* ================== FIRM PROFILE / STATS ================== */}
      <section className="bg-cream-100 px-8 pt-[100px] pb-[92px]">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-[54px] items-start">
          <Reveal variant="fade-up">
            <div className="font-manrope font-bold tracking-[0.22em] text-[11.5px] text-crimson-600 uppercase">
              The Firm
            </div>
            <h2 className="mt-[14px] mb-6 font-sora font-extrabold text-[46px] leading-[1.05] tracking-[-0.025em] text-ink">
              A firm built to create impactful solutions.
            </h2>
            <p className="font-manrope text-[15.5px] leading-[1.66] text-muted">
              Vimtra Ventures is a US-based venture capital and investment firm
              founded in 1995, with a track record that includes more than{" "}
              <strong>60 technology acquisitions</strong>. The firm operates as
              principal, not intermediary, across six verticals — mergers &amp;
              acquisitions, startups, sports franchises, real estate, golf
              communities and academies, and AI infrastructure — with an
              operating footprint spanning North America and India and{" "}
              <strong>55+ premium real-estate assets</strong> across the
              United States.
            </p>
            <p className="mt-4 font-manrope text-[15.5px] leading-[1.66] text-muted">
              By combining capital, strategic vision, and hands-on execution,
              Vimtra partners with businesses and communities to build scalable
              enterprises, develop transformative assets, and create
              sustainable, long-term value.
            </p>
          </Reveal>

          <Reveal variant="fade-up" delay={120} className="grid grid-cols-2 gap-4">
            {FIRM_STATS.map((s, i) => (
              <div
                key={s.l}
                className="rounded-[20px] p-6 bg-cream-50 border border-black/[0.07]"
                style={{ boxShadow: "0 26px 60px -38px rgba(26,21,19,0.45)" }}
              >
                <div
                  className="font-sora font-extrabold text-[46px] leading-none tracking-[-0.025em]"
                  style={{ color: i === 0 ? "#1A1513" : "#C4202A" }}
                >
                  {s.v}
                </div>
                <div className="mt-3 font-manrope text-[12.5px] leading-[1.4] text-muted uppercase tracking-[0.08em]">
                  {s.l}
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ==================== SIX VERTICALS ==================== */}
      <section className="bg-cream-50 px-8 py-[100px] border-y border-black/[0.06]">
        <div className="max-w-[1200px] mx-auto">
          <Reveal variant="fade-up" className="mb-[46px]">
            <div className="font-manrope font-bold tracking-[0.22em] text-[11.5px] text-crimson-600 uppercase">
              Core Verticals · Six
            </div>
            <h2 className="mt-[14px] font-sora font-extrabold text-[46px] leading-[1.05] tracking-[-0.025em] text-ink">
              Where the firm operates.
            </h2>
          </Reveal>

          <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
            {VERTICALS.map((v, i) => (
              <Reveal
                key={v.n}
                variant="fade-up"
                delay={i * 60}
                className="bg-white border border-black/[0.07] rounded-[22px] p-7"
              >
                <div className="w-12 h-12 rounded-[13px] bg-crimson-600 text-white font-sora font-extrabold text-[16px] flex items-center justify-center tracking-[0.08em]">
                  {v.n}
                </div>
                <h3 className="mt-[18px] mb-2 font-sora font-bold text-[20px] text-ink tracking-[-0.005em] leading-[1.2]">
                  {v.name}
                </h3>
                <p className="m-0 font-manrope text-[14px] leading-[1.62] text-muted">
                  {v.body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================ SPORTS FRANCHISE PORTFOLIO ================ */}
      <section className="bg-cream-100 px-8 py-[100px]">
        <div className="max-w-[1200px] mx-auto">
          <Reveal variant="fade-up" className="mb-[36px]">
            <div className="font-manrope font-bold tracking-[0.22em] text-[11.5px] text-crimson-600 uppercase">
              Sports Franchise Portfolio
            </div>
            <h2 className="mt-[14px] font-sora font-extrabold text-[46px] leading-[1.05] tracking-[-0.025em] text-ink">
              Ownership positions.
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FRANCHISES.map((f) => {
              const inner = (
                <>
                  <div className="font-manrope font-bold text-[10.5px] tracking-[0.28em] text-crimson-600 uppercase">
                    {f.tag}
                  </div>
                  <div className="mt-3 font-sora font-extrabold text-[30px] text-ink tracking-[-0.02em] leading-[1.1]">
                    {f.name}
                  </div>
                  <p className="mt-3 m-0 font-manrope text-[14.5px] leading-[1.66] text-muted">
                    {f.detail}
                  </p>
                  {f.href && (
                    <div className="mt-5 font-manrope font-bold text-[13px] text-crimson-600">
                      Meet the franchise →
                    </div>
                  )}
                </>
              );
              const className =
                "bg-cream-50 border border-black/[0.07] rounded-[22px] p-8 block no-underline text-inherit";
              return f.href ? (
                <Reveal key={f.name} variant="fade-up">
                  <Link href={f.href} className={className}>
                    {inner}
                  </Link>
                </Reveal>
              ) : (
                <Reveal key={f.name} variant="fade-up" className={className}>
                  {inner}
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================== FOUNDERS ==================== */}
      <section className="bg-cream-50 px-8 py-[100px] border-y border-black/[0.06]">
        <div className="max-w-[1200px] mx-auto">
          <Reveal variant="fade-up" className="mb-[46px]">
            <div className="font-manrope font-bold tracking-[0.22em] text-[11.5px] text-crimson-600 uppercase">
              Founders
            </div>
            <h2 className="mt-[14px] font-sora font-extrabold text-[46px] leading-[1.05] tracking-[-0.025em] text-ink">
              The people behind the firm.
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FOUNDERS.map((p) => (
              <Reveal
                key={p.init}
                variant="fade-up"
                className="bg-white border border-black/[0.07] rounded-[22px] p-8"
              >
                <div className="flex items-center gap-5">
                  <div
                    className="w-[78px] h-[78px] rounded-full font-sora font-extrabold text-[26px] flex items-center justify-center shrink-0"
                    style={{ background: p.bg, color: p.color }}
                  >
                    {p.init}
                  </div>
                  <div>
                    <div className="font-sora font-bold text-[22px] text-ink tracking-[-0.005em] leading-[1.15]">
                      {p.name}
                    </div>
                    <div className="font-manrope text-[12.5px] text-crimson-600 mt-1 tracking-[0.06em] uppercase">
                      {p.role}
                    </div>
                  </div>
                </div>
                <p className="mt-5 m-0 font-manrope text-[14.5px] leading-[1.68] text-muted">
                  {p.body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ BOARD & ADVISORY BOARD ============ */}
      <section className="bg-cream-100 px-8 py-[100px]">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-[54px] items-start">
          <Reveal variant="fade-up">
            <div className="font-manrope font-bold tracking-[0.22em] text-[11.5px] text-crimson-600 uppercase">
              Board of Directors
            </div>
            <h2 className="mt-[14px] font-sora font-extrabold text-[42px] leading-[1.05] tracking-[-0.025em] text-ink">
              Strategic contribution.
            </h2>

            <div className="mt-8 bg-cream-50 border border-black/[0.07] rounded-[22px] p-7">
              <div className="flex items-center gap-4">
                <div
                  className="w-[64px] h-[64px] rounded-full font-sora font-extrabold text-[20px] flex items-center justify-center shrink-0"
                  style={{ background: "#1A1513", color: "#E9CB8E" }}
                >
                  {BOARD_MEMBER.init}
                </div>
                <div>
                  <div className="font-sora font-bold text-[19px] text-ink tracking-[-0.005em]">
                    {BOARD_MEMBER.name}
                  </div>
                  <div className="font-manrope text-[12px] text-crimson-600 mt-1 tracking-[0.06em] uppercase">
                    {BOARD_MEMBER.role}
                  </div>
                </div>
              </div>
              <p className="mt-4 m-0 font-manrope text-[14px] leading-[1.66] text-muted">
                {BOARD_MEMBER.body}
              </p>
            </div>
          </Reveal>

          <Reveal variant="fade-up" delay={120}>
            <div className="font-manrope font-bold tracking-[0.22em] text-[11.5px] text-crimson-600 uppercase">
              Advisory Board
            </div>
            <span className="mt-3 inline-flex items-center gap-2 px-3 py-[6px] rounded-full bg-crimson-600/10 text-crimson-600 font-sora font-bold text-[10.5px] tracking-[0.16em] uppercase">
              Building in Progress
            </span>
            <h2 className="mt-4 font-sora font-extrabold text-[42px] leading-[1.05] tracking-[-0.025em] text-ink">
              A high-calibre Advisory Board is being assembled.
            </h2>
            <p className="mt-5 font-manrope text-[15px] leading-[1.66] text-muted">
              Across the disciplines a golf-and-communities platform requires.
              Family offices, institutions, and strategic investors welcome.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {ADVISORY_DISCIPLINES.map((d) => (
                <span
                  key={d}
                  className="tier-badge"
                  style={{ background: "rgba(26,21,19,0.08)", color: "#1A1513" }}
                >
                  {d}
                </span>
              ))}
            </div>
            <div className="mt-8">
              <Link
                href="/invest"
                className="cta-gold press"
                style={{ padding: "13px 22px", fontSize: 13.5 }}
              >
                JOIN THE ECOSYSTEM
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ==================== VISION ==================== */}
      <section className="px-8 py-[100px] text-white" style={{ background: "linear-gradient(180deg,#1A1513,#241B17)" }}>
        <div className="max-w-[1100px] mx-auto text-center">
          <Reveal variant="fade-up" className="font-manrope font-bold tracking-[0.32em] text-[12px] text-[#E9CB8E] uppercase">
            Vision
          </Reveal>
          <Reveal variant="fade-up" delay={120} as="p" className="mt-6 mx-auto max-w-[860px] font-sora font-bold leading-[1.35] tracking-[-0.01em]" style={{ fontSize: "clamp(22px,3vw,32px)" }}>
            &ldquo;To identify opportunities where capital, strategic vision,
            and operational expertise can transform underperforming assets
            into high-value enterprises — while creating world-class
            destinations that bring together investment, lifestyle, sport,
            real estate, and community — generating enduring value for
            investors, partners, athletes, and future generations.&rdquo;
          </Reveal>
          <Reveal variant="fade-up" delay={200} className="mt-10 flex flex-wrap gap-3 justify-center">
            <Link
              href="/golf-development"
              className="cta-gold press"
              style={{ padding: "14px 26px", fontSize: 13.5 }}
            >
              THE PLATFORM · GOLF DEVELOPMENT
            </Link>
            <Link
              href="/invest"
              className="press inline-flex items-center gap-2 px-5 py-[12px] rounded-[30px] border border-white/25 text-white font-manrope font-bold text-[13.5px] no-underline"
            >
              PARTNER WITH THE LIONS →
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
