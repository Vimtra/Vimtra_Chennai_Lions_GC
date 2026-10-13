import type { Metadata } from "next";
import Link from "next/link";
import PageMasthead from "@/components/site/PageMasthead";
import ScoreExperience, {
  type BoardEvent,
  type ScoreRow,
} from "@/components/season/ScoreExperience";
import scoreStyles from "@/components/season/ScoreExperience.module.css";
import { listFixtures } from "@/lib/fixtures";
import { listScoresForFixture } from "@/lib/scores";
import { formatFixtureDate, fixtureDay, fixtureMon } from "@/lib/fixtures-format";
import { ROSTER } from "@/data/players";
import type { Fixture } from "@prisma/client";

export const metadata: Metadata = {
  alternates: { canonical: "/scores" },
  title: "Scores",
  description:
    "Round scoring for the Vimtra Chennai Lions across the AM Green IGPL Season 2026 — each event's board, lit as verified cards are published.",
};

// Live rounds change every few minutes during a tournament week; always
// resolve against the current DB row set.
export const dynamic = "force-dynamic";

/* ---------------------------------------------------------------------------
   Nothing on this page is fabricated.

   Every event, venue, date and leg comes from the Fixture table. Every score
   comes from the Score table. Where the Score table holds nothing for an
   event the board is drawn unlit rather than filled with provisional or
   illustrative numbers — see ScoreExperience.

   The masthead rail counts real rows: fixtures on the card, and how many of
   them currently have a published card. Both are computed here, not typed in.

   No venue photography — see the note at the top of app/fixtures/page.tsx.
--------------------------------------------------------------------------- */

/** The roster, lowercased, so a scored row can be marked as one of ours. */
const ROSTER_NAMES = new Set(ROSTER.map((p) => p.fullName.trim().toLowerCase()));

/** Split a compound fixture name when it includes a venue separator. */
function splitName(name: string): { lead: string; tail: string } {
  const i = name.lastIndexOf(" · ");
  if (i === -1) return { lead: "", tail: name };
  return { lead: name.slice(0, i), tail: name.slice(i + 3) };
}

function placeOf(f: Fixture): string {
  return f.city === f.country ? f.city : `${f.city}, ${f.country}`;
}

/**
 * Leaderboard order.
 *
 * `listScoresForFixture` orders by `position`, which is a String column, so
 * the database sorts it lexically: 1, 4, 5, 6, T2, T2. On a leaderboard that
 * is simply wrong. Positions are golf notation ("1", "T2", "T10", "CUT",
 * "WD"), so they are ranked here instead — leading "T" stripped, numeric
 * part compared, anything non-numeric or absent held at the bottom in its
 * existing order. The query is left alone: this is a presentation concern
 * and the admin surface reads the same rows.
 */
function positionRank(position: string | null): number {
  if (!position) return Number.MAX_SAFE_INTEGER;
  const n = Number(position.trim().replace(/^t/i, ""));
  return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
}

export default async function ScoresPage() {
  // No card list rather than a 500 if the database is briefly unreachable.
  // The failure is remembered so the page says "unavailable" rather than
  // "not published" — the two are different facts, and the masthead rail
  // prints "—" instead of a count of zero it cannot vouch for.
  let fixturesFailed = false;
  const fixtures = await listFixtures().catch(() => {
    fixturesFailed = true;
    return [] as Fixture[];
  });

  // One read per fixture. Four rows today; the page is force-dynamic and
  // these are indexed lookups on fixtureId.
  //
  // Caught PER FIXTURE, deliberately: a bare Promise.all rejects the whole
  // page if a single score read fails, which would lose the event cards that
  // did load. Falling back to no rows for just that fixture draws that one
  // board unlit — "No verified rows" — while its neighbours still light. That
  // is the state the board was designed to hold, and it never invents a
  // score. The failed read is flagged so that board says "unavailable"
  // rather than claiming nothing has been published.
  const withScores = await Promise.all(
    fixtures.map(async (f) => {
      let failed = false;
      const scores = await listScoresForFixture(f.id).catch(() => {
        failed = true;
        return [];
      });
      return { f, scores, failed };
    })
  );

  const events: BoardEvent[] = withScores.map(({ f, scores, failed }) => {
    const { lead, tail } = splitName(f.name);
    const rows: ScoreRow[] = scores
      .map((s, i) => ({ s, i }))
      // Stable: equal positions keep the order the query returned them in,
      // which is already alphabetical by player.
      .sort(
        (a, b) =>
          positionRank(a.s.position) - positionRank(b.s.position) || a.i - b.i
      )
      .map(({ s }) => ({
        id: s.id,
        position: s.position,
        playerName: s.playerName,
        r1: s.r1,
        r2: s.r2,
        r3: s.r3,
        // Stored column; the board only draws R4 when a row carries it.
        r4: s.r4,
        thru: s.thru,
        score: s.total ?? s.today ?? null,
        today: s.today,
        total: s.total,
        lions: ROSTER_NAMES.has(s.playerName.trim().toLowerCase()),
      }));
    return {
      id: f.id,
      lead,
      tail,
      fullName: f.name,
      leg: f.leg,
      presentedBy: f.presentedBy,
      course: f.courseName,
      place: placeOf(f),
      dates: formatFixtureDate(f),
      day: fixtureDay(f),
      mon: fixtureMon(f),
      startsAt: new Date(f.dateStart).toISOString(),
      status: f.status,
      rows,
      unavailable: failed,
    };
  });

  const orderedEvents = [...events].sort((a, b) => {
    const now = Date.now();
    const aTime = new Date(a.startsAt).getTime();
    const bTime = new Date(b.startsAt).getTime();
    const aAfterNow = aTime >= now;
    const bAfterNow = bTime >= now;

    if (aAfterNow !== bAfterNow) {
      return aAfterNow ? -1 : 1;
    }

    return Math.abs(aTime - now) - Math.abs(bTime - now);
  });

  // The score experience groups the complete verified schedule by status.
  const live = orderedEvents.find((e) => e.status === "LIVE");

  const cardsPublished = events.filter((e) => e.rows.length > 0).length;
  const anyLive = Boolean(live);

  return (
    <>
      <PageMasthead
        eyebrow="AM Green IGPL · Season 2026"
        title={["SCORES"]}
        image="/assets/photo/ss-scores-hero-twilight-course.jpg"
        imagePosition="50% 68%"
        className={scoreStyles.mast}
        line={
          anyLive
            ? "A round is in play."
            : "Live rounds, upcoming events and published scorecards."
        }
        status={{
          live: anyLive,
          label: anyLive
            ? "Round in progress"
            : fixturesFailed
              ? "Scoring unavailable"
              : "No round in play",
        }}
        stats={[
          { k: "Events", v: fixturesFailed ? "—" : String(events.length) },
          { k: "Scorecards", v: fixturesFailed ? "—" : String(cardsPublished) },
        ]}
      />

      <ScoreExperience events={orderedEvents} unavailable={fixturesFailed} />

      <section className="hp-sec hp-sec-paper hp-sec-tight">
        <div className="hp-wrap cm-track ss-links">
          <Link href="/fixtures" className="ss-link">
            <span className="ss-link-k">Season schedule</span>
            <span className="ss-link-t">Fixtures</span>
          </Link>
          <Link href="/leaderboards" className="ss-link">
            <span className="ss-link-k">League table</span>
            <span className="ss-link-t">Standings</span>
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
