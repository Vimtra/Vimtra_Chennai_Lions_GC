/**
 * Pure formatters — safe on server and client. Kept out of lib/posts.ts
 * so the "server-only" marker there doesn't leak through client components
 * that only need to render a date.
 */

/** "21 Aug 2026" — the canonical byline date format across News. */
export function formatPublishedDate(d: Date | string | null | undefined): string {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return "";
  const day = dt.getUTCDate();
  const month = dt.toLocaleString("en-GB", { month: "short" });
  const year = dt.getUTCFullYear();
  return `${day} ${month} ${year}`;
}
