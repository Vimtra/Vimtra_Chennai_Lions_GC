import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import AeText from "@/components/AeText";
import HeroCarousel from "@/components/home/HeroCarousel";

/**
 * Home page (Grandstand P2 redesign).
 *
 * Structure — every section maps to one Grandstand background token and
 * shares the same 1200/1400 container grid:
 *
 *   1. HERO           .gs-bg-crimson-vignette (immersive; the brand mark)
 *   2. FRANCHISE      .gs-bg-editorial       (cream, the "who we are")
 *   3. HOME GROUND    .gs-bg-paper           (whiter contrast, the venues)
 *   4. DEVELOPMENT    .gs-bg-editorial       (cream, the "what we're building")
 *
 * The hero is a fluid CSS grid — no more pixel-absolute positioning.
 * Roster tags flank the golfer portrait on desktop; on mobile they stack
 * below the portrait as a 3-column caption row. Info cards behave the
 * same: right column on desktop, stacked below on mobile.
 *
 * Content is preserved verbatim from the brochure-verified pre-redesign
 * version — the redesign changes composition, typography, alignment, and
 * motion; it does NOT invent copy or introduce placeholder content.
 */

// Hero roster — brochure p. 06 ("The Roster · Four names. One team sheet.").
const HERO_ROSTER = [
  { no: "01", name: "Gaganjeet Bhullar" },
  { no: "02", name: "Harshjeet Singh Sethie" },
  { no: "03", name: "Samarth Dwivedi" },
];

