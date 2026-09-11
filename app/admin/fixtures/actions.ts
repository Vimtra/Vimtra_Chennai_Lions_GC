"use server";

import { revalidatePath } from "next/cache";
import type { FixtureStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createFixture,
  deleteFixture,
  getFixture,
  updateFixture,
  uniqueFixtureSlug,
  type FixtureInput,
} from "@/lib/fixtures";
import type { ActionResult } from "@/lib/admin-action-result";

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

type Parsed = { ok: true; input: FixtureInput } | { ok: false; error: string; field?: string };

async function parseInput(formData: FormData, ignoreId?: string): Promise<Parsed> {
  const name = String(formData.get("name") ?? "").trim();
  const dateStart = parseDate(formData.get("dateStart"));
  const dateEnd = parseDate(formData.get("dateEnd"));
  const city = String(formData.get("city") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const rawStatus = String(formData.get("status") ?? "UPCOMING").toUpperCase();
  const status = (STATUSES as string[]).includes(rawStatus) ? (rawStatus as FixtureStatus) : "UPCOMING";

  if (!name) return { ok: false, error: "A fixture name is required.", field: "name" };
  if (!dateStart) return { ok: false, error: "A valid start date is required.", field: "dateStart" };
  if (dateEnd && dateEnd < dateStart) return { ok: false, error: "The end date cannot be before the start date.", field: "dateEnd" };
  if (!city) return { ok: false, error: "A city is required.", field: "city" };
  if (!country) return { ok: false, error: "A country is required.", field: "country" };

  const slugRaw = opt(formData.get("slug"));
  const slug = slugRaw ? await uniqueFixtureSlug(slugRaw, ignoreId) : await uniqueFixtureSlug(name, ignoreId);

  const sortOrderRaw = formData.get("sortOrder");
  const sortOrder = sortOrderRaw != null && String(sortOrderRaw).trim() !== "" ? Number(sortOrderRaw) : 0;

  return {
    ok: true,
    input: {
      slug,
      name,
      leg: opt(formData.get("leg")),
      presentedBy: opt(formData.get("presentedBy")),
      dateStart,
      dateEnd,
      city,
      country,
      courseName: opt(formData.get("courseName")),
      status,
      note: opt(formData.get("note")),
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    },
  };
}

function revalidateFixtures() {
  revalidatePath("/fixtures");
  revalidatePath("/scores");
  revalidatePath("/");
  revalidatePath("/admin/fixtures");
  revalidatePath("/admin/scores");
  revalidatePath("/admin");
}

export type FixtureActionResult = ActionResult<{ id: string }>;

export async function createFixtureAction(formData: FormData): Promise<FixtureActionResult> {
  await requireAdmin();
  const parsed = await parseInput(formData);
  if (!parsed.ok) return parsed;
  const fixture = await createFixture(parsed.input);
  revalidateFixtures();
  return { ok: true, id: fixture.id, message: `“${fixture.name}” added to the calendar.` };
}

export async function updateFixtureAction(formData: FormData): Promise<FixtureActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const existing = await getFixture(id);
  if (!existing) return { ok: false, error: "That fixture no longer exists." };
  const parsed = await parseInput(formData, id);
  if (!parsed.ok) return parsed;
  const updated = await updateFixture(id, parsed.input);
  if (!updated) return { ok: false, error: "The fixture could not be saved. Reload and try again." };
  revalidateFixtures();
  return { ok: true, id, message: "Fixture saved." };
}

/** Quick status change from the list (LIVE / COMPLETED / …). */
export async function setFixtureStatusAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const raw = String(formData.get("status") ?? "").toUpperCase();
  if (!(STATUSES as string[]).includes(raw)) return { ok: false, error: "That status is not valid." };
  const existing = await getFixture(id);
  if (!existing) return { ok: false, error: "That fixture no longer exists." };
  await updateFixture(id, { status: raw as FixtureStatus });
  revalidateFixtures();
  return { ok: true, message: `“${existing.name}” is now ${raw.toLowerCase()}.` };
}

/**
 * Deleting a fixture cascades to every Score row keyed to it (see the
 * schema). The count is reported so the confirmation can say so.
 */
export async function deleteFixtureAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const existing = await getFixture(id);
  if (!existing) return { ok: false, error: "That fixture no longer exists." };
  const scores = await prisma.score.count({ where: { fixtureId: id } });
  const removed = await deleteFixture(id);
  if (!removed) return { ok: false, error: "The fixture could not be deleted. Reload and try again." };
  revalidateFixtures();
  return {
    ok: true,
    message: scores > 0 ? `“${existing.name}” deleted along with ${scores} score row${scores === 1 ? "" : "s"}.` : `“${existing.name}” deleted.`,
  };
}
