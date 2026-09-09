import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import StoryHero from "@/components/site/StoryHero";
import FullBleedStatement from "@/components/site/FullBleedStatement";
import { Section, IndexLabel, SectionTitle } from "@/components/site/Section";

export const metadata: Metadata = {
  alternates: { canonical: "/the-pride" },
  title: "The Pride",
  description:
    "Chennai's roar on the world's newest stage — the emotional charter of the Vimtra Chennai Lions and the fifteen-event AM Green IGPL Season 2026.",
};

/* ---------------------------------------------------------------------------
   CONTENT SOURCES
   This page carries the emotional / brand story. Every sentence on it already
   existed in the approved copy for this route or is cited to the Chennai Lions
   IGPL brochure (Season 2026). Nothing was written to fill a composition.

   The "The season in numbers" band (2026 / 10 / 15 / 5) has been REMOVED in
   full. It is not reproduced anywhere else on the page, and no replacement
   statistics section was introduced.

   PHOTOGRAPHY: public/assets/photo/ — see CREDITS.md for source, licence and
   the no-identifiable-face rule. Two frames on this page, both new: neither is
   used on /the-club or in the header panel.

--------------------------------------------------------------------------- */

export default function ThePridePage() {
  return (
    <>
      <StoryHero
        eyebrow="The Mark · Pride of Chennai"
        title={["THE PRIDE"]}
        // Existing approved lead, cut to its strongest clause. The hero
        // carries one line; the full statement lives in section 01.
        line="A franchise carries a city, not a company. The Lions belong to Chennai."
        image="/assets/photo/pride-hero-dawn-coast.jpg"
        imageAlt="A crimson dawn breaking over the open sea"
        imagePosition="50% 32%"
      />

      {/* 01 — THE CITY.
          A vertical composition, deliberately unlike The Club's Identity
          plate (a horizontal ink field bleeding off the right edge). Here a
          single tall photographic column runs the FULL height of the
          section — top edge to bottom edge, under the section's own padding
          — and the type is set against it in the left columns. The serif
          counterweight then crosses the whole width beneath both.

          THE PHOTOGRAPH is a lighthouse on an open beachfront, cropped to
          the tower alone. It is here because it is architecture rather than
          scenery: it gives the section a vertical, urban subject in the
          franchise's own crimson and white, and it is the one frame on this
          page that is not the sea. Per public/assets/photo/CREDITS.md the
          alt text describes the scene and does not assert a location. */}
      <Section surface="ivory" className="pr-city-sec">
        <div className="cm-track pr-city">
          <IndexLabel n="01">The City</IndexLabel>

          <figure className="pr-city-col">
            <Image
              src="/assets/photo/pride-city-lighthouse.jpg"
              alt="A red and white lighthouse tower against a clear sky"
              fill
              sizes="(max-width: 1023px) 100vw, 26vw"
              style={{ objectPosition: "50% 40%" }}
            />
          </figure>

          <div className="pr-city-h">
            <SectionTitle
              lines={["CHENNAI’S ROAR", "ON THE WORLD’S", "NEWEST STAGE."]}
            />
          </div>

          <div className="pr-city-body">
            <p data-rise>
              The Bay of Bengal at our back, a deep amateur golf base at our
              feet, and one of the country&apos;s most consistent pipelines of
              touring professionals in front of us. The Lions are the sporting
              expression of that city — carried into a fifteen-event season
              that stretches from Chennai to a global calendar.
            </p>
            <Link href="/the-club" className="hp-btn hp-btn-text" data-rise>
              The story of the club
              <span className="hp-arrow" aria-hidden>
                →
              </span>
            </Link>
          </div>

          {/* Brochure p. 06 — "A team built for the long game." */}
          <p className="cm-pull pr-city-pull" data-rise>
            A team built for the long game.
          </p>
        </div>
      </Section>

      {/* TRANSITION — full-width visual chapter.
          The line is brand copy with no geographic claim, so the generic
          coastal frame beneath it is never read as a named place. */}
      <FullBleedStatement
        line={["THE SPORTING", "EXPRESSION", "OF THAT CITY."]}
        image="/assets/photo/pride-sea-green-pin.jpg"
        imageAlt="A putting green and pin flag on high ground above the open sea"
        imagePosition="52% 58%"
      />

      {/* 02 — THE FOUR PILLARS.
          Added in the September 2026 content audit. Source: AM Green
          IGPL's own news article on theigpl.com, "Vimtra Chennai Lions GC
          Unveils Squad, Sets Sights On Building Chennai's Golfing Legacy"
          (Chennai, 14 August 2026) — attributed on the record to Thimmaji
          Rao Yammada, Founder & Managing Director, Vimtra Ventures. Not in
          any of the three brochures; verified directly against the live
          article before being added here. Quoted, not paraphrased.

          REDESIGNED A THIRD TIME. The first pass reused the venue-name
          heading treatment above it and clipped. The second replaced that
          with a single typographic column — four words at full display
          scale, colour-alternated, the middle two indented — which solved
          the clipping but read as a poster: four huge, diagonally-offset
          lines with nothing structural connecting them, and a lot of
          unclaimed space around each one.

          THIS PASS keeps the same ink ground and the same restraint on
          invented content — nothing quoted below changed a single word —
          but replaces the stacked poster with an architectural four-up
          register (`.pr-pillars`), the same numbered-and-ruled idiom the
          rest of the module already uses for a list of things (`.cal`,
          `.gd-index`, `.iv-pillar-set`), rather than a one-off. Each value
          gets an ordinal, a short gold rule and a controlled (not
          maximal) display word; thin hairlines between them do the
          structural work the old version asked pure whitespace to do.
          The quote moves to its own quieter register below — a gold
          spine on its left edge, like a pull-quote in print, so it reads
          as an attributed statement rather than a fifth headline. */}
      <Section surface="ink" className="hp-sec-atmos">
        <div className="cm-track pr-values">
          <IndexLabel n="02" tone="dark">Values</IndexLabel>

          <div className="pr-values-head">
            <SectionTitle lines={["THE FOUR", "PILLARS."]} className="pr-values-h" />
          </div>

          <ol className="pr-pillars">
            {["Pride", "Excellence", "Heritage", "Legacy"].map((w, i) => (
              <li className="pr-pillar" key={w} data-rise>
                <span className="pr-pillar-n" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="pr-pillar-rule" aria-hidden />
                <span className="pr-pillar-w">{w}</span>
              </li>
            ))}
          </ol>

          <div className="pr-values-quote">
            <blockquote className="cm-pull" data-rise>
              &ldquo;Vimtra Chennai Lions GC is built on four core pillars —
              Pride, Excellence, Heritage and Legacy. We want the Lions to
              embody the spirit of Chennai.&rdquo;
            </blockquote>
            <p className="cm-pull-by" data-rise>
              Thimmaji Rao Yammada, Founder &amp; Managing Director, Vimtra
              Ventures — AM Green IGPL, 14 August 2026
            </p>
          </div>
        </div>
      </Section>

      {/* CLOSING */}
      <Section surface="ink" size="tight" className="hp-sec-atmos">
        <div className="cm-track cm-close">
          <div className="cm-close-title">
            <SectionTitle lines={["ONE CITY.", "ONE PRIDE."]} />
          </div>
          <div className="cm-close-actions" data-rise>
            <Link href="/players" className="hp-btn hp-btn-primary">
              MEET THE PLAYERS
              <span className="hp-arrow" aria-hidden>
                →
              </span>
            </Link>
            <Link href="/fixtures" className="hp-btn hp-btn-ghost hp-on-dark">
              See the season
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
