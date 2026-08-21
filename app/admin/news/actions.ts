"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { PostStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import {
  createPost,
  deletePost,
  getPost,
  updatePost,
  type PostInput,
} from "@/lib/posts";

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
  if (slug) revalidatePath(`/news/${slug}`);
}

/**
 * Create a fresh DRAFT and redirect straight into the editor for it.
 * The admin list's "+ New post" button calls this.
 */
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

/**
 * Update every editable field, plus status. Handles slug uniqueness
 * (case-changes preserved via uniquePostSlug ignoring the current row).
 */
export async function updatePostAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const existing = await getPost(id);
  if (!existing) redirect("/admin/news?error=missing");

  const title = String(formData.get("title") ?? "").trim() || "Untitled post";
  const slugRaw = opt(formData.get("slug"));
  const status = toStatus(formData.get("status"));

  const publishedAtInput = parseDate(formData.get("publishedAt"));
  // If publish-date field left blank AND transitioning to PUBLISHED, let
  // the library auto-set to now(). Otherwise pass the parsed value (or null
  // to clear).
  const publishedAt =
    publishedAtInput ??
    (status === "PUBLISHED" && !existing?.publishedAt ? undefined : null);

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
  // If slug changed, also revalidate the previous URL.
  if (existing && updated && existing.slug !== updated.slug) {
    revalidatePath(`/news/${existing.slug}`);
  }
  redirect(`/admin/news/${id}/edit?saved=1`);
}

/** Quick status transitions from the list rows. */
export async function setStatusAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = toStatus(formData.get("status"));
  const existing = await getPost(id);
  if (!existing) return;
  const publishedAt =
    status === "PUBLISHED" && !existing.publishedAt ? new Date() : undefined;
  const updated = await updatePost(id, { status, publishedAt });
  revalidatePostSurfaces(updated?.slug ?? existing.slug);
}

export async function deletePostAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const existing = await getPost(id);
  await deletePost(id);
  revalidatePostSurfaces(existing?.slug ?? null);
  redirect("/admin/news");
}
