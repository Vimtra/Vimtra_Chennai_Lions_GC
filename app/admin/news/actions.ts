"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { PostStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { createPost, deletePost, getPost, updatePost, type PostInput } from "@/lib/posts";
import {
  NEWS_KINDS,
  createMediaCoverage,
  deleteMediaCoverage,
  getMediaCoverage,
  updateMediaCoverage,
} from "@/lib/media-coverage";
import { parseCoverageForm } from "@/lib/coverage-admin";
import type { ActionResult } from "@/lib/admin-action-result";

const STATUSES: PostStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];

function opt(raw: FormDataEntryValue | null): string | null {
  const s = String(raw ?? "").trim();
  return s ? s : null;
}

function parseDate(raw: FormDataEntryValue | null): Date | null {
  if (!raw) return null;
  const s = String(raw).trim();
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function toStatus(raw: FormDataEntryValue | null): PostStatus {
  const s = String(raw ?? "DRAFT").toUpperCase();
  return (STATUSES as string[]).includes(s) ? (s as PostStatus) : "DRAFT";
}

function revalidatePostSurfaces(slug?: string | null) {
  revalidatePath("/news");
  revalidatePath("/admin/news");
  revalidatePath("/admin/news/editorial");
  revalidatePath("/admin");
  if (slug) revalidatePath(`/news/${slug}`);
}

/* ---------------------------------------------------------------------------
   EDITORIAL POSTS — long-form Post rows with the TipTap editor.
--------------------------------------------------------------------------- */

/** Create a fresh DRAFT and redirect straight into the editor for it. */
export async function newDraftAction() {
  await requireAdmin();
  const post = await createPost({
    title: "Untitled post",
    bodyHtml: "",
    bodyJson: null,
    authorName: "Chennai Lions Editorial",
    status: "DRAFT",
  });
  revalidatePostSurfaces();
  redirect(`/admin/news/${post.id}/edit`);
}

/** Update every editable field, plus status. */
export async function updatePostAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const existing = await getPost(id);
  if (!existing) redirect("/admin/news/editorial?error=missing");

  const title = String(formData.get("title") ?? "").trim() || "Untitled post";
  const slugRaw = opt(formData.get("slug"));
  const status = toStatus(formData.get("status"));

  const publishedAtInput = parseDate(formData.get("publishedAt"));
  const publishedAt =
    publishedAtInput ?? (status === "PUBLISHED" && !existing?.publishedAt ? undefined : null);

  const input: Partial<PostInput> = {
    slug: slugRaw ?? undefined,
    title,
    excerpt: opt(formData.get("excerpt")),
    coverImage: opt(formData.get("coverImage")),
    bodyHtml: String(formData.get("bodyHtml") ?? "").trim(),
    bodyJson: opt(formData.get("bodyJson")),
    category: opt(formData.get("category")),
    authorName: String(formData.get("authorName") ?? "").trim() || "Chennai Lions Editorial",
    status,
    publishedAt,
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
  };
  const updated = await updatePost(id, input);
  revalidatePostSurfaces(updated?.slug ?? existing?.slug ?? null);
  if (existing && updated && existing.slug !== updated.slug) {
    revalidatePath(`/news/${existing.slug}`);
  }
  redirect(`/admin/news/${id}/edit?saved=1`);
}

/** Quick status transitions from the list rows. */
export async function setStatusAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = toStatus(formData.get("status"));
  const existing = await getPost(id);
  if (!existing) return { ok: false, error: "That post no longer exists." };
  const publishedAt = status === "PUBLISHED" && !existing.publishedAt ? new Date() : undefined;
  const updated = await updatePost(id, { status, publishedAt });
  revalidatePostSurfaces(updated?.slug ?? existing.slug);
  return { ok: true, message: `“${existing.title}” is now ${status.toLowerCase()}.` };
}

