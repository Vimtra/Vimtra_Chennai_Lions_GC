import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import AeText from "@/components/AeText";

export const metadata: Metadata = {
  title: "Golf Development · Vimtra Chennai Lions GC",
  description:
    "Vimtra's Indian golf platform — coaching, academies, event standards, and course operations to international championship level, alongside Golf on Wheels and a Chennai course + academy under development.",
};

// Every claim on this page is sourced from the Chennai Lions IGPL brochure
// (pp. 02–03, 15, 16) or the Vimtra Ventures profile. Current vs planned
// initiatives are marked explicitly so nothing "under development" reads
// as if it has shipped.

// Brochure p. 03 — the operating framework.
const FRAMEWORK = [
  {
    tag: "Operating Framework",
    name: "Vimtra Golf Ventures",
    body:
      "The dedicated Indian golf operating entity — coaching curriculum, coach certification, event standards, and course-operating standards under a single institutional authority.",
  },
  {
    tag: "Franchise",
    name: "Chennai Lions GC · IGPL Season 2026",
    body:
      "Vimtra's Indian golf platform expressed as a competitive team — anchored by a proven marquee, built around a rising domestic core.",
  },
];

// Brochure p. 15 — signature thesis and three anchors, verbatim.
const ANCHORS = [
  {
    label: "Anchor · 01",
    title: "Premium Golf",
    body:
      "World-class facilities to international championship standards.",
  },
  {
    label: "Anchor · 02",
    title: "Luxury Residential",
    body: "HNI communities integrated with the course itself.",
  },
  {
    label: "Anchor · 03",
    title: "Lifestyle & Investment",
    body:
      "Amenities, hospitality and long-cycle asset value.",
  },
];

// Vimtra Ventures profile — the profile's own framing of the Chennai
// Lions build.
const HIGH_PERFORMANCE = [
  {
    label: "Talent",
    body: "Identifying and nurturing elite golfing talent.",
  },
  {
    label: "Pathways",
    body: "Strengthening professional pathways for Indian golfers.",
  },
  {
    label: "Ecosystem",
    body: "Building a strong leadership and advisory ecosystem.",
  },
  {
    label: "Platform",
    body:
      "Creating a globally competitive platform for Indian professional golf.",
  },
];

