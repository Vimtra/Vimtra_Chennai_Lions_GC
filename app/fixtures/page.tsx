import type { Metadata } from "next";
import Link from "next/link";
import StoryHero from "@/components/site/StoryHero";
import { Section, SectionTitle } from "@/components/site/Section";
import { listFixtures, sortFixturesCurrentFirst } from "@/lib/fixtures";
import { formatFixtureDate, fixtureDay, fixtureMon } from "@/lib/fixtures-format";
import type { Fixture } from "@prisma/client";

export const metadata: Metadata = {
  alternates: { canonical: "/fixtures" },
  title: "Fixtures",
  description:
    "The Season 2026 calendar — AM Green IGPL events across India and international venues, including the AM Green IGPL Invitational 2026 presented by Vimtra Chennai Lions GC at Al Hamra.",
};

// Always resolve against the current DB row set so admin edits are reflected
// immediately. Fixtures are low-volume so the extra request cost is trivial.
export const dynamic = "force-dynamic";

/* ---------------------------------------------------------------------------
   NO VENUE PHOTOGRAPHY ON THE SEASON MODULE — a deliberate decision.

   The brief asks for images that match the actual event, venue or subject,
   and forbids random stock and misleading imagery. Those two rules together
   rule photography out here:

     · The real venues are Anahita, Royal Johannesburg (East Course per the
       official schedule), Golf Club de Lubumbashi and Al Hamra. Their own
       photographs are copyrighted and cannot be self-hosted on a commercial
       site.
     · Wikimedia Commons carries nothing for any of them. A search for
       Al Hamra Golf Club returns Al Jazirah Al Hamra — an unrelated
       abandoned heritage village in the same emirate. Using that would be
       exactly the misleading imagery the brief forbids.
     · A generic stock course photograph placed under "Al Hamra Golf Club"
       asserts something untrue about a named real place.

   So the module is typography- and data-led. If the franchise supplies (or
   licenses) real photography of these venues, the timeline rows and the
   featured event are the two places it belongs.

   CONTENT: every event, date, venue, leg and presenter below is a database
   row. Nothing is hard-coded and nothing is invented. The two season-scale
   figures come from the official AM Green IGPL record (see below).
--------------------------------------------------------------------------- */

// The two season-scale figures — the ONLY hard-coded numbers on this page;
// everything else is a count of database rows.
//
// SEASON_EVENTS: the official count, not the brochure's. Brochure p. 05 said
// "15 EVENTS / SEASON" ("ten in India, five international"). The official
// record contradicts both halves: theigpl.com/standings-2026 states
// "14 TOUR EVENTS", and theigpl.com/schedule lists 9 completed + 5 upcoming
// = 14, with at least six of the completed events held outside India
// (Mauritius, Johannesburg, Congo, two at Mazagan, Ras Al Khaimah). Checked
// 16 Oct 2026 (SEASON_COUNT_AS_OF). If IGPL adds or drops an event, update
// both constants; if more rows are ever published, the track grows to match.
//
// SEASON_FRANCHISES: bknd.theigpl.com/api/franchises returns 10 franchises,
// and the standings page states "10 FRANCHISE TEAMS".
const SEASON_EVENTS = 14;
const SEASON_COUNT_AS_OF = "16 October 2026";
const SEASON_FRANCHISES = 10;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Group fixtures into month buckets, preserving the query's order. */
function byMonth(fixtures: Fixture[]) {
  const groups: { key: string; month: string; year: number; rows: Fixture[] }[] = [];
  for (const f of fixtures) {
    const d = new Date(f.dateStart);
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
    const found = groups.find((g) => g.key === key);
    if (found) found.rows.push(f);
    else
      groups.push({
        key,
        month: MONTHS[d.getUTCMonth()],
        year: d.getUTCFullYear(),
        rows: [f],
      });
  }
  return groups;
}

function statusOf(f: Fixture): { label: string; cls: string } {
  switch (f.status) {
    case "LIVE":
      return { label: "Live", cls: "is-live" };
    case "UPCOMING":
      return { label: "Upcoming", cls: "is-upcoming" };
    case "CANCELLED":
      return { label: "Cancelled", cls: "" };
    default:
      return { label: "Result", cls: "" };
  }
}

function venueOf(f: Fixture): string {
  const place = f.city === f.country ? f.city : `${f.city}, ${f.country}`;
  return f.courseName ? `${f.courseName} · ${place}` : place;
}

