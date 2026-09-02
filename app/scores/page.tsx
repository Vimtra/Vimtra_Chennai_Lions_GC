import type { Metadata } from "next";
import Link from "next/link";
import SeasonMasthead from "@/components/season/SeasonMasthead";
import ScoreExperience, {
  type BoardEvent,
  type ScoreRow,
} from "@/components/season/ScoreExperience";
import { listFixtures } from "@/lib/fixtures";
import { listScoresForFixture } from "@/lib/scores";
import { formatFixtureDate, fixtureDay, fixtureMon } from "@/lib/fixtures-format";
import { ROSTER } from "@/data/players";
import type { Fixture } from "@prisma/client";

export const metadata: Metadata = {
  title: "Scores · Vimtra Chennai Lions GC",
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

/** "Am Green IGPL Invitational 2026 · Al Hamra" → lead + tail. */
function splitName(name: string): { lead: string; tail: string } {
  const i = name.lastIndexOf(" · ");
  if (i === -1) return { lead: "Season 2026", tail: name };
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
  const fixtures = await listFixtures();

  // One read per fixture. Four rows today; the page is force-dynamic and
  // these are indexed lookups on fixtureId.
  const withScores = await Promise.all(
    fixtures.map(async (f) => ({ f, scores: await listScoresForFixture(f.id) }))
  );

  const events: BoardEvent[] = withScores.map(({ f, scores }) => {
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
        r4: s.r4,
        thru: s.thru,
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
      status: f.status,
      rows,
    };
  });

  // The board opens on whatever is most current: a live round, else the most
  // recent event that actually has a published card, else the next one up,
  // else the first fixture on the calendar.
  const live = events.find((e) => e.status === "LIVE");
  const lastCard = [...events].reverse().find((e) => e.rows.length > 0);
  const nextUp = events.find((e) => e.status === "UPCOMING");
  const opening = live ?? lastCard ?? nextUp ?? events[0];
  const ordered = opening
    ? [opening, ...events.filter((e) => e.id !== opening.id)]
    : events;

  const cardsPublished = events.filter((e) => e.rows.length > 0).length;
  const anyLive = Boolean(live);

  return (
    <>
      <SeasonMasthead
        eyebrow="AM Green IGPL · Season 2026"
        title={["SCORES"]}
        image="/assets/photo/ss-scores-hero-twilight-course.jpg"
        imagePosition="50% 68%"
        line={
          anyLive
            ? "A round is in play."
            : "Round by round, as each card is verified."
        }
        status={{
          live: anyLive,
          label: anyLive ? "Round in progress" : "Scoring offline",
        }}
        stats={[
          { k: "Events", v: String(events.length) },
          { k: "Cards", v: String(cardsPublished) },
          { k: "Live", v: anyLive ? "1" : "0" },
        ]}
      />

      <section className="tb-stage" aria-label="Tournament scoring">
        <div className="tb-stage-atmos" aria-hidden />
        <div className="hp-wrap">
          {ordered.length > 0 ? (
            <ScoreExperience events={ordered} />
          ) : (
            <div className="tb-await">
              <p className="tb-await-k">No events on the card</p>
              <p className="tb-await-t">
                The Season 2026 calendar has not been published yet.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="hp-sec hp-sec-paper hp-sec-tight">
        <div className="hp-wrap cm-track ss-links">
          <Link href="/fixtures" className="ss-link">
            <span className="ss-link-k">Season 2026</span>
            <span className="ss-link-t">Fixtures</span>
          </Link>
          <Link href="/leaderboards" className="ss-link">
            <span className="ss-link-k">Season standings</span>
            <span className="ss-link-t">Leaderboards</span>
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