export default function GolfDevelopmentPage() {
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
            The Platform
          </div>
          <AeText
            text="GOLF DEVELOPMENT"
            mode="words"
            as="h1"
            className="mt-[14px] font-sora font-extrabold text-white"
            style={{
              fontSize: "clamp(48px,8vw,124px)",
              lineHeight: 0.9,
              letterSpacing: "-0.035em",
            }}
          />
          <Reveal
            variant="fade-up"
            delay={120}
            as="p"
            className="max-w-[660px] mt-[22px] font-manrope text-[17px] leading-[1.6] text-white/85"
          >
            A platform, not a portfolio bet. Vimtra Ventures — the firm behind
            the Chennai Lions — is actively involved in the development and
            promotion of golf in India, building a professional ecosystem
            across coaching, academies, events, and course operations to
            international championship standards.
          </Reveal>
        </div>
      </section>

      {/* ================== OPERATING FRAMEWORK ================== */}
      <section className="bg-cream-100 px-8 pt-[100px] pb-[92px]">
        <div className="max-w-[1200px] mx-auto">
          <Reveal variant="fade-up" className="mb-[46px]">
            <div className="font-manrope font-bold tracking-[0.22em] text-[11.5px] text-crimson-600 uppercase">
              Operating Framework
            </div>
            <h2 className="mt-[14px] font-sora font-extrabold text-[46px] leading-[1.05] tracking-[-0.025em] text-ink">
              The institutional authority
              <br />
              behind the game.
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FRAMEWORK.map((f) => (
              <Reveal
                key={f.name}
                variant="fade-up"
                className="bg-cream-50 border border-black/[0.07] rounded-[22px] p-8"
                style={{ boxShadow: "0 26px 60px -38px rgba(26,21,19,0.45)" }}
              >
                <div className="font-manrope font-bold text-[10.5px] tracking-[0.28em] text-crimson-600 uppercase">
                  {f.tag}
                </div>
                <h3 className="mt-3 mb-3 font-sora font-extrabold text-[26px] text-ink tracking-[-0.015em] leading-[1.15]">
                  {f.name}
                </h3>
                <p className="m-0 font-manrope text-[14.5px] leading-[1.66] text-muted">
                  {f.body}
                </p>
              </Reveal>
            ))}
          </div>

          <Reveal
            variant="fade-up"
            delay={140}
            className="mt-8 bg-ink text-white rounded-[22px] p-8"
            style={{ boxShadow: "0 26px 60px -38px rgba(26,21,19,0.7)" }}
          >
            <div className="font-manrope font-bold text-[10.5px] tracking-[0.28em] text-[#E9CB8E] uppercase">
              High-Performance Franchise
            </div>
            <h3 className="mt-3 mb-3 font-sora font-extrabold text-[24px] tracking-[-0.015em]">
              Chennai Lions GC is being developed as a high-performance franchise.
            </h3>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {HIGH_PERFORMANCE.map((h) => (
                <div
                  key={h.label}
                  className="rounded-[14px] p-4 border border-white/[0.1]"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                >
                  <div className="font-sora font-bold text-[12px] tracking-[0.16em] uppercase text-[#E9CB8E]">
                    {h.label}
                  </div>
                  <div className="mt-2 font-manrope text-[13.5px] leading-[1.55] text-white/80">
                    {h.body}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* =============== SIGNATURE THESIS · HNI =============== */}
      <section className="bg-cream-50 px-8 py-[100px] border-y border-black/[0.06]">
        <div className="max-w-[1200px] mx-auto">
          <Reveal variant="fade-up" className="mb-[46px]">
            <div className="font-manrope font-bold tracking-[0.22em] text-[11.5px] text-crimson-600 uppercase">
              Signature Thesis
            </div>
            <h2 className="mt-[14px] font-sora font-extrabold text-[46px] leading-[1.05] tracking-[-0.025em] text-ink">
              Golf-led HNI communities.
            </h2>
            <p className="mt-6 max-w-[820px] font-manrope text-[15.5px] leading-[1.66] text-muted">
              Vimtra&apos;s core focus is the development of premium golf
              facilities integrated with luxury residential communities,
              lifestyle amenities, and investment opportunities — built at
              world-class standards for a globally mobile audience. The intent
              is an integrated ecosystem that connects sport, real estate,
              lifestyle, community, and long-term economic value. Chennai Lions
              GC is the sporting expression of the same platform.
            </p>
          </Reveal>

          <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
            {ANCHORS.map((a, i) => (
              <Reveal
                key={a.title}
                variant="fade-up"
                delay={i * 80}
                className="bg-white border border-black/[0.07] rounded-[22px] p-7"
              >
                <div className="font-manrope font-bold text-[10.5px] tracking-[0.28em] text-crimson-600 uppercase">
                  {a.label}
                </div>
                <h3 className="mt-3 mb-2 font-sora font-extrabold text-[24px] text-ink tracking-[-0.015em] leading-[1.15]">
                  {a.title}
                </h3>
                <p className="m-0 font-manrope text-[14.5px] leading-[1.66] text-muted">
                  {a.body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* =============== GRASSROOTS · GOLF ON WHEELS =============== */}
      <section className="bg-cream-100 px-8 py-[100px]">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-[54px] items-start">
          <Reveal variant="fade-up">
            <div className="font-manrope font-bold tracking-[0.22em] text-[11.5px] text-crimson-600 uppercase">
              Grassroots &amp; Access · Current
            </div>
            <span className="mt-3 inline-flex items-center gap-2 px-3 py-[6px] rounded-full bg-crimson-600/10 text-crimson-600 font-sora font-bold text-[10.5px] tracking-[0.16em] uppercase">
              Now Running · With IGPL
            </span>
            <h2 className="mt-[18px] font-sora font-extrabold text-[46px] leading-[1.05] tracking-[-0.025em] text-ink">
              Reaching the next generation.
            </h2>
            <p className="mt-5 font-manrope text-[15.5px] leading-[1.66] text-muted">
              Alongside luxury development, Vimtra is committed to extending
              the reach of the sport itself — through <strong>Golf on Wheels</strong>,
              a schools-and-colleges outreach initiative in collaboration with
              the IGPL that brings golf directly to campuses via mobile
              simulators.
            </p>
            <p className="mt-4 font-manrope text-[15.5px] leading-[1.66] text-muted">
              The initiative is designed to broaden golf&apos;s reach, encourage
              grassroots participation, and help identify and nurture the next
              generation of golfing talent across India.
            </p>
          </Reveal>

          <Reveal variant="fade-up" delay={120} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div
              className="bg-cream-50 border border-black/[0.07] rounded-[20px] p-6"
              style={{ boxShadow: "0 26px 60px -38px rgba(26,21,19,0.45)" }}
            >
              <div className="font-manrope font-bold text-[10.5px] tracking-[0.28em] text-crimson-600 uppercase">
                Mechanism
              </div>
              <h3 className="mt-3 mb-2 font-sora font-bold text-[19px] text-ink tracking-[-0.005em]">
                Mobile simulators
              </h3>
              <p className="m-0 font-manrope text-[13.5px] leading-[1.6] text-muted">
                Bringing the range to the child — golf delivered on-site,
                at campuses, without asking the sport&apos;s traditional cost
                of entry.
              </p>
            </div>
            <div
              className="bg-cream-50 border border-black/[0.07] rounded-[20px] p-6"
              style={{ boxShadow: "0 26px 60px -38px rgba(26,21,19,0.45)" }}
            >
              <div className="font-manrope font-bold text-[10.5px] tracking-[0.28em] text-crimson-600 uppercase">
                Setting
              </div>
              <h3 className="mt-3 mb-2 font-sora font-bold text-[19px] text-ink tracking-[-0.005em]">
                Schools &amp; Colleges
              </h3>
              <p className="m-0 font-manrope text-[13.5px] leading-[1.6] text-muted">
                On-campus camps and clinics — an affordable and accessible
                introduction to the sport.
              </p>
            </div>
            <div
              className="sm:col-span-2 bg-ink text-white rounded-[20px] p-6"
              style={{ boxShadow: "0 26px 60px -38px rgba(26,21,19,0.7)" }}
            >
              <div className="font-manrope font-bold text-[10.5px] tracking-[0.28em] text-[#E9CB8E] uppercase">
                Delivered In Collaboration With
              </div>
              <h3 className="mt-3 mb-2 font-sora font-bold text-[19px] tracking-[-0.005em]">
                AM Green Indian Golf Premier League (IGPL)
              </h3>
              <p className="m-0 font-manrope text-[13.5px] leading-[1.6] text-white/75">
                Broaden the reach, encourage grassroots participation, and help
                identify and nurture the next generation of golfing talent
                across India.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ COMING SOON · CHENNAI COURSE + ACADEMY ============ */}
      <section className="px-8 py-[100px] text-white" style={{ background: "linear-gradient(180deg,#1A1513,#241B17)" }}>
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-[54px] items-start">
          <Reveal variant="fade-up">
            <div className="font-manrope font-bold tracking-[0.32em] text-[12px] text-[#E9CB8E] uppercase">
              Coming Soon · Chennai
            </div>
            <span className="mt-3 inline-flex items-center gap-2 px-3 py-[6px] rounded-full bg-[#E9CB8E]/10 text-[#E9CB8E] font-sora font-bold text-[10.5px] tracking-[0.16em] uppercase">
              Under Development
            </span>
            <h2 className="mt-[18px] font-sora font-extrabold leading-[1.05] tracking-[-0.025em]" style={{ fontSize: "clamp(38px,5.4vw,60px)" }}>
              A course and academy in Chennai.
            </h2>
            <p className="mt-5 font-manrope text-[15.5px] leading-[1.66] text-white/75">
              Vimtra also plans to develop a world-class golf course and academy
              in Chennai — creating a comprehensive platform for professional
              training, youth development, competition, and community engagement.
            </p>
          </Reveal>

          <Reveal variant="fade-up" delay={120} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { l: "Training", d: "Professional training environment for the roster and the pipeline." },
              { l: "Youth Development", d: "A permanent home for junior programmes." },
              { l: "Competition", d: "Venue-grade infrastructure for tournament-week golf." },
              { l: "Community", d: "A gathering place for Chennai's golf public and its Pride." },
            ].map((t) => (
              <div
                key={t.l}
                className="p-6 rounded-[18px] border border-white/[0.1]"
                style={{ background: "rgba(255,255,255,0.02)" }}
              >
                <div className="font-manrope font-bold text-[10.5px] tracking-[0.28em] text-[#E9CB8E] uppercase">
                  {t.l}
                </div>
                <p className="mt-3 m-0 font-manrope text-[14px] leading-[1.6] text-white/78">
                  {t.d}
                </p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ============================= CLOSE ============================= */}
      <section className="bg-cream-100 px-8 py-[100px]">
        <div className="max-w-[1100px] mx-auto text-center">
          <Reveal variant="fade-up">
            <div className="font-manrope font-bold tracking-[0.22em] text-[11.5px] text-crimson-600 uppercase">
              Vision
            </div>
            <p className="mt-6 mx-auto max-w-[820px] font-sora font-bold text-[clamp(22px,3vw,32px)] leading-[1.35] tracking-[-0.015em] text-ink">
              &ldquo;To identify opportunities where capital, strategic vision,
              and operational expertise can transform underperforming assets
              into high-value enterprises — while creating world-class
              destinations that bring together investment, lifestyle, sport,
              real estate, and community — generating enduring value for
              investors, partners, athletes, and future generations.&rdquo;
            </p>
          </Reveal>
          <Reveal variant="fade-up" delay={120} className="mt-10 flex flex-wrap gap-3 justify-center">
            <Link
              href="/vimtra-ventures"
              className="cta-gold press"
              style={{ padding: "14px 26px", fontSize: 13.5 }}
            >
              THE FIRM · VIMTRA VENTURES
            </Link>
            <Link
              href="/invest"
              className="press inline-flex items-center gap-2 px-5 py-[12px] rounded-[30px] border border-ink/25 text-ink font-manrope font-bold text-[13.5px] no-underline"
            >
              PARTNER WITH THE LIONS →
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
