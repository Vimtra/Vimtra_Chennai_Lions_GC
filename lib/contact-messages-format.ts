/**
 * Pure formatters — safe on server and client, kept out of the
 * "server-only" data-layer file so client components can import them.
 * Same UTC-based construction as formatPublishedDate / formatCoverageDate,
 * extended with a time — an admin triaging enquiries needs to see how
 * recently one arrived, not just which day.
 */

/** "3 Sep 2026 · 14:32" */
export function formatContactDate(d: Date | string | null | undefined): string {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return "";
  const day = dt.getUTCDate();
  const month = dt.toLocaleString("en-GB", { month: "short" });
  const year = dt.getUTCFullYear();
  const hh = String(dt.getUTCHours()).padStart(2, "0");
  const mm = String(dt.getUTCMinutes()).padStart(2, "0");
  return `${day} ${month} ${year} · ${hh}:${mm}`;
}
