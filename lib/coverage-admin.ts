import "server-only";
import type { MediaKind, PostStatus } from "@prisma/client";
import type { MediaCoverageInput } from "@/lib/media-coverage";
import { CoverUploadError, resolveCoverImage } from "@/lib/cover-upload";

/**
 * Turns a submitted News / Media form into a `MediaCoverageInput`, or into a
 * plain-language reason it cannot be saved. Shared by both admin surfaces so
 * the validation rules cannot drift apart; each surface passes the kinds it
 * is allowed to hold, which is what keeps official news and press coverage
 * from ever being filed into each other's list.
 */

export type ParseResult =
  | { ok: true; input: MediaCoverageInput }
  | { ok: false; error: string };

const STATUSES: PostStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];

function text(v: FormDataEntryValue | null): string {
  return String(v ?? "").trim();
}

function parseDate(v: FormDataEntryValue | null): Date | null {
  const s = text(v);
  if (!s) return null;
  const d = new Date(s + "T00:00:00Z");
  return isNaN(d.getTime()) ? null : d;
}

export async function parseCoverageForm(
  formData: FormData,
  opts: { allowedKinds: MediaKind[]; folder: "news" | "media" }
): Promise<ParseResult> {
  const kindRaw = text(formData.get("kind")).toUpperCase();
  const kind = opts.allowedKinds.find((k) => k === kindRaw);
  if (!kind) {
    return { ok: false, error: "That item type doesn't belong on this page." };
  }

  const title = text(formData.get("title"));
  const sourceName = text(formData.get("sourceName"));
  const sourceUrl = text(formData.get("sourceUrl"));
  const summary = text(formData.get("summary"));
  if (!title) return { ok: false, error: "A headline is required." };
  if (!sourceName) {
    return {
      ok: false,
      error: opts.folder === "news" ? "A source is required." : "A publisher is required.",
    };
  }
  if (!summary) return { ok: false, error: "A description is required." };

  // http(s) only — javascript:/data: are refused at input time so the DB
  // never holds one, independent of the rel="noreferrer" on the public link.
  try {
    const u = new URL(sourceUrl);
    if (u.protocol !== "https:" && u.protocol !== "http:") throw new Error();
  } catch {
    return { ok: false, error: "The external URL must be a full http(s) address." };
  }

  const statusRaw = text(formData.get("status")).toUpperCase();
  const status = (STATUSES as string[]).includes(statusRaw)
    ? (statusRaw as PostStatus)
    : "DRAFT";
  const featuredOnHome = opts.folder === "news" && formData.get("featuredOnHome") === "1";

  const sortRaw = text(formData.get("sortOrder"));
  const sortOrder = sortRaw === "" ? 0 : Number(sortRaw);

  let coverImage: string | null;
  try {
    coverImage = await resolveCoverImage(formData, opts.folder);
  } catch (err) {
    if (err instanceof CoverUploadError) return { ok: false, error: err.message };
    console.error("[parseCoverageForm] unexpected upload error:", err);
    return { ok: false, error: "The image could not be saved. Nothing was changed." };
  }

  return {
    ok: true,
    input: {
      kind,
      title,
      sourceName,
      sourceUrl,
      summary,
      publishedAt: parseDate(formData.get("publishedAt")),
      coverImage,
      status,
      featuredOnHome,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    },
  };
}
