import type { Metadata } from "next";
import Link from "next/link";
import StoryHero from "@/components/site/StoryHero";
import PlayerExperience from "@/components/players/PlayerExperience";
import { Section, SectionTitle } from "@/components/site/Section";
import { FEATURES } from "@/data/players";

export const metadata: Metadata = {
  alternates: { canonical: "/players" },
  title: "Players",
  description:
    "Season 2026 — Gaganjeet Bhullar (marquee), Harshjeet Singh Sethie, Samarth Dwivedi, and Yashas Chandra M S.",
};

/* ---------------------------------------------------------------------------
   CONTENT SOURCES
   Every player fact on this page comes from data/players.ts, which is sourced
   entirely from the Chennai Lions IGPL brochure (Season 2026, per-player
   pages 07-10). Nothing on this page is written to fill a composition, and
   no player appears who is not in that data.

   The "Season 2026 Roster" section — an index label above a grid of four
   equal portrait cards — has been REMOVED in full, and no replacement
   roster-heading section was introduced. The four stacked player features
   that followed it are gone too: they repeated the same four portraits and
   the same four names immediately after the grid had already shown them.

   In their place is one continuous roster — all four players, in squad
   order, each carrying a large portrait, verified metadata, the approved
   biography, and statistics and signature moments only where the brochure
   actually supplies them. Nothing is behind a click: the page is read by
   scrolling it, not by selecting a player.

  HERO PHOTOGRAPH: the shared story treatment uses the approved
  below-the-head golfer frame from public/assets/photo/ as an atmospheric
  lead, while the named player portraits remain the source of truth below.
--------------------------------------------------------------------------- */

export default function PlayersPage() {
  return (
    <>
      {/* `plr-hero` is a page-scoped class, defined in the Players block of
          globals.css. The roster below opens on its own ink field, so the
          hero's aurora is faded out before its lower edge and the two dark
          surfaces meet as one continuous opening instead of banding against
          each other. `StoryHero` itself is untouched — no other page's hero
          changes. */}
      <StoryHero
        className="plr-hero"
        eyebrow="AM Green IGPL · Season 2026"
        title={["PLAYERS"]}
        // Brochure p. 06, verbatim.
        line="Four names. One team sheet."
        image="/assets/photo/club-01-marquee-swing.jpg"
        imageAlt="Golfer mid-swing, cropped below the head"
        imagePosition="50% 42%"
      />

      <PlayerExperience players={FEATURES} />

      <Section surface="ink" size="tight" className="hp-sec-atmos">
        <div className="cm-track cm-close">
          <div className="cm-close-title">
            {/* The franchise's four core pillars, attributed on the record to
                Thimmaji Rao Yammada, Founder & Managing Director, Vimtra
                Ventures — AM Green IGPL, 14 August 2026: "Vimtra Chennai Lions
                GC is built on four core pillars — Pride, Excellence, Heritage
                and Legacy." The four words are quoted; only their arrangement
                is editorial. The same four are set as the numbered register on
                /the-pride. */}
            {/* One pillar per line. `.mq-line` masks each line with
                `overflow:hidden` + `white-space:nowrap`, so a line wider than
                its column is silently shaved rather than wrapped — and this
                title sits in 7 of 12 columns. Set as two lines
                ("PRIDE. EXCELLENCE." / "HERITAGE. LEGACY.") the first line
                needed 996px in a 797px column at 1920 and lost the word
                EXCELLENCE entirely, at every width from 1024 up. Four lines
                also read better for what this is: a list of four values. */}
            <SectionTitle
              lines={["PRIDE.", "EXCELLENCE.", "HERITAGE.", "LEGACY."]}
            />
          </div>
          <div className="cm-close-actions" data-rise>
            <Link href="/fixtures" className="hp-btn hp-btn-primary">
              SEE THE SEASON
              <span className="hp-arrow" aria-hidden>
                →
              </span>
            </Link>
            <Link href="/the-club" className="hp-btn hp-btn-ghost hp-on-dark">
              The story of the club
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
