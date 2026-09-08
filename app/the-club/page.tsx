import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import StoryHero from "@/components/site/StoryHero";
import ClubBuild, { type Take } from "@/components/club/ClubBuild";
import { Section, IndexLabel } from "@/components/site/Section";

export const metadata: Metadata = {
  alternates: { canonical: "/the-club" },
  title: "The Club",
  description:
    "Chennai's franchise in the AM Green IGPL — founded 2026, owned outright by Vimtra Ventures, built for the decade of franchise golf.",
};

/* ---------------------------------------------------------------------------
   THE CLUB — five sections, five different compositions.

   CONTENT SOURCES
   Every string on this page comes from the Chennai Lions IGPL brochure
   (Season 2026) or the Vimtra Ventures profile. Nothing is written to fill a
   layout. Where a composition needed more room it was solved with type,
   colour, image scale and spacing — never with new copy. No statistic,
   date, achievement, venue or business claim has been added.

   WHY EACH SECTION LOOKS DIFFERENT
     01  Gate         split frame — photograph one side, ink type panel the
                      other, a gold seam between them. Not a banner.
     02  Manifesto    the page's one saturated crimson field, with the
                      franchise mark bled across it and the two documented
                      paragraphs dropped asymmetrically. Not a text band.
     03  The build    four takes as ONE cascading spread on paper, numerals
                      breaking the frame edges. Not four alternating rows.
     04  The kit      a hanging-label spec column beside a continuous
                      vertical colour spectrum that bleeds off the page.
                      Not a swatch chart.
     05  Sign-off     a two-tone display lockup over a full-width "next"
                      rail. Not a heading with two buttons.

   Surfaces run ink → crimson → paper → ivory → ink, so the page has a
   rhythm rather than four variations of ivory-and-rules.

   NOT ON THIS PAGE, DELIBERATELY
   The "franchise in numbers" statistics band was removed earlier and is not
   reproduced here or anywhere else on the page.

   The "Leadership · Vimtra Ventures" section — the two founder portraits and
   the governance roll — was also removed earlier and has NOT been brought
   back. No founder or team portrait appears on this page, and no leadership
   biography is duplicated from /vimtra-ventures. Nothing was lost with it:
   the ownership fact is stated in the gate's own line and again in the
   manifesto copy, and the header and footer both link to the firm.

   PHOTOGRAPHY: licensed frames already in public/assets/photo/ (see
   CREDITS.md there for source, licence and the no-identifiable-face rule).
   No new image was sourced for this redesign — the five frames the page
   already owned were re-composed instead. Alt text describes the scene
   only: these are generic stock locations, so nothing is captioned as a
   Lions venue.
--------------------------------------------------------------------------- */

// How the team was built — brochure p. 06 ("Four names. One team sheet.")
// plus p. 04 for the home city. Copy is the brochure's own framing.
const TAKES: Take[] = [
  {
    n: "01",
    title: "Marquee",
    // Brochure p. 06 — "MARQUEE · A proven international marquee".
    body:
      "A proven international marquee at the front of the team sheet — a signal to the roster, the gallery, and the calendar.",
    image: "/assets/photo/club-01-marquee-swing.jpg",
    alt: "A golfer at the moment of impact from the tee",
    position: "45% 46%",
  },
  {
    n: "02",
    title: "Domestic Core",
    // Brochure p. 06 — "…a proven domestic winner, an internationally ranked
    // pro, and a rising IGPL competitor — balanced by design".
    body:
      "A proven domestic winner, an internationally ranked pro, and an active IGPL competitor — balanced by design.",
    image: "/assets/photo/club-02-core-aerial-green.jpg",
    alt: "A putting green photographed from the air, players grouped on the surface",
    position: "50% 44%",
  },
  {
    n: "03",
    title: "Long Game",
    // Brochure p. 06 — "Our commitment is not to a single season. It is to
    // the decade of Indian franchise golf that begins now."
    body:
      "A commitment measured in decades, not seasons — every roster and infrastructure decision made against a ten-year horizon.",
    image: "/assets/photo/club-03-longgame-coastal.jpg",
    alt: "A coastal golf course seen from above, the open sea beyond it",
    position: "50% 56%",
  },
  {
    n: "04",
    title: "Home City",
    // Brochure p. 04 — "A coastal capital, a deep amateur golf base, and one
    // of the country's most consistent producers of touring professionals."
    body:
      "Chennai. A coastal capital, a deep amateur golf base, and one of the country's most consistent producers of touring pros.",
    image: "/assets/photo/club-04-chennai-coast.jpg",
    alt: "A coastal city meeting the shoreline, the beach running the length of the frame",
    position: "50% 46%",
  },
];

