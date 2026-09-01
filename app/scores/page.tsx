import type { Metadata } from "next";
import Link from "next/link";
import StoryHero from "@/components/site/StoryHero";
import { Section, IndexLabel, SectionTitle } from "@/components/site/Section";
import { listFixtures } from "@/lib/fixtures";
import { listScoresForFixture } from "@/lib/scores";
import { formatFixtureDate } from "@/lib/fixtures-format";
import type { Fixture } from "@prisma/client";

export const metadata: Metadata = {
  title: "Scores · Vimtra Chennai Lions GC",
  description:
    "Live tournament scoring for the Vimtra Chennai Lions across the AM Green IGPL Season 2026 — unlocks as each round begins.",
};

// Live rounds change every few minutes during a tournament week; always
// resolve against the current DB row set.
export const dynamic = "force-dynamic";

/* ---------------------------------------------------------------------------
   Nothing on this page is fabricated. It shows one of two things:

     · REAL SCORE ROWS, when the Score table holds any for the subject
       fixture. Admins key these in during a tournament week (and a future
       IGPL sync will upsert into the same table).
     · A STANDBY BOARD, when it does not — the board is simply not lit yet.
       That is a designed state, not an error card.

   WIRING FIX: this page previously never read the Score table at all. An
   admin could key a full round in through /admin/scores and the public page
   would still show an empty state, because it only ever looked at Fixture
   rows. It now reads scores for the subject fixture through the existing
   data layer and renders them when they exist. No schema or write path was
   touched.

   No venue photography — see the note at the top of app/fixtures/page.tsx.
--------------------------------------------------------------------------- */

function venueOf(f: Fixture): string {
  const place = f.city === f.country ? f.city : `${f.city}, ${f.country}`;
  return f.courseName ? `${f.courseName} · ${place}` : place;
}

export default async function ScoresPage() {
  const fixtures = await listFixtures();

  const live = fixtures.find((f) => f.status === "LIVE") ?? null;
  const nextUp = fixtures.find((f) => f.status === "UPCOMING") ?? null;
  const completed = fixtures.filter((f) => f.status === "COMPLETED");
  const lastResult = completed.length ? completed[completed.length - 1] : null;

  // The fixture this page is about, in priority order.
  const subject = live ?? lastResult ?? nextUp;
  const rows = subject ? await listScoresForFixture(subject.id) : [];

  const heroLine = live
    ? "A round is in play."
    : nextUp
    ? "The board lights up when the first round tees off."
    : "Live scoring unlocks with the first Season 2026 tournament week.";

  return (
    <>
      <StoryHero
        eyebrow="Live Scoring · Season 2026"
        title={["SCORES"]}
        line={heroLine}
      />

      {/* The board. Lit when there are real rows, on standby when there
          are not — the same frame either way. */}
      <section className="ss-board" aria-label="Live scoring status">
        <div className="hp-wrap cm-track ss-board-inner">
          <div className="ss-board-h">
            <p className={`ss-status ${live ? "is-live" : "is-upcoming"}`} data-rise>
              <span className="ss-dot" aria-hidden />
              {live ? "Round in progress" : "Live scoring · offline"}
            </p>
            <h2 className="ss-board-title">
              {live ? live.name : nextUp ? nextUp.name : "Season 2026"}
            </h2>
            {(live ?? nextUp) && (
              <p className="ss-venue" data-rise>
                {venueOf((live ?? nextUp)!)} ·{" "}
                {formatFixtureDate((live ?? nextUp)!)}
              </p>
            )}
            {(live ?? nextUp)?.presentedBy && (
              <span className="ss-presented" data-rise>
                Presented by {(live ?? nextUp)!.presentedBy}
              </span>
            )}
          </div>

          <div className="ss-board-b">
            <p className="ss-board-note" data-rise>
              {live
                ? "Rows below are the verified round scores as they land. Nothing is published here before it is confirmed."
                : nextUp
                ? "No provisional leaderboards or forecast data are published on this page — only verified round scores, from the moment the first round tees off."
                : "This page unlocks with the first Season 2026 tournament week."}
            </p>
            <p className="hp-mt-md" data-rise>
              <Link href="/fixtures" className="hp-btn hp-btn-ghost hp-on-dark">
                See the calendar
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Real score rows, whenever the table holds any for this fixture. */}
      {subject && rows.length > 0 && (
        <Section surface="ivory">
          <div>
            <IndexLabel n="01">{subject.name}</IndexLabel>
            <SectionTitle lines={["THE", "CARD."]} />
          </div>
          <div className="ss-table-wrap hp-mt-lg" data-rise>
            <table className="ss-table">
              <thead>
                <tr>
                  <th scope="col">Pos</th>
                  <th scope="col">Player</th>
                  <th scope="col">R1</th>
                  <th scope="col">R2</th>
                  <th scope="col">R3</th>
                  <th scope="col">R4</th>
                  <th scope="col">Thru</th>
                  <th scope="col">Today</th>
                  <th scope="col">Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="ss-rank">{r.position ?? "—"}</td>
                    <td className="ss-who">{r.playerName}</td>
                    <td>{r.r1 ?? "—"}</td>
                    <td>{r.r2 ?? "—"}</td>
                    <td>{r.r3 ?? "—"}</td>
                    <td>{r.r4 ?? "—"}</td>
                    <td>{r.thru ?? "—"}</td>
                    <td>{r.today ?? "—"}</td>
                    <td>{r.total ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* Completed events this season — real rows, honestly labelled as
          awaiting their published cards. */}
      {completed.length > 0 && (
        <Section surface="paper">
          <div>
            <IndexLabel n={rows.length > 0 ? "02" : "01"}>
              Completed this season
            </IndexLabel>
            <SectionTitle lines={["PLAYED,", "AND LOGGED."]} />
          </div>

          <div className="hp-mt-lg">
            <ol className="ss-rows">
              {completed.map((f) => (
                <li className="ss-row" key={f.id} data-rise>
                  <span>
                    <span className="ss-row-day">
                      {String(new Date(f.dateStart).getUTCDate()).padStart(2, "0")}
                    </span>
                    <span className="ss-row-mon">
                      {new Date(f.dateStart)
                        .toLocaleString("en-GB", { month: "short" })
                        .toUpperCase()}
                    </span>
                  </span>
                  <span>
                    <span className="ss-row-name">{f.name}</span>
                    <span className="ss-row-venue">
                      {venueOf(f)} · {formatFixtureDate(f)}
                    </span>
                    {f.leg && <span className="ss-row-leg">{f.leg}</span>}
                  </span>
                  <span className="ss-row-meta">
                    <span className="ss-status">
                      <span className="ss-dot" aria-hidden />
                      Result
                    </span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="cm-lede hp-mt-md" data-rise>
              Verified scorecards publish here as they are confirmed. Until
              then, results are announced on the Chennai Lions channels and on{" "}
              <Link href="/news" className="hp-btn hp-btn-text">
                news
              </Link>
              .
            </p>
          </div>
        </Section>
      )}

      <Section surface="ink" size="tight" className="hp-sec-atmos">
        <div className="cm-track ss-links">
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
      </Section>
    </>
  );
}