export async function deletePostAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const existing = await getPost(id);
  if (!existing) return { ok: false, error: "That post no longer exists." };
  const removed = await deletePost(id);
  if (!removed) return { ok: false, error: "The post could not be deleted. Reload and try again." };
  revalidatePostSurfaces(existing.slug);
  return { ok: true, message: `“${existing.title}” deleted.` };
}

/* ---------------------------------------------------------------------------
   OFFICIAL NEWS — MediaCoverage rows of kind OFFICIAL.

   The league's or the franchise's own reporting: headline, source, date,
   external URL, description, cover, editorial status, Feature on Home.
   `parseCoverageForm` is passed only NEWS_KINDS, so a press article can
   never be filed here, and each guard refuses a row that is not official.
--------------------------------------------------------------------------- */

function revalidateNewsSurfaces() {
  revalidatePath("/news");
  revalidatePath("/");
  revalidatePath("/admin/news");
  revalidatePath("/admin");
}

export type CoverageActionResult = ActionResult<{ id: string }>;

export async function createOfficialNewsAction(formData: FormData): Promise<CoverageActionResult> {
  await requireAdmin();
  const parsed = await parseCoverageForm(formData, { allowedKinds: NEWS_KINDS, folder: "news" });
  if (!parsed.ok) return { ok: false, error: parsed.error };
  const row = await createMediaCoverage(parsed.input);
  revalidateNewsSurfaces();
  return {
    ok: true,
    id: row.id,
    message: row.status === "PUBLISHED" ? "Published to /news." : "Saved as a draft.",
  };
}

export async function updateOfficialNewsAction(formData: FormData): Promise<CoverageActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const existing = await getMediaCoverage(id);
  if (!existing || !NEWS_KINDS.includes(existing.kind)) {
    return { ok: false, error: "That news item no longer exists." };
  }
  const parsed = await parseCoverageForm(formData, { allowedKinds: NEWS_KINDS, folder: "news" });
  if (!parsed.ok) return { ok: false, error: parsed.error };
  const row = await updateMediaCoverage(id, parsed.input);
  if (!row) return { ok: false, error: "The item could not be saved. Reload and try again." };
  revalidateNewsSurfaces();
  return {
    ok: true,
    id,
    message: row.status === "PUBLISHED" ? "Saved and live on /news." : `Saved as ${row.status.toLowerCase()}.`,
  };
}

/** Quick Draft / Publish / Archive from a list row. */
export async function setOfficialNewsStatusAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const raw = String(formData.get("status") ?? "").toUpperCase();
  const status: PostStatus = raw === "PUBLISHED" || raw === "ARCHIVED" ? raw : "DRAFT";
  const existing = await getMediaCoverage(id);
  if (!existing || !NEWS_KINDS.includes(existing.kind)) {
    return { ok: false, error: "That news item no longer exists." };
  }
  await updateMediaCoverage(id, { status });
  revalidateNewsSurfaces();
  return { ok: true, message: `“${existing.title}” is now ${status.toLowerCase()}.` };
}

/** Toggle the home-page feature flag from the list. */
export async function setOfficialNewsFeaturedAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const featured = String(formData.get("featured") ?? "") === "1";
  const existing = await getMediaCoverage(id);
  if (!existing || !NEWS_KINDS.includes(existing.kind)) {
    return { ok: false, error: "That news item no longer exists." };
  }
  await updateMediaCoverage(id, { featuredOnHome: featured });
  revalidateNewsSurfaces();
  return {
    ok: true,
    message: featured
      ? existing.status === "PUBLISHED"
        ? "Featured on the home page."
        : "Marked as featured — it will show on the home page once published."
      : "Removed from the home page.",
  };
}

export async function deleteOfficialNewsAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const existing = await getMediaCoverage(id);
  if (!existing || !NEWS_KINDS.includes(existing.kind)) {
    return { ok: false, error: "That news item no longer exists." };
  }
  const removed = await deleteMediaCoverage(id);
  if (!removed) return { ok: false, error: "The item could not be deleted. Reload and try again." };
  revalidateNewsSurfaces();
  return { ok: true, message: `“${existing.title}” deleted.` };
}