export default function HomePage() {
  return (
    <div className="font-manrope text-ink bg-cream-100">
      {/* ==================================================================
          HERO — fluid grid composition on gs-bg-crimson-vignette.
          The gs-on-dark context auto-tints eyebrows gold and swaps
          secondary buttons to a light outline.
      ================================================================== */}
      <section
        className="gs-bg-crimson-vignette gs-on-dark relative overflow-hidden"
        aria-label="Pride of Chennai"
      >
        <div className="gs-container-wide pt-16 pb-16 md:pt-20 md:pb-24 relative">
          {/* Eyebrow */}
          <div className="text-center">
            <span className="gs-eyebrow">
              Vimtra Chennai Lions GC · Season 2026
            </span>
          </div>

          {/* Display headline */}
          <AeText
            text="PRIDE OF CHENNAI"
            mode="words"
            as="h1"
            className="gs-h-display-1 text-white text-center mt-6 md:mt-7"
          />

          {/* Middle band — roster / portrait / info cards.
              Mobile: portrait first, then roster (caption row), then cards.
              Desktop: 12-col grid with roster left, portrait centre, cards right. */}
          <div className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-8 md:items-center">
            {/* Roster tags */}
            <div className="order-2 md:order-none md:col-span-3 md:col-start-1 md:row-start-1">
              <ol className="flex md:flex-col md:items-start justify-around md:justify-start gap-6 md:gap-8">
                {HERO_ROSTER.map((p, i) => (
                  <Reveal
                    key={p.no}
                    variant="fade-up"
                    delay={300 + i * 60}
                    as="li"
                    className="text-center md:text-left"
                  >
                    <div
                      className="font-sora font-bold text-[12px] tracking-[0.14em]"
                      style={{ color: "var(--gs-accent-fill)" }}
                    >
                      {p.no}
                    </div>
                    <div className="mt-1 font-manrope font-semibold text-[13.5px] text-white/90">
                      {p.name}
                    </div>
                  </Reveal>
                ))}
              </ol>
            </div>

            {/* Hero portrait with wipe-in reveal */}
            <div className="order-1 md:order-none md:col-span-6 md:col-start-4 md:row-start-1 flex justify-center">
              <div
                className="relative w-full max-w-[420px] md:max-w-[460px] aspect-[474/560]"
                style={{
                  filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.35))",
                }}
              >
                <div className="gs-hero-wipe-in relative w-full h-full">
                  <Image
                    src="/assets/hero-golfer.png"
                    alt="Chennai Lions GC"
                    fill
                    priority
                    sizes="(max-width: 768px) 90vw, 460px"
                    className="object-contain object-center"
                  />
                </div>
              </div>
            </div>

            {/* Info cards */}
            <div className="order-3 md:order-none md:col-span-3 md:col-start-10 md:row-start-1 flex flex-col gap-4">
              {/* Verified: brochure p. 12 — 23–25 Sept · Al Hamra Golf Club. */}
              <Reveal variant="fade-up" delay={400}>
                <Link href="/fixtures" className="gs-hero-info-card">
                  <div
                    className="font-manrope font-bold text-[10.5px] tracking-[0.32em] uppercase"
                    style={{ color: "var(--gs-accent-fill)" }}
                  >
                    Next Up · Season Opener
                  </div>
                  <div className="mt-2 font-sora font-extrabold text-[18px] leading-[1.15] text-white tracking-[-0.005em]">
                    Al Hamra Golf Club
                  </div>
                  <div className="mt-1 font-manrope font-medium text-[12px] text-white/80">
                    Ras Al Khaimah, UAE
                  </div>
                  <div
                    className="mt-2 font-manrope font-semibold text-[12px]"
                    style={{ color: "var(--gs-accent-fill)" }}
                  >
                    23–25 September 2026 →
                  </div>
                </Link>
              </Reveal>

              {/* Verified: brochure p. 05 & p. 13 — AM Green IGPL, 15 events. */}
              <Reveal variant="fade-up" delay={480}>
                <Link
                  href="/the-club"
                  className="gs-hero-info-card flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="font-sora font-extrabold text-[30px] leading-none text-white tracking-[-0.02em]">
                      15
                    </div>
                    <div className="mt-2 font-manrope font-semibold text-[12.5px] text-white">
                      Events across the season
                    </div>
                    <div
                      className="mt-1 font-manrope font-medium text-[11px]"
                      style={{ color: "var(--gs-accent-fill)" }}
                    >
                      AM Green IGPL · Season 2026
                    </div>
                  </div>
                  <Image
                    src="/assets/logo-lion.png"
                    alt=""
                    width={68}
                    height={80}
                    className="w-[68px] h-[80px] object-contain shrink-0 opacity-90"
                  />
                </Link>
              </Reveal>
            </div>
          </div>

          {/* Bottom band — Chennai's Roar + CTAs */}
          <div className="mt-14 md:mt-20 grid grid-cols-1 md:grid-cols-[1.4fr_auto] gap-6 md:gap-10 md:items-end">
            <Reveal variant="fade-up" delay={520}>
              <AeText
                text="CHENNAI'S ROAR"
                mode="words"
                as="h2"
                className="gs-h-display-3 text-white"
              />
              <p className="mt-3 font-manrope text-[14px] text-white/85">
                On the world&apos;s newest stage.
              </p>
              <div
                aria-hidden
                className="mt-4"
                style={{
                  width: 60,
                  height: 3,
                  borderRadius: 2,
                  background:
                    "linear-gradient(90deg, var(--gold-400), var(--gold-500))",
                }}
              />
            </Reveal>
            <Reveal
              variant="fade-up"
              delay={620}
              className="flex flex-wrap gap-3 md:justify-end"
            >
              <Link href="/fixtures" className="gs-btn gs-btn-primary">
                SEE THE SEASON
              </Link>
              <Link href="/the-club" className="gs-btn gs-btn-secondary">
                MEET THE CLUB
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ==================================================================
          THE FRANCHISE — 2026 badge + Vimtra Ventures + carousel.
      ================================================================== */}
      <section className="gs-bg-editorial gs-section">
        <div className="gs-container">
          <div className="grid grid-cols-1 md:grid-cols-[214px_1fr] gap-8 md:gap-10 items-start">
            {/* Verified: brochure p. 06 — franchise founded 2026. */}
            <Reveal
              variant="fade-up"
              className="tilt w-full max-w-[214px] mx-auto md:mx-0 aspect-square rounded-full bg-cream-50 border border-black/[0.08] flex flex-col items-center justify-center text-center p-6"
              style={{ boxShadow: "var(--gs-elev-1)" }}
            >
              <div className="font-sora font-extrabold text-[48px] text-crimson-600 tracking-[-0.025em] leading-none">
                2026
              </div>
              <div className="mt-2 font-manrope font-medium text-[12.5px] leading-[1.45] text-muted">
                Inaugural Chennai Lions Season
              </div>
            </Reveal>

            {/* Verified: brochure p. 06 & p. 13 — owned outright by Vimtra Ventures. */}
            <Reveal
              variant="fade-up"
              delay={120}
              className="gs-card flex flex-col sm:flex-row gap-6 items-start"
            >
              <div className="font-sora font-extrabold text-[36px] text-ink bg-white border border-black/[0.08] rounded-gs-md px-4 py-3 leading-none shrink-0">
                #01
              </div>
              <div>
                <div className="gs-eyebrow">The Franchise</div>
                <span className="gs-rule" aria-hidden />
                <h2 className="gs-h-1 text-ink">Owned by Vimtra Ventures</h2>
                <p className="mt-3 gs-body">
                  A San Francisco &amp; Chennai-based PE, VC, and investment
                  firm founded in 1995. The Chennai Lions are the sporting
                  expression of Vimtra&apos;s Indian golf platform — built for
                  the decade of franchise golf that begins now.
                </p>
              </div>
            </Reveal>
          </div>

          {/* Carousel with editorial shimmer background — client component
              (HeroCarousel) preserved verbatim; only the wrapper composition
              changed. */}
          <div className="relative mt-20 md:mt-24 min-h-[600px]">
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
                  opacity: 0.16,
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
                  color: "rgba(196,32,42,0.10)",
                }}
              >
                AM Green · IGPL
              </span>
            </div>
            <HeroCarousel />
          </div>
        </div>
      </section>

      {/* ==================================================================
          HOME GROUND + NEXT UP — two full-bleed image cards.
      ================================================================== */}
      <section className="gs-bg-paper gs-section">
        <div className="gs-container">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 md:gap-10 items-end mb-10 md:mb-12">
            <Reveal variant="fade-up">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-gs-md bg-crimson-600 flex items-center justify-center shrink-0"
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
                <span className="gs-eyebrow">Home Ground · Season Opener</span>
              </div>
              <span className="gs-rule mb-4" aria-hidden />
              <AeText
                text="Chennai to the world."
                mode="words"
                as="h2"
                className="gs-h-display-3 text-ink"
              />
            </Reveal>
            <Reveal
              variant="fade-up"
              delay={100}
              as="p"
              className="max-w-[440px] gs-body-lg"
            >
              A coastal capital and one of India&apos;s most consistent
              producers of touring professionals — anchoring a season that
              stretches from Chennai to a global calendar of fifteen events.
            </Reveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1.62fr_1fr] gap-4 md:gap-6">
            {/* Verified: brochure p. 04 — TNGF Cosmo is the home practice venue. */}
            <Reveal variant="fade-up">
              <Link
                href="/the-club"
                className="lift relative block h-[380px] md:h-[486px] rounded-gs-xl overflow-hidden no-underline"
                style={{ boxShadow: "var(--gs-elev-2)" }}
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
                <div className="gs-on-dark absolute left-[28px] right-[28px] bottom-[26px] flex justify-between items-end gap-[18px]">
                  <div>
                    <div
                      className="font-manrope font-bold text-[10.5px] tracking-[0.32em] uppercase mb-2"
                      style={{ color: "var(--gs-accent-fill)" }}
                    >
                      Home Practice Venue
                    </div>
                    <h3 className="gs-h-1 text-white mb-2">
                      TNGF Cosmo · Chennai
                    </h3>
                    <p className="font-manrope text-[13.5px] leading-[1.55] text-white/80 max-w-[440px]">
                      The Bay of Bengal at our back, a deep amateur golf base
                      at our feet, and one of the country&apos;s most
                      consistent pipelines of touring pros in front of us.
                    </p>
                  </div>
                  <div className="w-[46px] h-[46px] rounded-full bg-white/[0.14] border border-white/[0.35] backdrop-blur-[6px] text-white flex items-center justify-center text-[18px] shrink-0">
                    →
                  </div>
                </div>
              </Link>
            </Reveal>

            {/* Verified: brochure p. 12 — 23–25 Sept · Al Hamra GC · Ras Al Khaimah. */}
            <Reveal variant="fade-up" delay={120}>
              <Link
                href="/fixtures"
                className="lift relative block h-[380px] md:h-[486px] rounded-gs-xl overflow-hidden no-underline"
                style={{ boxShadow: "var(--gs-elev-2)" }}
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
                <div className="gs-on-dark absolute left-[24px] right-[24px] bottom-[26px]">
                  <div
                    className="font-manrope font-bold text-[10.5px] tracking-[0.32em] uppercase mb-2"
                    style={{ color: "var(--gs-accent-fill)" }}
                  >
                    Next Up · 23–25 Sept 2026
                  </div>
                  <h3 className="gs-h-1 text-white mb-2">Al Hamra GC · UAE</h3>
                  <p className="font-manrope text-[13.5px] leading-[1.55] text-white/80">
                    AM Green IGPL Invitational, presented by Vimtra Chennai
                    Lions GC — the franchise&apos;s Season 2026 opener.
                  </p>
                </div>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ==================================================================
          GOLF DEVELOPMENT — platform positioning + three tiles.
      ================================================================== */}
      <section className="gs-bg-editorial gs-section">
        <div className="gs-container">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-14 items-start">
            <Reveal variant="fade-up">
              <div className="gs-eyebrow">Golf Development</div>
              <span className="gs-rule" aria-hidden />
              <AeText
                text="A platform, not a portfolio bet."
                mode="words"
                as="h2"
                className="gs-h-display-3 text-ink"
              />
              <p className="mt-6 gs-body-lg">
                The Chennai Lions are the sporting expression of a broader
                platform — Vimtra Golf Ventures — that Vimtra is building
                around coaching, academies, event standards, and course
                operations at international championship level.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/invest" className="gs-btn gs-btn-primary">
                  PARTNER WITH THE LIONS
                </Link>
                <Link
                  href="/golf-development"
                  className="gs-btn gs-btn-secondary"
                >
                  EXPLORE THE PLATFORM →
                </Link>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Verified: brochure p. 16 — Golf on Wheels, in collaboration with IGPL. */}
              <Reveal variant="fade-up" delay={80} className="gs-card">
                <div className="gs-eyebrow">Grassroots · With IGPL</div>
                <h3 className="mt-3 gs-h-2 text-ink">Golf on Wheels</h3>
                <p className="mt-2 gs-body">
                  A schools-and-colleges outreach initiative in collaboration
                  with the IGPL — bringing golf directly to campuses through
                  mobile simulators.
                </p>
              </Reveal>

              {/* Verified: Vimtra Ventures profile — Chennai course + academy in dev. */}
              <Reveal variant="fade-up" delay={140} className="gs-card">
                <div className="gs-eyebrow">Coming Soon · Chennai</div>
                <h3 className="mt-3 gs-h-2 text-ink">Course &amp; Academy</h3>
                <p className="mt-2 gs-body">
                  A world-class golf course and academy under development in
                  Chennai — anchoring professional training, youth development,
                  competition, and community engagement.
                </p>
              </Reveal>

              <Reveal
                variant="fade-up"
                delay={200}
                className="sm:col-span-2 gs-card-dark gs-on-dark"
              >
                <div className="gs-eyebrow">Signature Thesis</div>
                <h3 className="mt-3 gs-h-2">Golf-led HNI communities</h3>
                <p className="mt-2 gs-body">
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
