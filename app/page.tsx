import Hero from "@/components/home/Hero";
import {
  Statement,
  Club,
  Season,
  Development,
  Media,
  Shop,
  Closing,
  type SeasonRow,
  type StoryRow,
} from "@/components/home/Sections";
import { listFixtures } from "@/lib/fixtures";
import { listActiveMediaCoverage } from "@/lib/media-coverage";
import { webSrc } from "@/lib/image-src";

/**
 * Home page.
 *
 * A single narrative, alternating surface by surface so the page has
 * rhythm rather than a stack of identical blocks:
 *
 *   —   Hero          full-bleed course photograph, brand-first
 *   01  Statement     ivory · typography only
 *   02  Club          ink   · oversized year + image column
 *   03  Season        ivory · real fixtures as an editorial calendar
 *   04  Development   image · full-bleed facility + numbered initiatives
 *   05  Media         paper · one featured story + secondaries
 *   06  Shop          ivory · one merchandise visual
 *   07  Closing       ink   · final brand statement
 *
 * Data is real: fixtures and press coverage are read from the database.
 * When either table is empty the corresponding section renders nothing
 * rather than inventing rows. No player photography appears here — the
 * homepage is the club; portraits belong to /players.
 */
export const dynamic = "force-dynamic";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "23—25 Sep 2026", collapsing a same-month range. */
function formatRange(start: Date, end: Date | null): string {
  const s = new Date(start);
  const e = end ? new Date(end) : null;
  const sd = s.getUTCDate();
  const sm = MONTHS[s.getUTCMonth()];
  const sy = s.getUTCFullYear();
  if (!e) return `${sd} ${sm} ${sy}`;
  const ed = e.getUTCDate();
  const em = MONTHS[e.getUTCMonth()];
  if (sm === em && sy === e.getUTCFullYear()) return `${sd}—${ed} ${sm} ${sy}`;
  return `${sd} ${sm} — ${ed} ${em} ${e.getUTCFullYear()}`;
}

export default async function HomePage() {
  const [fixtures, coverage] = await Promise.all([
    listFixtures().catch(() => []),
    listActiveMediaCoverage().catch(() => []),
  ]);

  // Upcoming first, then the most recent completed events.
  const upcoming = fixtures.filter((f) => f.status === "UPCOMING");
  const past = fixtures.filter((f) => f.status !== "UPCOMING");
  const seasonRows: SeasonRow[] = [...upcoming, ...past]
    .slice(0, 5)
    .map((f) => ({
      slug: f.slug,
      name: f.name,
      city: f.city,
      country: f.country,
      courseName: f.courseName,
      dates: formatRange(f.dateStart, f.dateEnd),
      upcoming: f.status === "UPCOMING",
    }));

  // Each story keeps the cover image stored against that record — the
  // homepage never substitutes a generic photograph.
  const stories: StoryRow[] = coverage.slice(0, 4).map((m) => ({
    id: m.id,
    source: m.sourceName,
    title: m.title,
    summary: m.summary,
    href: m.sourceUrl,
    cover: webSrc(m.coverImage),
    date: m.publishedAt
      ? `${new Date(m.publishedAt).getUTCDate()} ${
          MONTHS[new Date(m.publishedAt).getUTCMonth()]
        } ${new Date(m.publishedAt).getUTCFullYear()}`
      : null,
  }));

  return (
    <>
      <Hero />
      <Statement />
      <Club />
      <Season rows={seasonRows} />
      <Development />
      <Media stories={stories} />
      <Shop />
      <Closing />
    </>
  );
}
