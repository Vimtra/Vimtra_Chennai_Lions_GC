import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import StoryHero from "@/components/site/StoryHero";
import Chapters, { type Chapter } from "@/components/site/Chapters";
import { Section, IndexLabel, SectionTitle } from "@/components/site/Section";

export const metadata: Metadata = {
  title: "The Club · Vimtra Chennai Lions GC",
  description:
    "Chennai's franchise in the AM Green IGPL — founded 2026, owned outright by Vimtra Ventures, built for the decade of franchise golf.",
};

/* ---------------------------------------------------------------------------
   CONTENT SOURCES
   Every string on this page comes from the Chennai Lions IGPL brochure
   (Season 2026) or the Vimtra Ventures profile. Nothing is written to fill
   a layout. Where a composition needed more room it was solved with type,
   image and spacing — never with new copy.

   The former "The franchise in numbers" statistics band has been removed
   in full and is not reproduced anywhere else on the page.

   PHOTOGRAPHY: real licensed photographs from public/assets/photo/ (see the
   CREDITS.md in that directory for source, licence and the no-identifiable-
   face rule). Each section uses a different frame — no image is repeated on
   this page or shared with the header's mega panel. Alt text describes the
   scene only: these are generic stock locations, so nothing here is captioned
   as a Lions venue.
--------------------------------------------------------------------------- */

// How the team was built — brochure p. 06 ("Four names. One team sheet.")
// plus p. 04 for the home city. Copy is the brochure's own framing.
const CHAPTERS: Chapter[] = [
  {
    n: "01",
    title: "Marquee",
    // Brochure p. 06 — "MARQUEE · A proven international marquee".
    body:
      "A proven international marquee at the front of the team sheet — a signal to the roster, the gallery, and the calendar.",
    image: "/assets/photo/club-01-marquee-swing.jpg",
    alt: "A golfer at the moment of impact from the tee",
    position: "45% 50%",
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
    position: "50% 42%",
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
    position: "50% 58%",
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
    position: "50% 45%",
  },
];

// Brochure p. 13 — kit palette, verbatim labels and hex values.
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

// Named leadership — Vimtra Ventures profile & brochure pp. 14, 16.
// Photographed principals carry the section; the full biographies live on
// /vimtra-ventures rather than being duplicated here.
const PRINCIPALS = [
  {
    name: "Subash Yammada",
    role: "Founder & CEO",
    image: "/assets/subash-yammada-web.jpg",
    position: "50% 16%",
    alt: "Subash Yammada — Founder & CEO, Vimtra Ventures",
  },
  {
    name: "Thimmaji Rao Yammada",
    role: "Founder & Managing Director",
    image: "/assets/thimmaji-rao-yammada-web.jpg",
    position: "50% 26%",
    alt: "Thimmaji Rao Yammada — Founder & Managing Director, Vimtra Ventures",
  },
];

// Brochure p. 16 — the remainder of the governance, stated as a ruled index.
const GOVERNANCE = [
  {
    name: "Ravi Babu Mannam",
    role:
      "Board of Directors · strengthening the firm's leadership and advisory ecosystem and the expansion of its golf and community-development initiatives.",
  },
  {
    name: "Advisory Board",
    role:
      "Being assembled across business, investments, golf, real estate, infrastructure, community development, branding, and sports management.",
  },
];

