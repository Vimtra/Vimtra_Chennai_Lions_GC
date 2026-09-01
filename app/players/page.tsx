import type { Metadata } from "next";
import Link from "next/link";
import StoryHero from "@/components/site/StoryHero";
import PlayerExperience from "@/components/players/PlayerExperience";
import { Section, SectionTitle } from "@/components/site/Section";
import { FEATURES } from "@/data/players";

export const metadata: Metadata = {
  title: "Players · Vimtra Chennai Lions GC",
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

   In their place is one experience — an editorial selector across the top,
   and a single featured player carrying a large portrait, verified
   metadata, the approved biography, and statistics and signature moments
   only where the brochure actually supplies them.

   NO HERO PHOTOGRAPH: this page's subject is four real, photographed
   players, and their portraits begin immediately below the hero. A stock
   golfer above them would be a stand-in for the very thing the page is
   about. The hero keeps the brand ground and runs compact instead.
--------------------------------------------------------------------------- */

export default function PlayersPage() {
  return (
    <>
      <StoryHero
        eyebrow="AM Green IGPL · Season 2026"
        title={["PLAYERS"]}
        // Brochure p. 06, verbatim.
        line="Four names. One team sheet."
      />

      <PlayerExperience players={FEATURES} />

      <Section surface="ink" size="tight" className="hp-sec-atmos">
        <div className="cm-track cm-close">
          <div className="cm-close-title">
            {/* Brochure p. 06 — "balanced by design". */}
            <SectionTitle lines={["BALANCED", "BY DESIGN."]} />
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
