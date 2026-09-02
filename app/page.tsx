import Hero, { type HeroNext } from "@/components/home/Hero";
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
  type StoreFacts,
} from "@/components/home/Sections";
import { listFixtures } from "@/lib/fixtures";
import { listActiveMediaCoverage } from "@/lib/media-coverage";
import { listProducts } from "@/lib/db";
import { webSrc } from "@/lib/image-src";

/**
 * Home page.
 *
 * A single narrative, alternating surface by surface so the page has
 * rhythm rather than a stack of identical blocks:
 *
 *   —   Hero          full-bleed photograph + the real next fixture
 *   01  Statement     ivory · display statement, copy offset right
 *   02  Club          ink   · oversized year beside a figure that fills
 *   03  Season        ivory · real fixtures as an editorial calendar
 *   04  Development   image · full-bleed range + numbered initiatives
 *   05  Media         paper · one featured story over a ruled press wall
 *   06  Shop          ivory · full-bleed merchandising band + a real rail
 *   07  Closing       ink   · statement left, actions right
 *
 * Every chapter sits on the module's 4 / 8 / 12 track (`.cm-track`), so the
 * home page shares one alignment system with the rest of the site and no
 * column is left as an empty field.
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
  const [fixtures, coverage, products] = await Promise.all([
    listFixtures().catch(() => []),
    listActiveMediaCoverage().catch(() => []),
    listProducts().catch(() => []),
  ]);

  // Press coverage is real and already in the database. The Media section
  // had stopped reading it entirely — five live rows, none of them rendered,
  // which is what left that chapter as a heading over an empty band.
  const stories: StoryRow[] = coverage.slice(0, 5).map((m) => ({
    id: m.id,
    source: m.sourceName,
    title: m.title,
    summary: m.summary,
    href: m.sourceUrl,
    cover: webSrc(m.coverImage),
  }));

  // Counted from the live catalogue, not typed in.
  const store: StoreFacts = {
    items: products.length,
    categories: new Set(products.map((p) => p.cat)).size,
  };

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

  // The hero's "Next" rail used to hardcode a fixture in the component.
  // It is read from the same real records as the calendar below, so the
  // two can never disagree — and it is simply absent when nothing is
  // upcoming rather than showing a stale event.
  const first = upcoming[0];
  const next: HeroNext | null = first
    ? {
        name: first.courseName ?? first.name,
        place: [first.city, first.country].filter(Boolean).join(", "),
        dates: formatRange(first.dateStart, first.dateEnd),
      }
    : null;

  return (
    <>
      <Hero next={next} />
      <Statement />
      <Club />
      <Season rows={seasonRows} />
      <Development />
      <Media stories={stories} />
      <Shop facts={store} />
      <Closing />
    </>
  );
}