export default async function FixturesPage() {
  // The calendar is not worth a 500. A transient database failure (Neon
  // suspends an idle compute and drops its connections, so a query can land
  // mid-suspension) degrades to the same no-rows path an empty table already
  // takes: the "No Season 2026 events are published yet" state below. Same
  // fallback the home page uses for this exact reader. Nothing is invented —
  // an unreachable database and an empty one both mean "we cannot show a
  // verified calendar", which is what the empty state says.
  const fixtures = sortFixturesCurrentFirst(await listFixtures().catch(() => []));
  const featured =
    fixtures.find((f) => f.status === "LIVE") ??
    fixtures.find((f) => f.status === "UPCOMING") ??
    null;
  const groups = byMonth(fixtures);

  /* ---- Season scale, computed from the rows above --------------------
     SEASON_EVENTS / SEASON_FRANCHISES are the official counts (see their
     comment at the top of the file). Every other number here is a count of
     Fixture rows — nothing is estimated, and the track never claims more
     than the database holds. */
  const published = fixtures.length;
  const eventCells = Math.max(SEASON_EVENTS, published);
  const countBy = (s: Fixture["status"]) =>
    fixtures.filter((f) => f.status === s).length;
  const countries = new Set(fixtures.map((f) => f.country)).size;

  const SCALE_LEGEND: { k: string; v: string; cls: string }[] = [];
  if (countBy("COMPLETED"))
    SCALE_LEGEND.push({
      k: "Played",
      v: String(countBy("COMPLETED")),
      cls: "is-done",
    });
  if (countBy("LIVE"))
    SCALE_LEGEND.push({ k: "In play", v: String(countBy("LIVE")), cls: "is-live" });
  if (countBy("UPCOMING"))
    SCALE_LEGEND.push({
      k: "Upcoming",
      v: String(countBy("UPCOMING")),
      cls: "is-next",
    });
  if (countBy("CANCELLED"))
    SCALE_LEGEND.push({
      k: "Cancelled",
      v: String(countBy("CANCELLED")),
      cls: "is-void",
    });
  // Official events with no row here yet. Not "to be announced": an event
  // can be missing from this site after it has already been played.
  if (eventCells - published > 0)
    SCALE_LEGEND.push({
      k: "Not yet on this site",
      v: String(eventCells - published),
      cls: "is-open",
    });
  if (countries)
    SCALE_LEGEND.push({
      k: countries === 1 ? "Country" : "Countries",
      v: String(countries),
      cls: "is-mark",
    });

  return (
    <>
      <StoryHero
        eyebrow="AM Green IGPL · Season 2026"
        title={["FIXTURES"]}
        // Official counts — see SEASON_EVENTS / SEASON_FRANCHISES above.
        line="Fourteen events. Ten franchises. One season."
      />

      {/* The next tournament, given the weight of a cover. Rendered only
          when the database actually holds a live or upcoming row. */}
      {featured && (
        <Section surface="ivory">
          <div className="cm-track ss-next">
            <p className="hp-index hp-index-bare" data-rise>
              <span>
                {featured.status === "LIVE" ? "In play" : "Next tournament"}
              </span>
            </p>

            <div className="ss-next-date">
              <span className="ss-date">
                {formatFixtureDate(featured).replace(/\s\d{4}$/, "")}
              </span>
              <span className="ss-date-year">
                {new Date(featured.dateStart).getUTCFullYear()}
              </span>
            </div>

            <div className="ss-next-body">
              <p className={`ss-status ${statusOf(featured).cls}`}>
                <span className="ss-dot" aria-hidden />
                {featured.leg ?? statusOf(featured).label}
              </p>
              <h2 className="ss-next-name" data-rise>
                {featured.name}
              </h2>
              <p className="ss-venue">
                {venueOf(featured)}
              </p>
              {featured.presentedBy && (
                <span className="ss-presented">
                  Presented by {featured.presentedBy}
                </span>
              )}
              {featured.note && (
                <p className="ss-venue">
                  {featured.note}
                </p>
              )}
              <p className="hp-mt-md">
                <Link href="/scores" className="hp-btn hp-btn-text">
                  Live scoring
                  <span className="hp-arrow" aria-hidden>
                    →
                  </span>
                </Link>
              </p>
            </div>
          </div>
        </Section>
      )}

      {/* The calendar as a timeline, grouped by month. */}
      <Section surface="paper">
        <div>
          <p className="hp-index hp-index-bare">
            <span>The calendar</span>
          </p>
          <SectionTitle lines={["THE SEASON", "IN ORDER."]} />
        </div>

        <div className="ss-timeline hp-mt-lg">
          {groups.length === 0 ? (
            <p className="cm-lede">
              No Season 2026 events are published yet. The calendar populates
              here as the AM Green IGPL announces them.
            </p>
          ) : (
            groups.map((g) => (
              <div className="cm-track ss-group" key={g.key}>
                <div className="ss-group-label">
                  <span className="ss-month">{g.month}</span>
                  <span className="ss-month-year">{g.year}</span>
                </div>
                <div className="ss-group-rows">
                  <ol className="ss-rows">
                    {g.rows.map((f) => {
                      const s = statusOf(f);
                      return (
                        <li className="ss-row" key={f.id}>
                          <span>
                            <span className="ss-row-day">{fixtureDay(f)}</span>
                            <span className="ss-row-mon">{fixtureMon(f)}</span>
                          </span>
                          <span>
                            <span className="ss-row-name">{f.name}</span>
                            <span className="ss-row-venue">
                              {venueOf(f)} · {formatFixtureDate(f)}
                            </span>
                            {f.leg && <span className="ss-row-leg">{f.leg}</span>}
                          </span>
                          <span className="ss-row-meta">
                            <span className={`ss-status ${s.cls}`}>
                              <span className="ss-dot" aria-hidden />
                              {s.label}
                            </span>
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </div>
            ))
          )}
        </div>
      </Section>

      {/* SEASON SCALE.
          The official season size (14 events, 10 franchises — see
          SEASON_EVENTS / SEASON_FRANCHISES) drawn to scale against what the
          database actually holds, instead of asserted in a sentence.

          Every mark below is computed at the top of this component from the
          Fixture rows this page already renders: how many events are
          published, how many are complete, in play or upcoming, and how many
          countries the published card touches. The fourteen cells are the
          official season size; the filled ones are the rows that exist.
          When official events are entered, more cells fill — with no code
          change and nothing invented in the meantime. If more rows than
          SEASON_EVENTS are ever published the track grows to match, so the
          graphic can never contradict the data.

          The graphic itself is aria-hidden and the same facts are stated in
          the ruled legend underneath, so nothing is available only as a
          picture. */}
      <Section surface="ink" className="hp-sec-atmos ss-scale-sec">
        <div className="cm-track ss-scale">
          <p className="hp-index hp-index-dark hp-index-bare" data-rise>
            <span>Season scale</span>
          </p>

          <h2 className="cm-display ss-scale-h" data-rise>
            FOURTEEN EVENTS.
            <br />
            TEN <em>franchises</em>.
          </h2>

          <div className="ss-scale-track">
            <p className="ss-scale-k">
              The season card
              <span>
                {published} of {eventCells} published
              </span>
            </p>
            <ol className="ss-cells" aria-hidden>
              {Array.from({ length: eventCells }, (_, i) => {
                const f = fixtures[i];
                const state = !f
                  ? "is-open"
                  : f.status === "LIVE"
                    ? "is-live"
                    : f.status === "COMPLETED"
                      ? "is-done"
                      : f.status === "CANCELLED"
                        ? "is-void"
                        : "is-next";
                return <li className={`ss-cell ${state}`} key={i} />;
              })}
            </ol>
            <dl className="ss-scale-legend">
              {SCALE_LEGEND.map((l) => (
                <div key={l.k}>
                  <dt>
                    <span className={`ss-cell ${l.cls}`} aria-hidden />
                    {l.k}
                  </dt>
                  <dd>{l.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="ss-scale-field">
            <p className="ss-scale-k">
              The league
              <span>Chennai is one of ten</span>
            </p>
            <ol className="ss-franchises" aria-hidden>
              {Array.from({ length: SEASON_FRANCHISES }, (_, i) => (
                <li className={i === 0 ? "is-lions" : ""} key={i} />
              ))}
            </ol>
            <p className="ss-scale-note">
              The official AM Green IGPL schedule lists {SEASON_EVENTS} Season
              2026 events across India and international venues, contested by
              ten franchises (as of {SEASON_COUNT_AS_OF}). The calendar above
              shows the events published on this site; more appear as they are
              confirmed against the official schedule.
            </p>
          </div>
        </div>
      </Section>

      {/* Cross-links into the rest of the module. */}
      <Section surface="paper" size="tight">
        <div className="cm-track ss-links">
          <Link href="/scores" className="ss-link">
            <span className="ss-link-k">Live scoring</span>
            <span className="ss-link-t">Scores</span>
          </Link>
          <Link href="/leaderboards" className="ss-link">
            <span className="ss-link-k">Season standings</span>
            <span className="ss-link-t">Leaderboards</span>
          </Link>
          <Link href="/players" className="ss-link">
            <span className="ss-link-k">Season 2026</span>
            <span className="ss-link-t">The Players</span>
          </Link>
        </div>
      </Section>
    </>
  );
}
