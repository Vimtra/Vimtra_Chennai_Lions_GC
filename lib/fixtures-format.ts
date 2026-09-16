import type { Fixture } from "@prisma/client";

/**
 * Pure formatters — safe on server and client. Kept out of lib/fixtures.ts
 * so the "server-only" marker there doesn't leak through client components
 * that only need to render a date.
 *
 * These render the fixture's OWN dates and nothing else. An earlier pass
 * carried a hardcoded `AL_HAMRA_ITINERARY` that overrode the database for
 * one slug and printed 22–25 Sept whatever the row said. The row itself is
 * 23–25 Sept, which is what the official IGPL schedule lists for the
 * AM Green IGPL Invitational 2026 presented by Vimtra Chennai Lions GC, so
 * the override was showing a date the league does not publish — and it
 * silently defeated any correction made to the data.
 *
 * Do not special-case a fixture here. If a date is wrong, fix the row.
 */

/** Short "9–12 Apr 2026" / "23–25 Sept 2026" formatter. */
export function formatFixtureDate(
  f: Pick<Fixture, "dateStart" | "dateEnd">
): string {
  const start = new Date(f.dateStart);
  const end = f.dateEnd ? new Date(f.dateEnd) : null;
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
export function fixtureDay(f: Pick<Fixture, "dateStart">): string {
  return String(new Date(f.dateStart).getUTCDate()).padStart(2, "0");
}

/** "APR" — used for the small month-of-start under the day. */
export function fixtureMon(f: Pick<Fixture, "dateStart">): string {
  return new Date(f.dateStart)
    .toLocaleString("en-GB", { month: "short" })
    .toUpperCase();
}