export default function TheClubPage() {
  return (
    <>
      <StoryHero
        eyebrow="AM Green IGPL · Season 2026"
        title={["THE CLUB"]}
        line="Chennai's franchise in the AM Green Indian Golf Premier League. Owned outright by Vimtra Ventures."
        image="/assets/photo/club-hero-fairway-dusk.jpg"
        imageAlt="A championship fairway and treeline under a dusk sky"
        imagePosition="50% 50%"
        cta={{ href: "/players", label: "MEET THE PRIDE" }}
      />

      {/* 01 — IDENTITY.
          One dominant idea: a display statement, with the two documented
          paragraphs set as supporting copy offset into the right columns. */}
      <Section surface="ivory">
        <div className="cm-track cm-statement">
          <IndexLabel n="01">Identity</IndexLabel>
          <h2 className="cm-display" data-rise>
            A FRANCHISE BUILT
            <br />
            FOR THE <em>long game</em>.
          </h2>
          <div className="cm-statement-support" data-rise>
            <p>
              The Chennai Lions are Chennai&apos;s roar in a global league — a
              team built to compete on day one and grow through the
              international leg of a fifteen-event season. Every roster
              decision was made against the same test: can this team compete
              week to week, and can it grow through the season?
            </p>
            <p>
              The commitment is not to a single season. It is to the decade of
              Indian franchise golf that begins now — anchored by Vimtra
              Ventures and a home city with a deep amateur base.
            </p>
          </div>
        </div>
      </Section>

      {/* 02 — HOW THE TEAM WAS BUILT.
          A numbered visual timeline on deep ink: numeral, heading, short
          documented copy, one photograph per chapter, sides alternating. */}
      <Section surface="ink" className="hp-sec-atmos">
        <div className="cm-track cm-statement">
          <IndexLabel n="02" tone="dark">
            How the team was built
          </IndexLabel>
          <h2 className="cm-display" data-rise>
            FOUR NAMES.
            <br />
            ONE TEAM SHEET.
          </h2>
        </div>
        <div className="hp-mt-lg">
          <Chapters items={CHAPTERS} />
        </div>
      </Section>

      {/* 03 — THE KIT.
          The palette as one continuous colour field rather than five swatch
          cards, with the two verified kit credits ruled beneath it. */}
      <Section surface="paper">
        <div className="cm-track cm-kit">
          <div className="cm-kit-head">
            <IndexLabel n="03">The Kit · Season 2026</IndexLabel>
            <SectionTitle
              lines={["A WHITE-TO-", "COURT-YELLOW", "GRADIENT."]}
            />
            <p className="cm-lede" data-rise>
              Designed to travel from Chennai heat to floodlit international
              venues without losing the team&apos;s visual identity.
            </p>
          </div>

          <div className="cm-spectrum" data-rise>
            <ul className="cm-band">
              {PALETTE.map((p) => (
                <li key={p.label}>
                  <span
                    className="cm-band-f"
                    style={{ ["--c" as string]: p.hex }}
                    aria-hidden
                  />
                  <span className="cm-band-k">
                    <span className="cm-band-l">{p.label}</span>
                    <span className="cm-band-h">{p.hex}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="cm-credits" data-rise>
            <ul>
              {KIT_CREDITS.map((k) => (
                <li key={k.name}>
                  <span className="cm-credit-tag">{k.tag}</span>
                  <span>
                    <span className="cm-credit-name">{k.name}</span>
                    <span className="cm-credit-detail">{k.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* 04 — LEADERSHIP · VIMTRA VENTURES.
          Photography carries the section; the firm's relationship to the
          franchise is stated in the rail; the rest of the governance is a
          ruled index. No person cards, no duplicated biographies. */}
      <Section surface="ivory">
        <div className="cm-track cm-lead">
          <div className="cm-lead-rail">
            <IndexLabel n="04">Leadership · Vimtra Ventures</IndexLabel>
            <SectionTitle lines={["THE BRAIN", "BEHIND", "THE TEAM."]} />
            <p className="cm-lede" data-rise>
              Vimtra Ventures is a San Francisco &amp; Chennai-based PE, VC,
              and investment firm — founded 1995, operating as principal
              across six verticals. The Lions are owned outright by the firm.
            </p>
            <Link href="/vimtra-ventures" className="hp-btn hp-btn-text" data-rise>
              About the firm
              <span className="hp-arrow" aria-hidden>
                →
              </span>
            </Link>
          </div>

          <div className="cm-lead-main">
            <div className="cm-figs">
              {PRINCIPALS.map((p) => (
                <figure className="cm-fig" key={p.name} data-rise>
                  <div className="cm-fig-frame">
                    <Image
                      src={p.image}
                      alt={p.alt}
                      fill
                      sizes="(max-width: 559px) 100vw, (max-width: 1023px) 50vw, 340px"
                      style={{ objectPosition: p.position }}
                    />
                  </div>
                  <figcaption className="cm-fig-cap">
                    <span className="cm-fig-name">{p.name}</span>
                    <span className="cm-fig-role">{p.role}</span>
                  </figcaption>
                </figure>
              ))}
            </div>

            <ul className="cm-roll">
              {GOVERNANCE.map((g) => (
                <li key={g.name} data-rise>
                  <span className="cm-roll-name">{g.name}</span>
                  <span className="cm-roll-role">{g.role}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* CLOSING */}
      <Section surface="ink" size="tight" className="hp-sec-atmos">
        <div className="cm-track cm-close">
          <div className="cm-close-title">
            <SectionTitle lines={["CHENNAI’S ROAR."]} />
          </div>
          <div className="cm-close-actions" data-rise>
            <Link href="/players" className="hp-btn hp-btn-primary">
              MEET THE PRIDE
              <span className="hp-arrow" aria-hidden>
                →
              </span>
            </Link>
            <Link href="/partners" className="hp-btn hp-btn-ghost hp-on-dark">
              Partner with the Lions
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
