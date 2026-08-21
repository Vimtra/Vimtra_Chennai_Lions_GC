/**
 * Pure formatters — safe on server and client, kept out of the
 * "server-only" data-layer file so client components can import them.
 */

export function formatCoverageDate(d: Date | string | null | undefined): string {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return "";
  return `${dt.getUTCDate()} ${dt.toLocaleString("en-GB", {
    month: "short",
  })} ${dt.getUTCFullYear()}`;
}

/** Two-letter initials for the source name (used in the fallback tile). */
export function sourceInitials(sourceName: string): string {
  const parts = sourceName
    .split(/\s+/)
    .filter((w) => !/^(of|the|and|&)$/i.test(w))
    .slice(0, 2);
  const initials = parts
    .map((w) => w.replace(/[^A-Za-z]/g, "").charAt(0))
    .join("")
    .toUpperCase();
  return initials || sourceName.slice(0, 2).toUpperCase();
}