// Brochure p. 13 — kit palette, verbatim labels and hex values, in the
// brochure's own order.
const PALETTE = [
  { label: "Pride Red", hex: "#C4202A" },
  { label: "Highlight Gold", hex: "#C39A52" },
  { label: "Court Yellow", hex: "#F2D66C" },
  { label: "Stadium Cream", hex: "#F4F0E8" },
  { label: "Jet Black", hex: "#1A1513" },
];

// Brochure p. 13 — title sponsor "am green", kit manufacturer "FIRSTCUT".
const KIT_CREDITS = [
  {
    tag: "Title Partner",
    name: "am green",
    detail: "League-wide title partner and kit sponsor.",
  },
  {
    tag: "Kit Manufacturer",
    name: "FIRSTCUT",
    detail: "Kit production partner for the 2026 season.",
  },
];

export default function TheClubPage() {
  return (
    <>
      {/* 01 — THE GATE.
          REDESIGNED — now the same `StoryHero` every other chapter page
          (/the-pride, /players, /golf-development, /invest, /fixtures, and
          the rest of the eleven routes that already share it) uses, for
          the same visual language across the site. `.cl-hero-full` below
          is the one page-specific rule: it makes THIS instance of the
          shared hero exactly 100vh (100svh where supported) — `StoryHero`
          itself is untouched, so no other page's hero height changes. */}
      <div className="cl-hero-full">
        <StoryHero
          eyebrow="AM Green IGPL · Season 2026"
          title={["THE", "CLUB"]}
          line="Chennai's franchise in the AM Green Indian Golf Premier League. Owned outright by Vimtra Ventures."
          image="/assets/photo/club-hero-fairway-dusk.jpg"
          imageAlt="A championship fairway and treeline under a dusk sky"
          imagePosition="58% 46%"
          cta={{ href: "/players", label: "MEET THE PRIDE" }}
        />
      </div>

      {/* 02 — THE MANIFESTO.
          The page's one saturated crimson field. The franchise's own mark is
          the image — cropped hard, bled off the top and right, and held at
          low contrast so it reads as a ground rather than a logo drop.

          The two documented paragraphs are NOT set as equal columns: the
          first carries the statement at lede scale on the left edge, the
          second is dropped low and offset into the right columns at body
          scale. The asymmetry is the composition; neither paragraph was cut
          or extended to achieve it. */}
      <Section surface="ink" className="cl-mf-sec">
        <div className="cm-track cl-mf">
          <span className="cl-mf-crest" aria-hidden>
            <Image
              src="/assets/logo-crest-mono.png"
              alt=""
              fill
              sizes="(max-width: 1023px) 90vw, 46vw"
            />
          </span>

          <div className="cl-mf-head">
            <IndexLabel n="02" tone="dark">
              Identity
            </IndexLabel>
            <h2 className="cl-mf-h">
              <span className="mq-line" data-line>
                <span>A FRANCHISE</span>
              </span>
              <span className="mq-line" data-line>
                <span>BUILT FOR THE</span>
              </span>
              <span className="mq-line" data-line>
                <span>
                  <em>long game</em>.
                </span>
              </span>
            </h2>
          </div>

          <p className="cl-mf-lede" data-rise>
            The Chennai Lions are Chennai&apos;s roar in a global league — a
            team built to compete on day one and grow through the
            international leg of a fifteen-event season. Every roster decision
            was made against the same test: can this team compete week to
            week, and can it grow through the season?
          </p>

          <p className="cl-mf-drop" data-rise>
            The commitment is not to a single season. It is to the decade of
            Indian franchise golf that begins now — anchored by Vimtra
            Ventures and a home city with a deep amateur base.
          </p>
        </div>
      </Section>

      {/* 03 — THE BUILD. See components/club/ClubBuild.tsx. */}
      <Section surface="paper" className="cl-build-sec">
        <div className="cm-track cl-build-head">
          <IndexLabel n="03">How the team was built</IndexLabel>
          <h2 className="cl-build-h">
            <span className="mq-line" data-line>
              <span>FOUR NAMES.</span>
            </span>
            <span className="mq-line" data-line>
              <span>ONE TEAM SHEET.</span>
            </span>
          </h2>
        </div>
        <div className="hp-wrap cl-build-reel">
          <ClubBuild items={TAKES} />
        </div>
      </Section>

      {/* 04 — THE KIT.
          REDESIGNED. The palette used to render as five stacked flat-colour
          rows in a right-hand column — a swatch chart standing next to a
          spec sheet, two unrelated shapes side by side. It's now one
          full-bleed composition: the statement runs the width of the page
          first, then a single blended gradient strip beneath it — the
          actual visual referent for "a white-to-court-yellow gradient" —
          bleeding to both true page edges, with each brand colour called
          out by a tick and a label hanging below its own position on the
          strip rather than boxed inside it. The two kit credits close the
          section as a pair of plates, not a hairline-divided list.

          The gradient's colour STOPS are exactly the five verified hex
          values, evenly spaced (0/25/50/75/100%) — nothing added, nothing
          reordered from the brochure's own sequence. */}
      <Section surface="ivory" className="cl-kit-sec">
        <div className="cm-track cl-kit">
          <IndexLabel n="04">The Kit · Season 2026</IndexLabel>

          <h2 className="cl-kit-h">
            <span className="mq-line" data-line>
              <span>A WHITE-TO-</span>
            </span>
            <span className="mq-line" data-line>
              <span>COURT-YELLOW</span>
            </span>
            <span className="mq-line" data-line>
              <span>GRADIENT.</span>
            </span>
          </h2>
          <p className="cl-kit-lede" data-rise>
            Designed to travel from Chennai heat to floodlit international
            venues without losing the team&apos;s visual identity.
          </p>
        </div>

        <div className="cl-kit-strip-wrap" data-rise>
          <div
            className="cl-kit-strip"
            style={{
              ["--stops" as string]: PALETTE.map(
                (p, i) => `${p.hex} ${(i / (PALETTE.length - 1)) * 100}%`
              ).join(", "),
            }}
          />
          <ol className="cl-kit-ticks">
            {PALETTE.map((p, i) => (
              <li
                key={p.label}
                style={{
                  ["--pos" as string]: `${(i / (PALETTE.length - 1)) * 100}%`,
                }}
              >
                <span className="cl-kit-tick" aria-hidden />
                <span className="cl-kit-tick-l">{p.label}</span>
                <span className="cl-kit-tick-h">{p.hex}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="cm-track cl-kit-credits-track">
          <dl className="cl-kit-credits">
            {KIT_CREDITS.map((k) => (
              <div key={k.name} data-rise>
                <dt>{k.tag}</dt>
                <dd>
                  <span className="cl-kit-spec-n">{k.name}</span>
                  <span className="cl-kit-spec-d">{k.detail}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      {/* 05 — THE SIGN-OFF.
          Not a heading with two buttons beside it. The page's last words are
          a two-tone display lockup that fills the frame, and under it a
          full-width rail of the two places the reader goes next — each a
          ruled row that fills with crimson from the left on hover. The
          kickers name the destination; nothing about either is a claim.

          Deliberately NOT the shared `.cm-close`, which /the-pride,
          /players, /golf-development, /vimtra-ventures and the home page all
          render — those keep it untouched. */}
      <Section surface="ink" className="cl-end-sec hp-sec-atmos">
        <div className="cl-end">
          <h2 className="cl-end-h">
            <span className="mq-line" data-line>
              <span>CHENNAI&rsquo;S</span>
            </span>
            <span className="mq-line" data-line>
              <span className="cl-end-roar">ROAR.</span>
            </span>
          </h2>

          <ul className="cl-end-next" data-rise>
            <li>
              <Link href="/players">
                <span className="cl-end-k">Season 2026 · the roster</span>
                <span className="cl-end-t">Meet the Pride</span>
                <span className="cl-end-a" aria-hidden>
                  →
                </span>
              </Link>
            </li>
            <li>
              <Link href="/partners">
                <span className="cl-end-k">Commercial partnerships</span>
                <span className="cl-end-t">Partner with the Lions</span>
                <span className="cl-end-a" aria-hidden>
                  →
                </span>
              </Link>
            </li>
          </ul>
        </div>
      </Section>
    </>
  );
}
