import type { Metadata } from "next";
import Link from "next/link";
import StoryHero from "@/components/site/StoryHero";
import { Section, IndexLabel, SectionTitle } from "@/components/site/Section";
import { listStandings } from "@/lib/standings";
import LeaderboardTabs from "@/components/leaderboards/LeaderboardTabs";

export const metadata: Metadata = {
  title: "Leaderboards · Vimtra Chennai Lions GC",
  description:
    "AM Green IGPL Season 2026 standings — franchise table, Player of the Season race, and Order of Merit. Populates as verified season data becomes available.",
};

// Standings live in the database. The locked state renders whenever no rows
// exist for the current season — no illustrative or placeholder ranks are
// ever presented as though they were live.
export const dynamic = "force-dynamic";

const SEASON = 2026;

/* ---------------------------------------------------------------------------
   With no verified rows yet, this page does not apologise with an empty
   card. It states what the three boards ARE and what each one will rank —
   described by the columns the schema actually carries, not by invented
   marketing copy — so a visitor understands the ranking system before a
   single row exists. The moment standings are keyed in, the same page
   renders the real tables instead.

   No venue photography — see the note at the top of app/fixtures/page.tsx.
--------------------------------------------------------------------------- */

const BOARDS = [
  {
    name: "Franchise Table",
    cols: "Position · Franchise · Events · Points · Best finish · Average score",
  },
  {
    name: "Player of the Season",
    cols: "Position · Player · Franchise · Top tens · Wins · Points",
  },
  {
    name: "Order of Merit",
    cols: "Position · Player · Events · Earnings · Average per event",
  },
];

export default async function LeaderboardsPage() {
  const boards = await listStandings(SEASON);
  const total = boards.team.length + boards.player.length + boards.order.length;

  return (
    <>
      <StoryHero
        eyebrow={`AM Green IGPL · Season ${SEASON}`}
        title={["LEADER", "BOARDS"]}
        line="Three boards. One season."
      />

      {total > 0 ? (
        <Section surface="ivory">
          <LeaderboardTabs seasonYear={SEASON} boards={boards} />
        </Section>
      ) : (
        <>
          {/* The boards, named and defined while they are still empty. */}
          <Section surface="ivory">
            <div className="cm-track cm-statement">
              <IndexLabel n="01">The boards</IndexLabel>
              <h2 className="cm-display" data-rise>
                THREE WAYS TO
                <br />
                READ A <em>season</em>.
              </h2>
              <div className="cm-statement-support" data-rise>
                <p>
                  Standings unlock as the season progresses. Nothing on this
                  page is fabricated — no illustrative ranks, no projected
                  points. Each board below populates the moment verified
                  Season {SEASON} data is available.
                </p>
              </div>
            </div>

            <ol className="ss-boards hp-mt-lg">
              {BOARDS.map((b, i) => (
                <li key={b.name} data-rise>
                  <span className="ss-board-n">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="ss-board-name">{b.name}</span>
                  </span>
                  <p className="ss-board-cols">{b.cols}</p>
                </li>
              ))}
            </ol>
          </Section>

          {/* The honest status, stated once and clearly. */}
          <Section surface="ink" className="hp-sec-atmos">
            <div className="cm-track cm-statement">
              <IndexLabel n="02" tone="dark">
                Status
              </IndexLabel>
              <h2 className="cm-display" data-rise>
                STANDINGS
                <br />
                <em>locked</em>.
              </h2>
              <div className="cm-statement-support" data-rise>
                <p>
                  The Chennai Lions play their first ball of Season {SEASON} at
                  the season opener. Franchise points, the Player of the Season
                  race and the Order of Merit are all published here from
                  verified season data as it is confirmed.
                </p>
              </div>
            </div>
          </Section>
        </>
      )}

      <Section surface="paper" size="tight">
        <div className="cm-track ss-links">
          <Link href="/fixtures" className="ss-link">
            <span className="ss-link-k">Season 2026</span>
            <span className="ss-link-t">Fixtures</span>
          </Link>
          <Link href="/scores" className="ss-link">
            <span className="ss-link-k">Live scoring</span>
            <span className="ss-link-t">Scores</span>
          </Link>
          <Link href="/players" className="ss-link">
            <span className="ss-link-k">The roster</span>
            <span className="ss-link-t">The Players</span>
          </Link>
        </div>
      </Section>
    </>
  );
}
