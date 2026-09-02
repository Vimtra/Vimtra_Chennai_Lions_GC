import type { Metadata } from "next";
import Link from "next/link";
import PageMasthead from "@/components/site/PageMasthead";
import { Section } from "@/components/site/Section";
import StandingsBoard from "@/components/season/StandingsBoard";
import { listStandings } from "@/lib/standings";
import { listFixtures } from "@/lib/fixtures";

export const metadata: Metadata = {
  title: "Leaderboards · Vimtra Chennai Lions GC",
  description:
    "AM Green IGPL Season 2026 standings — the Franchise Table, the Player of the Season race and the Order of Merit, published from verified season data.",
};

// Standings live in the database. Boards render their real rows the moment
// any exist; until then each one states what it ranks. No illustrative or
// placeholder ranks are ever presented as though they were live.
export const dynamic = "force-dynamic";

const SEASON = 2026;

/* ---------------------------------------------------------------------------
   Three boards, presented as one championship spread rather than a tabbed
   widget: each is its own chapter, on its own ground, with its own figure —
   points for the two points races, rupees for the Order of Merit.

   The empty state is factual and counted, not written. "Four events on the
   card, none of them ranked yet" comes from the Fixture and Standing tables;
   if a card is published the same sentence changes on its own.

   No venue photography — see the note at the top of app/fixtures/page.tsx.
--------------------------------------------------------------------------- */

export default async function LeaderboardsPage() {
  const [boards, fixtures] = await Promise.all([
    listStandings(SEASON),
    listFixtures(),
  ]);

  const ranked =
    boards.team.length + boards.player.length + boards.order.length;
  const played = fixtures.filter((f) => f.status === "COMPLETED").length;

  // One counted line for the first board, and a distinct line for each of
  // the others. Repeating a single paragraph under all three read as
  // boilerplate, and the count only belongs where it is first stated.
  const noteTeam =
    played > 0
      ? `${played} of ${fixtures.length} Season ${SEASON} events have been played. Ranked rows publish here as the league confirms them.`
      : `Season ${SEASON} has ${fixtures.length} events on the card. Ranked rows publish here as the league confirms them.`;
  const notePlayer =
    "Nothing provisional and no projected points are published on this board.";
  const noteOrder =
    "Prize money is published here only once the league has confirmed it.";

  return (
    <>
      <PageMasthead
        eyebrow={`AM Green IGPL · Season ${SEASON}`}
        title={["LEADER", "BOARDS"]}
        image="/assets/photo/ss-standings-hero-green-marsh.jpg"
        imagePosition="52% 58%"
        line="Three boards. One season."
        status={{
          live: false,
          label: ranked > 0 ? "Standings published" : "Standings pending",
        }}
        stats={[
          { k: "Boards", v: "3" },
          { k: "Events", v: String(fixtures.length) },
          { k: "Ranked", v: String(ranked) },
        ]}
      />

      {/* 01 — the franchise race, on the championship ground. */}
      <Section surface="ink" className="hp-sec-atmos tb-sec">
        <StandingsBoard board="team" rows={boards.team} note={noteTeam} />
      </Section>

      {/* 02 — the player race, lifted onto ivory so the spread breathes. */}
      <Section surface="ivory" className="tb-sec">
        <StandingsBoard board="player" rows={boards.player} note={notePlayer} />
      </Section>

      {/* 03 — the money list, back on ink where the figures carry. */}
      <Section surface="ink" className="hp-sec-atmos tb-sec">
        <StandingsBoard board="order" rows={boards.order} note={noteOrder} />
      </Section>

      <section className="hp-sec hp-sec-paper hp-sec-tight">
        <div className="hp-wrap cm-track ss-links">
          <Link href="/fixtures" className="ss-link">
            <span className="ss-link-k">Season 2026</span>
            <span className="ss-link-t">Fixtures</span>
          </Link>
          <Link href="/scores" className="ss-link">
            <span className="ss-link-k">Round scoring</span>
            <span className="ss-link-t">Scores</span>
          </Link>
          <Link href="/players" className="ss-link">
            <span className="ss-link-k">The roster</span>
            <span className="ss-link-t">The Players</span>
          </Link>
        </div>
      </section>
    </>
  );
}
