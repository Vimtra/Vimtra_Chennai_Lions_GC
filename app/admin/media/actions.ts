"use server";

import { revalidatePath } from "next/cache";
import type { PostStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import {
  MEDIA_KINDS,
  createMediaCoverage,
  deleteMediaCoverage,
  getMediaCoverage,
  updateMediaCoverage,
} from "@/lib/media-coverage";
import { parseCoverageForm } from "@/lib/coverage-admin";
import type { ActionResult } from "@/lib/admin-action-result";

/**
 * Admin → Media: third-party press and social posts (ARTICLE / SOCIAL).
 *
 * Official news is never handled here — `parseCoverageForm` is passed only
 * the media kinds, so an OFFICIAL row cannot be created or moved through
 * this surface, and every guard below refuses to touch one.
 */

function revalidateSurfaces() {
  revalidatePath("/news");
  revalidatePath("/");
  revalidatePath("/admin/media");
  revalidatePath("/admin");
}

export type CoverageActionResult = ActionResult<{ id: string }>;

export async function createMediaCoverageAction(formData: FormData): Promise<CoverageActionResult> {
  await requireAdmin();
  const parsed = await parseCoverageForm(formData, { allowedKinds: MEDIA_KINDS, folder: "media" });
  if (!parsed.ok) return { ok: false, error: parsed.error };
  const row = await createMediaCoverage(parsed.input);
  revalidateSurfaces();
  return {
    ok: true,
    id: row.id,
    message: row.status === "PUBLISHED" ? "Published to /news." : "Saved as a draft.",
  };
}

export async function updateMediaCoverageAction(formData: FormData): Promise<CoverageActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const existing = await getMediaCoverage(id);
  if (!existing || !MEDIA_KINDS.includes(existing.kind)) {
    return { ok: false, error: "That article no longer exists." };
  }
  const parsed = await parseCoverageForm(formData, { allowedKinds: MEDIA_KINDS, folder: "media" });
  if (!parsed.ok) return { ok: false, error: parsed.error };
  const row = await updateMediaCoverage(id, parsed.input);
  if (!row) return { ok: false, error: "The article could not be saved. Reload and try again." };
  revalidateSurfaces();
  return {
    ok: true,
    id,
    message: row.status === "PUBLISHED" ? "Saved and live on /news." : `Saved as ${row.status.toLowerCase()}.`,
  };
}

/** Quick Draft / Publish / Archive from a list row. */
export async function setMediaStatusAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const raw = String(formData.get("status") ?? "").toUpperCase();
  const status: PostStatus = raw === "PUBLISHED" || raw === "ARCHIVED" ? raw : "DRAFT";
  const existing = await getMediaCoverage(id);
  if (!existing || !MEDIA_KINDS.includes(existing.kind)) {
    return { ok: false, error: "That article no longer exists." };
  }
  await updateMediaCoverage(id, { status });
  revalidateSurfaces();
  return { ok: true, message: `“${existing.title}” is now ${status.toLowerCase()}.` };
}

export async function deleteMediaCoverageAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const existing = await getMediaCoverage(id);
  if (!existing || !MEDIA_KINDS.includes(existing.kind)) {
    return { ok: false, error: "That article no longer exists." };
  }
  const removed = await deleteMediaCoverage(id);
  if (!removed) return { ok: false, error: "The article could not be deleted. Reload and try again." };
  revalidateSurfaces();
  return { ok: true, message: `“${existing.title}” deleted.` };
}
