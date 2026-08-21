import type { Fixture } from "@prisma/client";

/**
 * Pure formatters — safe on server and client. Kept out of lib/fixtures.ts
 * so the "server-only" marker there doesn't leak through client components
 * that only need to render a date.
 */

/** Short "9–12 Apr 2026" / "23 Sept 2026" formatter. */
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
