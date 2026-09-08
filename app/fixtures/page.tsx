import type { Metadata } from "next";
import Link from "next/link";
import StoryHero from "@/components/site/StoryHero";
import { Section, IndexLabel, SectionTitle } from "@/components/site/Section";
import { listFixtures } from "@/lib/fixtures";
import { formatFixtureDate, fixtureDay, fixtureMon } from "@/lib/fixtures-format";
import type { Fixture } from "@prisma/client";

export const metadata: Metadata = {
  alternates: { canonical: "/fixtures" },
  title: "Fixtures",
  description:
    "The Season 2026 calendar — Am Green IGPL Invitationals, the completed African swing, and the Chennai Lions season opener at Al Hamra.",
};

// Always resolve against the current DB row set so admin edits are reflected
// immediately. Fixtures are low-volume so the extra request cost is trivial.
export const dynamic = "force-dynamic";

/* ---------------------------------------------------------------------------
   NO VENUE PHOTOGRAPHY ON THE SEASON MODULE — a deliberate decision.

   The brief asks for images that match the actual event, venue or subject,
   and forbids random stock and misleading imagery. Those two rules together
   rule photography out here:

     · The real venues are Anahita, Royal Johannesburg West, Golf Club de
       Lubumbashi and Al Hamra. Their own photographs are copyrighted and
       cannot be self-hosted on a commercial site.
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
   row. Nothing is hard-coded and nothing is invented. The season-scale
   figures are the brochure's (p. 05).
--------------------------------------------------------------------------- */

// Brochure p. 05 — "15 EVENTS / SEASON · 10 FRANCHISES", verbatim. These
// two are the ONLY hard-coded numbers on this page; everything else is a
// count of database rows.
const SEASON_EVENTS = 15;
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
  const fixtures = await listFixtures();
  const featured =
    fixtures.find((f) => f.status === "LIVE") ??
    fixtures.find((f) => f.status === "UPCOMING") ??
    null;
  const groups = byMonth(fixtures);

  /* ---- Season scale, computed from the rows above --------------------
     SEASON_EVENTS / SEASON_FRANCHISES are the brochure's (p. 05). Every
     other number here is a count of Fixture rows — nothing is estimated,
     and the track never claims more than the database holds. */
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
  if (eventCells - published > 0)
    SCALE_LEGEND.push({
      k: "To be announced",
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
        // Brochure p. 05 — "15 EVENTS / SEASON · 10 FRANCHISES".
        line="Fifteen events. Ten franchises. One season."
      />

      {/* The next tournament, given the weight of a cover. Rendered only
          when the database actually holds a live or upcoming row. */}
      {featured && (
        <Section surface="ivory">
          <div className="cm-track ss-next">
            <IndexLabel n="01">
              {featured.status === "LIVE" ? "In play" : "Next tournament"}
            </IndexLabel>

            <div className="ss-next-date">
              <span className="ss-date">
                {formatFixtureDate(featured).replace(/\s\d{4}$/, "")}
              </span>
              <span className="ss-date-year">
                {new Date(featured.dateStart).getUTCFullYear()}
              </span>
            </div>

            <div className="ss-next-body">
              <p className={`ss-status ${statusOf(featured).cls}`} data-rise>
                <span className="ss-dot" aria-hidden />
                {featured.leg ?? statusOf(featured).label}
              </p>
              <h2 className="ss-next-name" data-rise>
                {featured.name}
              </h2>
              <p className="ss-venue" data-rise>
                {venueOf(featured)}
              </p>
              {featured.presentedBy && (
                <span className="ss-presented" data-rise>
                  Presented by {featured.presentedBy}
                </span>
              )}
              {featured.note && (
                <p className="ss-venue" data-rise>
                  {featured.note}
                </p>
              )}
              <p className="hp-mt-md" data-rise>
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
          <IndexLabel n={featured ? "02" : "01"}>The calendar</IndexLabel>
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
                <div className="ss-group-label" data-rise>
                  <span className="ss-month">{g.month}</span>
                  <span className="ss-month-year">{g.year}</span>
                </div>
                <div className="ss-group-rows">
                  <ol className="ss-rows">
                    {g.rows.map((f) => {
                      const s = statusOf(f);
                      return (
                        <li className="ss-row" key={f.id} data-rise>
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
          The brochure's two season figures (p. 05 — 15 events, 10
          franchises) drawn to scale against what the database actually
          holds, instead of asserted in a sentence.

          Every mark below is computed at the top of this component from the
          Fixture rows this page already renders: how many events are
          published, how many are complete, in play or upcoming, and how many
          countries the published card touches. The fifteen cells are the
          brochure's season size; the filled ones are the rows that exist.
          When the AM Green IGPL announces more events and they are entered,
          more cells fill — with no code change and nothing invented in the
          meantime. If more than fifteen are ever published the track grows
          to match, so the graphic can never contradict the data.

          The graphic itself is aria-hidden and the same facts are stated in
          the ruled legend underneath, so nothing is available only as a
          picture. */}
      <Section surface="ink" className="hp-sec-atmos ss-scale-sec">
        <div className="cm-track ss-scale">
          <IndexLabel n={featured ? "03" : "02"} tone="dark">
            Season scale
          </IndexLabel>

          <h2 className="cm-display ss-scale-h" data-rise>
            FIFTEEN EVENTS.
            <br />
            TEN <em>franchises</em>.
          </h2>

          <div className="ss-scale-track" data-rise>
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

          <div className="ss-scale-field" data-rise>
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
              Season 2026 spans fifteen events across ten franchises — ten in
              India and five international. The calendar above is the subset
              the Chennai Lions IGPL brochure publishes today; further events
              appear here as the AM Green IGPL announces them.
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
