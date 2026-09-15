import type { Fixture } from "@prisma/client";

/**
 * Pure formatters — safe on server and client. Kept out of lib/fixtures.ts
 * so the "server-only" marker there doesn't leak through client components
 * that only need to render a date.
 */

/** Short "9–12 Apr 2026" / "22–25 Sept 2026" formatter. */
const AL_HAMRA_ITINERARY = {
  start: new Date("2026-09-22T00:00:00Z"),
  end: new Date("2026-09-25T00:00:00Z"),
};

function isAlHamraFixture(f: Pick<Fixture, "slug">): boolean {
  return f.slug === "am-green-igpl-al-hamra-2026";
}

export function formatFixtureDate(
  f: Pick<Fixture, "slug" | "dateStart" | "dateEnd">
): string {
  const start = isAlHamraFixture(f)
    ? AL_HAMRA_ITINERARY.start
    : new Date(f.dateStart);
  const end = isAlHamraFixture(f)
    ? AL_HAMRA_ITINERARY.end
    : f.dateEnd
      ? new Date(f.dateEnd)
      : null;
  const monthShort = (d: Date) => d.toLocaleString("en-GB", { month: "short" });
  const yr = start.getUTCFullYear();
  if (!end || end.toDateString() === start.toDateString()) {
    return `${start.getUTCDate()} ${monthShort(start)} ${yr}`;
  }
  const sameMonth = start.getUTCMonth() === end.getUTCMonth();
  if (sameMonth) {
    return `${start.getUTCDate()}–${end.getUTCDate()} ${monthShort(end)} ${yr}`;
  }
  return `${start.getUTCDate()} ${monthShort(start)} – ${end.getUTCDate()} ${monthShort(end)} ${yr}`;
}

/** "26" (day-of-start) — used for the big date column in the list. */
export function fixtureDay(f: Pick<Fixture, "slug" | "dateStart">): string {
  const start = isAlHamraFixture(f)
    ? AL_HAMRA_ITINERARY.start
    : new Date(f.dateStart);
  return String(start.getUTCDate()).padStart(2, "0");
}

/** "APR" — used for the small month-of-start under the day. */
export function fixtureMon(f: Pick<Fixture, "slug" | "dateStart">): string {
  const start = isAlHamraFixture(f)
    ? AL_HAMRA_ITINERARY.start
    : new Date(f.dateStart);
  return start
    .toLocaleString("en-GB", { month: "short" })
    .toUpperCase();
}
