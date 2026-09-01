import type { Metadata } from "next";
import Link from "next/link";
import StoryHero from "@/components/site/StoryHero";
import FullBleedStatement from "@/components/site/FullBleedStatement";
import { Section, IndexLabel, SectionTitle } from "@/components/site/Section";

export const metadata: Metadata = {
  title: "The Pride · Vimtra Chennai Lions GC",
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

   NO PHOTOGRAPH ON "HOME GROUND": TNGF Cosmo is a real, documented venue
   (brochure p. 04; it is also the footer address and the /contact venue). The
   previous design placed an AI-generated stock image beside that heading and
   captioned it as the venue, which asserted something untrue about a named
   real place. The section is set typographically instead. Add a photograph
   only when the franchise supplies one actually taken there.
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
          Asymmetric split: the display statement across the upper columns,
          the documented body on the left edge, and the brochure's own line
          set as a serif counterweight in the right columns. */}
      <Section surface="ivory">
        <div className="cm-track cm-city">
          <IndexLabel n="01">The City</IndexLabel>

          <div className="cm-city-title">
            <SectionTitle
              lines={["CHENNAI’S ROAR", "ON THE WORLD’S", "NEWEST STAGE."]}
            />
          </div>

          <div className="cm-city-body">
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
          <p className="cm-pull cm-city-pull" data-rise>
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

      {/* 02 — HOME GROUND.
          Typographic only — see the note at the top of this file. */}
      <Section surface="paper">
        <div className="cm-track cm-place">
          <IndexLabel n="02">Home Ground</IndexLabel>

          <div className="cm-place-name">
            <SectionTitle lines={["TNGF COSMO,", "CHENNAI."]} />
          </div>

          {/* Both rows are the franchise's own venue details, as used by
              /contact and the site footer. */}
          <dl className="cm-place-meta" data-rise>
            <div>
              <dt>Home Practice Venue</dt>
              <dd>TNGF Cosmo</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>Chennai · South India</dd>
            </div>
          </dl>

          <p className="cm-place-note" data-rise>
            The franchise&apos;s home practice venue — where the season is
            prepared before it travels.
          </p>
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
