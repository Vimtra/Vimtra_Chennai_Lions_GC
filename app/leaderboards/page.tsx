import type { Metadata } from "next";
import Link from "next/link";
import { listStandings } from "@/lib/standings";
import LeaderboardTabs from "@/components/leaderboards/LeaderboardTabs";
import PageHero from "@/components/site/PageHero";
import { Section, IndexLabel, SectionTitle, EmptyState } from "@/components/site/Section";

export const metadata: Metadata = {
  title: "Leaderboards · Vimtra Chennai Lions GC",
  description:
    "AM Green IGPL Season 2026 standings — franchise table, Player of the Season race, and Order of Merit. Populates as verified season data becomes available.",
};

// Standings live in the database. Empty state renders whenever no rows
// exist for the current season — no illustrative or placeholder ranks are
// ever presented as though they were live.
export const dynamic = "force-dynamic";

const SEASON = 2026;

export default async function LeaderboardsPage() {
  const boards = await listStandings(SEASON);
  const total = boards.team.length + boards.player.length + boards.order.length;

  return (
    <>
      <PageHero
        variant="compact"
        eyebrow={`AM Green IGPL · Season ${SEASON} Standings`}
        title={["LEADER", "BOARDS"]}
        lead={
    <>
      Three boards for the {SEASON} season — the Franchise Table, the Player of the Season race, and the Order of Merit. Rows appear here as verified season data becomes available.
    </>
  }
      />

      <Section surface="ivory" size="tight">
        {total === 0 ? (
          <EmptyState
            eyebrow="Season 2026 · Standings Locked"
            title="Standings unlock as the season progresses."
            body="Nothing is fabricated on this page. The Franchise Table, Player of the Season race, and Order of Merit populate here once verified season data is available."
          />
        ) : (
          <LeaderboardTabs seasonYear={SEASON} boards={boards} />
        )}
      </Section>
    </>
  );
}
