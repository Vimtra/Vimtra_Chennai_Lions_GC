import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import AeText from "@/components/AeText";
import HeroCarousel from "@/components/home/HeroCarousel";

// Hero roster tags. Names + numbers verified from the Chennai Lions IGPL
// brochure p. 06 ("The Roster · Four names. One team sheet.").
const HERO_ROSTER = [
  { no: "01", name: "Gaganjeet Bhullar", align: "left" as const, left: "46px" },
  { no: "02", name: "Harshjeet Singh Sethie", align: "left" as const, left: "30%" },
  { no: "03", name: "Samarth Dwivedi", align: "right" as const, right: "46px" },
];

export default function HomePage() {
  return (
    <div className="font-manrope text-ink bg-cream-100">
      {/* ================= HERO ================= */}
      <section
        id="top"
        className="relative overflow-hidden"
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

        <div className="relative max-w-[1280px] mx-auto h-[778px]">
          {/* Brochure verbatim brand line, p. 06 (The Mark): "Pride of Chennai". */}
          <AeText
            text="PRIDE OF CHENNAI"
            mode="words"
            as="h1"
            className="absolute top-[64px] left-0 right-0 text-center m-0 font-sora font-extrabold text-white z-[1]"
            style={{
              fontSize: "clamp(48px,9.4vw,148px)",
              lineHeight: 0.9,
              letterSpacing: "-0.035em",
              justifyContent: "center",
            }}
          />

          {HERO_ROSTER.map((p, idx) => (
            <Reveal
              key={p.no}
              variant="fade-up"
              delay={120 + idx * 60}
              className="absolute top-[232px] z-[2]"
              style={{
                left: p.left,
                right: p.right,
                textAlign: p.align,
              }}
            >
              <div className="font-sora font-bold text-[12px] text-[#E9CB8E] tracking-[0.12em]">
                {p.no}
              </div>
              <div className="font-manrope font-semibold text-[14px] text-white/90">
                {p.name}
              </div>
            </Reveal>
          ))}

          <div
            className="absolute top-[150px] left-1/2 z-[3] w-[474px] max-w-[90vw]"
            style={{ transform: "translateX(-50%)" }}
          >
            <Reveal variant="zoom-in" delay={120} className="lift">
              <Image
                src="/assets/hero-golfer.png"
                alt="Chennai Lions GC"
                width={474}
                height={560}
                priority
                className="block w-full h-[560px] object-cover"
              />
            </Reveal>
          </div>

          {/* NEXT UP — Season opener presented by Vimtra Chennai Lions GC.
              Brochure p. 12: "23–25 Sept · Am Green IGPL Invitational
              Presented by Vimtra Chennai Lions GC · Al Hamra Golf Club,
              Ras Al Khaimah, UAE". */}
          <Reveal
            variant="fade-left"
            delay={220}
            className="absolute top-[312px] right-[40px] w-[300px] z-[4]"
          >
            <Link
              href="/fixtures"
              className="lift flex flex-col gap-[10px] no-underline rounded-[18px] p-[16px_18px] border border-white/[0.16]"
              style={{
                background: "rgba(24,12,12,0.5)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="font-manrope font-bold text-[10.5px] tracking-[0.32em] text-[#E9CB8E] uppercase">
                Next Up · Season Opener
              </div>
              <div className="font-sora font-extrabold text-[18px] leading-[1.15] text-white tracking-[-0.005em]">
                Al Hamra Golf Club
              </div>
              <div className="font-manrope font-medium text-[12px] text-white/80">
                Ras Al Khaimah, UAE
              </div>
              <div className="mt-1 font-manrope font-semibold text-[12px] text-[#E9CB8E]">
                23–25 September 2026 →
              </div>
            </Link>
          </Reveal>

          {/* AM GREEN IGPL — verified league title partner. Brochure p. 05 & p. 13. */}
          <Reveal
            variant="fade-up"
            delay={280}
            className="absolute bottom-[46px] right-[40px] w-[300px] z-[4]"
          >
            <Link
              href="/the-club"
              className="lift flex items-center justify-between gap-[14px] no-underline rounded-[18px] p-[18px] border border-white/[0.16]"
              style={{
                background: "rgba(24,12,12,0.5)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div>
                <div className="font-sora font-extrabold text-[32px] leading-none text-white tracking-[-0.02em]">
                  15
                </div>
                <div className="font-manrope font-semibold text-[12.5px] text-white mt-[7px]">
                  Events across the season
                </div>
                <div className="font-manrope font-medium text-[11px] text-[#E9CB8E] mt-[3px]">
                  AM Green IGPL · Season 2026
                </div>
              </div>
              <Image
                src="/assets/logo-lion.png"
                alt=""
                width={78}
                height={92}
                className="w-[78px] h-[92px] object-contain shrink-0"
              />
            </Link>
          </Reveal>

          {/* Brochure close: "Chennai's roar — on the world's newest stage." */}
          <Reveal
            variant="fade-up"
            delay={140}
            className="absolute bottom-[54px] left-[46px] z-[4]"
          >
            <AeText
              text="CHENNAI'S ROAR"
              mode="mask"
              as="h2"
              className="m-0 font-sora font-extrabold text-white"
              style={{
                fontSize: "clamp(34px,4.7vw,60px)",
                lineHeight: 0.95,
                letterSpacing: "-0.025em",
              }}
            />
            <div className="mt-2 font-manrope font-semibold text-[13px] text-white/80 tracking-[0.02em]">
              On the world&apos;s newest stage.
            </div>
            <div
              className="mt-4 rounded-[4px]"
              style={{
                width: 72,
                height: 4,
                background: "linear-gradient(90deg,#E6C57E,#C39A52)",
              }}
            />
          </Reveal>
        </div>
      </section>

      {/* ================= FRANCHISE + CAROUSEL ================= */}
      <section id="team" className="bg-cream-100 px-8 pt-[112px] pb-[92px]">
        <div className="max-w-[1200px] mx-auto flex justify-between items-start gap-10 flex-wrap">
          {/* Verified: brochure p. 06 — franchise founded 2026. */}
          <Reveal
            variant="fade-up"
            className="tilt w-[214px] h-[214px] rounded-full bg-cream-50 border border-black/[0.08] flex flex-col items-center justify-center text-center p-[26px] shrink-0"
            style={{ boxShadow: "0 26px 60px -34px rgba(26,21,19,0.45)" }}
          >
            <div className="font-sora font-extrabold text-[48px] text-crimson-600 tracking-[-0.025em] leading-none">
              2026
            </div>
            <div className="font-manrope font-medium text-[12.5px] leading-[1.45] text-muted mt-[9px]">
              Inaugural Chennai Lions Season
            </div>
          </Reveal>

          {/* Verified: brochure p. 06 & p. 13 — owned outright by Vimtra Ventures. */}
          <Reveal
            variant="fade-up"
            delay={100}
            className="flex-1 min-w-[360px] max-w-[660px] bg-cream-50 rounded-[24px] p-[32px_36px] flex gap-[26px] items-start border border-black/[0.06]"
            style={{ boxShadow: "0 26px 60px -38px rgba(26,21,19,0.45)" }}
          >
            <div className="font-sora font-extrabold text-[38px] text-ink bg-white border border-black/[0.08] rounded-[16px] p-[16px_18px] leading-none shrink-0">
              #01
            </div>
            <div>
              <h3 className="m-0 mb-[11px] font-sora font-bold text-[23px] text-ink tracking-[-0.01em]">
                Owned by Vimtra Ventures
              </h3>
              <p className="m-0 font-manrope text-[14.5px] leading-[1.62] text-muted">
                A San Francisco &amp; Chennai-based PE, VC, and investment firm
                founded in 1995. The Chennai Lions are the sporting expression
                of Vimtra&apos;s Indian golf platform — built for the decade of
                franchise golf that begins now.
              </p>
            </div>
          </Reveal>
        </div>

        <div className="relative max-w-[1200px] mx-auto mt-[96px] min-h-[600px]">
          <div
            aria-hidden
            className="absolute inset-0 flex flex-col items-center justify-center text-center z-0 pointer-events-none"
          >
            <span
              className="ae-shimmer font-sora font-extrabold whitespace-nowrap"
              style={{
                fontSize: "clamp(46px,9vw,138px)",
                lineHeight: 0.88,
                letterSpacing: "-0.035em",
                opacity: 0.18,
              }}
            >
              Season · 2026
            </span>
            <span
              className="font-sora font-extrabold whitespace-nowrap"
              style={{
                fontSize: "clamp(46px,9vw,138px)",
                lineHeight: 0.88,
                letterSpacing: "-0.035em",
                color: "rgba(196,32,42,0.11)",
              }}
            >
              AM Green · IGPL
            </span>
          </div>

          <HeroCarousel />
        </div>
      </section>

      {/* ================= HOME GROUND + NEXT UP ================= */}
      <section id="ground" className="bg-cream-50 px-8 pt-[100px] pb-[112px]">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex justify-between items-end gap-8 flex-wrap mb-12">
            <Reveal variant="fade-up">
              <div className="flex items-center gap-[13px] mb-[18px]">
                <div
                  className="w-12 h-12 rounded-[13px] bg-crimson-600 flex items-center justify-center"
                  style={{ boxShadow: "0 12px 26px -14px rgba(196,32,42,0.8)" }}
                >
                  <Image
                    src="/assets/logo-lion.png"
                    alt=""
                    width={34}
                    height={34}
                    className="w-[34px] h-[34px] object-contain"
                  />
                </div>
                <span className="font-manrope font-bold tracking-[0.22em] text-[11.5px] text-crimson-600 uppercase">
                  Home Ground · Season Opener
                </span>
              </div>
              <AeText
                text="Chennai to the world."
                mode="words"
                as="h2"
                className="m-0 font-sora font-extrabold text-ink"
                style={{
                  fontSize: "clamp(34px,5vw,56px)",
                  lineHeight: 1,
                  letterSpacing: "-0.025em",
                }}
              />
            </Reveal>
            <Reveal
              variant="fade-up"
              delay={100}
              as="p"
              className="max-w-[430px] m-0 font-manrope text-[15px] leading-[1.62] text-muted"
            >
              A coastal capital and one of India&apos;s most consistent producers
              of touring professionals — anchoring a season that stretches from
              Chennai to a global calendar of fifteen events.
            </Reveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1.62fr_1fr] gap-6">
            {/* Verified: brochure p. 04 — TNGF Cosmo is the home practice venue. */}
            <Reveal variant="fade-up">
              <Link
                href="/the-club"
                className="lift relative block h-[486px] rounded-[26px] overflow-hidden no-underline"
                style={{ boxShadow: "0 30px 70px -44px rgba(26,21,19,0.5)" }}
              >
                <Image
                  src="/assets/fac-main.png"
                  alt="TNGF Cosmo — home practice venue"
                  fill
                  sizes="(max-width:768px) 100vw, 60vw"
                  className="object-cover"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(180deg,transparent 45%,rgba(20,8,8,0.78) 100%)",
                  }}
                />
                <div className="absolute left-[28px] right-[28px] bottom-[26px] flex justify-between items-end gap-[18px]">
                  <div>
                    <div className="font-manrope font-bold text-[10.5px] tracking-[0.32em] text-[#E9CB8E] uppercase mb-2">
                      Home Practice Venue
                    </div>
                    <h3 className="m-0 mb-2 font-sora font-bold text-[24px] text-white tracking-[-0.01em]">
                      TNGF Cosmo · Chennai
                    </h3>
                    <p className="m-0 font-manrope text-[13.5px] leading-[1.55] text-white/80 max-w-[440px]">
                      The Bay of Bengal at our back, a deep amateur golf base
                      at our feet, and one of the country&apos;s most consistent
                      pipelines of touring pros in front of us.
                    </p>
                  </div>
                  <div className="w-[46px] h-[46px] rounded-full bg-white/[0.14] border border-white/[0.35] backdrop-blur-[6px] text-white flex items-center justify-center text-[18px] shrink-0">
                    →
                  </div>
                </div>
              </Link>
            </Reveal>

            {/* Verified: brochure p. 12 — 23–25 Sept · Al Hamra GC · Ras Al
                Khaimah, UAE — presented by Vimtra Chennai Lions GC. */}
            <Reveal variant="fade-up" delay={120}>
              <Link
                href="/fixtures"
                className="lift relative block h-[486px] rounded-[26px] overflow-hidden no-underline"
                style={{ boxShadow: "0 30px 70px -44px rgba(26,21,19,0.5)" }}
              >
                <Image
                  src="/assets/fac-range.png"
                  alt="Al Hamra Golf Club, Ras Al Khaimah — season opener"
                  fill
                  sizes="(max-width:768px) 100vw, 40vw"
                  className="object-cover"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(180deg,transparent 40%,rgba(20,8,8,0.82) 100%)",
                  }}
                />
                <div className="absolute left-[24px] right-[24px] bottom-[26px]">
                  <div className="font-manrope font-bold text-[10.5px] tracking-[0.32em] text-[#E9CB8E] uppercase mb-2">
                    Next Up · 23–25 Sept 2026
                  </div>
                  <h3 className="m-0 mb-2 font-sora font-bold text-[22px] text-white tracking-[-0.01em]">
                    Al Hamra GC · UAE
                  </h3>
                  <p className="m-0 font-manrope text-[13.5px] leading-[1.55] text-white/80">
                    AM Green IGPL Invitational, presented by Vimtra Chennai
                    Lions GC — the franchise&apos;s Season 2026 opener.
                  </p>
                </div>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= GOLF DEVELOPMENT ================= */}
      {/* Verified: brochure p. 16 (Grassroots & Access) and Vimtra Ventures
          profile — Golf on Wheels (with IGPL, mobile simulators to schools &
          colleges) and the Chennai course + academy under development. */}
      <section id="development" className="bg-cream-100 px-8 pt-[100px] pb-[112px]">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-[54px] items-start">
            <Reveal variant="fade-up">
              <div className="font-manrope font-bold tracking-[0.22em] text-[11.5px] text-crimson-600 uppercase">
                Golf Development
              </div>
              <h2 className="mt-[14px] font-sora font-extrabold text-ink" style={{ fontSize: "clamp(34px,5vw,52px)", lineHeight: 1, letterSpacing: "-0.025em" }}>
                A platform, not a portfolio bet.
              </h2>
              <p className="mt-6 font-manrope text-[15.5px] leading-[1.66] text-muted">
                The Chennai Lions are the sporting expression of a broader
                platform — Vimtra Golf Ventures — that Vimtra is building around
                coaching, academies, event standards, and course operations at
                international championship level.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/invest"
                  className="cta-gold press"
                  style={{ padding: "13px 22px", fontSize: 13.5 }}
                >
                  PARTNER WITH THE LIONS
                </Link>
                <Link
                  href="/golf-development"
                  className="press inline-flex items-center gap-2 px-5 py-[11px] rounded-[30px] border border-ink/25 text-ink font-manrope font-bold text-[13.5px] no-underline"
                >
                  EXPLORE THE PLATFORM →
                </Link>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Reveal
                variant="fade-up"
                delay={80}
                className="bg-cream-50 border border-black/[0.07] rounded-[20px] p-6"
                style={{ boxShadow: "0 26px 60px -38px rgba(26,21,19,0.45)" }}
              >
                <div className="font-manrope font-bold text-[10.5px] tracking-[0.28em] text-crimson-600 uppercase">
                  Grassroots · With IGPL
                </div>
                <h3 className="mt-3 mb-2 font-sora font-bold text-[19px] text-ink tracking-[-0.005em]">
                  Golf on Wheels
                </h3>
                <p className="m-0 font-manrope text-[13.5px] leading-[1.6] text-muted">
                  A schools-and-colleges outreach initiative in collaboration
                  with the IGPL — bringing golf directly to campuses through
                  mobile simulators.
                </p>
              </Reveal>

              <Reveal
                variant="fade-up"
                delay={140}
                className="bg-cream-50 border border-black/[0.07] rounded-[20px] p-6"
                style={{ boxShadow: "0 26px 60px -38px rgba(26,21,19,0.45)" }}
              >
                <div className="font-manrope font-bold text-[10.5px] tracking-[0.28em] text-crimson-600 uppercase">
                  Coming Soon · Chennai
                </div>
                <h3 className="mt-3 mb-2 font-sora font-bold text-[19px] text-ink tracking-[-0.005em]">
                  Course &amp; Academy
                </h3>
                <p className="m-0 font-manrope text-[13.5px] leading-[1.6] text-muted">
                  A world-class golf course and academy under development in
                  Chennai — anchoring professional training, youth development,
                  competition, and community engagement.
                </p>
              </Reveal>

              <Reveal
                variant="fade-up"
                delay={200}
                className="sm:col-span-2 bg-ink text-white rounded-[20px] p-6"
                style={{ boxShadow: "0 26px 60px -38px rgba(26,21,19,0.7)" }}
              >
                <div className="font-manrope font-bold text-[10.5px] tracking-[0.28em] text-[#E9CB8E] uppercase">
                  Signature Thesis
                </div>
                <h3 className="mt-3 mb-2 font-sora font-bold text-[19px] tracking-[-0.005em]">
                  Golf-led HNI communities
                </h3>
                <p className="m-0 font-manrope text-[13.5px] leading-[1.6] text-white/75">
                  Premium golf facilities integrated with luxury residential
                  communities, lifestyle amenities, and investment
                  opportunities — an ecosystem that connects sport, real
                  estate, lifestyle, and long-term economic value.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
