"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { MediaKind } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import {
  createMediaCoverage,
  deleteMediaCoverage,
  updateMediaCoverage,
  type MediaCoverageInput,
} from "@/lib/media-coverage";

const KINDS: MediaKind[] = ["ARTICLE", "SOCIAL"];

function toKind(raw: FormDataEntryValue | null): MediaKind {
  const s = String(raw ?? "ARTICLE").toUpperCase();
  return (KINDS as string[]).includes(s) ? (s as MediaKind) : "ARTICLE";
}

function opt(raw: FormDataEntryValue | null): string | null {
  const s = String(raw ?? "").trim();
  return s ? s : null;
}
function req(raw: FormDataEntryValue | null): string {
  return String(raw ?? "").trim();
}
function parseDate(raw: FormDataEntryValue | null): Date | null {
  const s = String(raw ?? "").trim();
  if (!s) return null;
  const d = new Date(s + "T00:00:00Z");
  return isNaN(d.getTime()) ? null : d;
}

function parseInput(formData: FormData): MediaCoverageInput | null {
  const sourceName = req(formData.get("sourceName"));
  const sourceUrl = req(formData.get("sourceUrl"));
  const title = req(formData.get("title"));
  const summary = req(formData.get("summary"));
  if (!sourceName || !sourceUrl || !title || !summary) return null;
  // Only allow http(s) URLs. rel="noreferrer noopener" on the public card
  // still protects tabnabbing, but blocking javascript:/data: at input
  // time keeps the DB clean.
  try {
    const u = new URL(sourceUrl);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
  } catch {
    return null;
  }
  const sortRaw = formData.get("sortOrder");
  const sortOrder = sortRaw != null && String(sortRaw).trim() !== "" ? Number(sortRaw) : 0;
  return {
    kind: toKind(formData.get("kind")),
    sourceName,
    sourceUrl,
    title,
    summary,
    publishedAt: parseDate(formData.get("publishedAt")),
    coverImage: opt(formData.get("coverImage")),
    active: formData.get("active") === "on" || formData.get("active") === "true",
    sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
  };
}

function revalidateSurfaces() {
  revalidatePath("/news");
  revalidatePath("/admin/media");
}

export async function createMediaCoverageAction(formData: FormData) {
  await requireAdmin();
  const input = parseInput(formData);
  if (!input) redirect("/admin/media?error=invalid");
  await createMediaCoverage(input);
  revalidateSurfaces();
  redirect("/admin/media");
}

export async function updateMediaCoverageAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const input = parseInput(formData);
  if (!input) redirect(`/admin/media/${id}/edit?error=invalid`);
  await updateMediaCoverage(id, input);
  revalidateSurfaces();
  redirect("/admin/media");
}

export async function toggleActiveAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") === "true";
  await updateMediaCoverage(id, { active });
  revalidateSurfaces();
}

export async function deleteMediaCoverageAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await deleteMediaCoverage(id);
  revalidateSurfaces();
  redirect("/admin/media");
}
