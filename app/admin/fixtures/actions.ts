"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { FixtureStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import {
  createFixture,
  deleteFixture,
  updateFixture,
  uniqueFixtureSlug,
  type FixtureInput,
} from "@/lib/fixtures";

const STATUSES: FixtureStatus[] = ["UPCOMING", "LIVE", "COMPLETED", "CANCELLED"];

function parseDate(raw: FormDataEntryValue | null): Date | null {
  if (!raw) return null;
  const s = String(raw).trim();
  if (!s) return null;
  const d = new Date(s + "T00:00:00Z");
  return isNaN(d.getTime()) ? null : d;
}

function opt(raw: FormDataEntryValue | null): string | null {
  const s = String(raw ?? "").trim();
  return s ? s : null;
}

async function parseInput(formData: FormData, ignoreId?: string): Promise<FixtureInput | null> {
  const name = String(formData.get("name") ?? "").trim();
  const dateStart = parseDate(formData.get("dateStart"));
  const city = String(formData.get("city") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const rawStatus = String(formData.get("status") ?? "UPCOMING").toUpperCase();
  const status = (STATUSES as string[]).includes(rawStatus)
    ? (rawStatus as FixtureStatus)
    : "UPCOMING";
  if (!name || !dateStart || !city || !country) return null;

  const slugRaw = opt(formData.get("slug"));
  const slug = slugRaw
    ? await uniqueFixtureSlug(slugRaw, ignoreId)
    : await uniqueFixtureSlug(name, ignoreId);

  const sortOrderRaw = formData.get("sortOrder");
  const sortOrder = sortOrderRaw != null && String(sortOrderRaw).trim() !== ""
    ? Number(sortOrderRaw)
    : 0;

  return {
    slug,
    name,
    leg: opt(formData.get("leg")),
    presentedBy: opt(formData.get("presentedBy")),
    dateStart,
    dateEnd: parseDate(formData.get("dateEnd")),
    city,
    country,
    courseName: opt(formData.get("courseName")),
    status,
    note: opt(formData.get("note")),
    sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
  };
}

function revalidateFixtures() {
  revalidatePath("/fixtures");
  revalidatePath("/scores");
  revalidatePath("/");
  revalidatePath("/admin/fixtures");
  revalidatePath("/admin/scores");
}

export async function createFixtureAction(formData: FormData) {
  await requireAdmin();
  const input = await parseInput(formData);
  if (!input) redirect("/admin/fixtures?error=invalid");
  await createFixture(input);
  revalidateFixtures();
  redirect("/admin/fixtures");
}

export async function updateFixtureAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const input = await parseInput(formData, id);
  if (!input) redirect(`/admin/fixtures/${id}/edit?error=invalid`);
  await updateFixture(id, input);
  revalidateFixtures();
  redirect("/admin/fixtures");
}

export async function deleteFixtureAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await deleteFixture(id);
  revalidateFixtures();
  revalidatePath("/admin/fixtures");
}
