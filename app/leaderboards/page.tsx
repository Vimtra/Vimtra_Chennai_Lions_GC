import type { Metadata } from "next";
import Link from "next/link";
import PageMasthead from "@/components/site/PageMasthead";
import { Section } from "@/components/site/Section";
import StandingsBoard from "@/components/season/StandingsBoard";
import franchiseStyles from "@/components/season/FranchiseTable.module.css";
import { listStandings } from "@/lib/standings";
import { listFixtures } from "@/lib/fixtures";

export const metadata: Metadata = {
  alternates: { canonical: "/leaderboards" },
  title: "Standings",
  description:
    "Verified AM Green IGPL Season 2026 Chennai Lions event results and standings.",
};

// Standings live in the database. Boards render their real rows the moment
// any exist; until then each one states what it ranks. No illustrative or
// placeholder ranks are ever presented as though they were live.
export const dynamic = "force-dynamic";

const SEASON = 2026;

/* The empty state is factual and counted, not written. "Four events on the
   card, none of them ranked yet" comes from the Fixture and Standing tables;
   if a card is published the same sentence changes on its own.

   No venue photography — see the note at the top of app/fixtures/page.tsx. */

export default async function LeaderboardsPage() {
  const [boards, fixtures] = await Promise.all([
    listStandings(SEASON),
    listFixtures(),
  ]);

  const ranked = boards.team.length;
  const played = fixtures.filter((f) => f.status === "COMPLETED").length;

  const noteTeam =
    played > 0
      ? `${played} of ${fixtures.length} events are complete.`
      : fixtures.length > 0
        ? "No events are complete yet."
        : "The season schedule has not been published yet.";

  return (
    <>
      <PageMasthead
        eyebrow={`AM Green IGPL · Season ${SEASON}`}
        title={["STANDINGS"]}
        image="/assets/photo/ss-standings-hero-green-marsh.jpg"
        imagePosition="52% 58%"
        className={franchiseStyles.mast}
        line="Verified results from across the season."
        status={{
          live: false,
          label: ranked > 0 ? "Standings published" : "Standings pending",
        }}
        stats={[
          { k: "Tables", v: "1" },
          { k: "Events", v: String(fixtures.length) },
          { k: "Ranked", v: String(ranked) },
        ]}
      />

      <Section surface="ink" className={`hp-sec-atmos tb-sec ${franchiseStyles.section}`}>
        <StandingsBoard rows={boards.team} note={noteTeam} />
      </Section>

      <section className="hp-sec hp-sec-paper hp-sec-tight">
        <div className="hp-wrap cm-track ss-links">
          <Link href="/fixtures" className="ss-link">
            <span className="ss-link-k">Tour schedule</span>
            <span className="ss-link-t">Fixtures</span>
          </Link>
          <Link href="/scores" className="ss-link">
            <span className="ss-link-k">Live scoring</span>
            <span className="ss-link-t">Scores</span>
          </Link>
          <Link href="/players" className="ss-link">
            <span className="ss-link-k">The roster</span>
            <span className="ss-link-t">Players</span>
          </Link>
        </div>
      </section>
    </>
  );
}
