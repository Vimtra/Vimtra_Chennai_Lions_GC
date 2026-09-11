"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { getFixture } from "@/lib/fixtures";
import { createScore, deleteScore, updateScore } from "@/lib/scores";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/admin-action-result";

function opt(raw: FormDataEntryValue | null): string | null {
  const s = String(raw ?? "").trim().slice(0, 40);
  return s ? s : null;
}

function round(raw: FormDataEntryValue | null): number {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 && n <= 10 ? n : 1;
}

function revalidateFor(fixtureId: string) {
  revalidatePath("/scores");
  revalidatePath("/fixtures");
  revalidatePath("/admin/scores");
  revalidatePath(`/admin/scores?fixtureId=${fixtureId}`);
}

function fields(formData: FormData) {
  return {
    round: round(formData.get("round")),
    position: opt(formData.get("position")),
    r1: opt(formData.get("r1")),
    r2: opt(formData.get("r2")),
    r3: opt(formData.get("r3")),
    r4: opt(formData.get("r4")),
    thru: opt(formData.get("thru")),
    today: opt(formData.get("today")),
    total: opt(formData.get("total")),
  };
}

export async function createScoreAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const fixtureId = String(formData.get("fixtureId") ?? "");
  const playerName = String(formData.get("playerName") ?? "").trim().slice(0, 80);
  if (!fixtureId) return { ok: false, error: "Choose a fixture first." };
  if (!playerName) return { ok: false, error: "A player name is required.", field: "playerName" };
  const fixture = await getFixture(fixtureId);
  if (!fixture) return { ok: false, error: "That fixture no longer exists." };
  const row = await createScore({ fixtureId, playerName, ...fields(formData) });
  revalidateFor(fixtureId);
  return { ok: true, id: row.id, message: `Row added for ${playerName}.` };
}

export async function updateScoreAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const playerName = String(formData.get("playerName") ?? "").trim().slice(0, 80);
  if (!playerName) return { ok: false, error: "A player name is required.", field: "playerName" };
  const existing = await prisma.score.findUnique({ where: { id }, select: { fixtureId: true } });
  if (!existing) return { ok: false, error: "That score row no longer exists." };
  const updated = await updateScore(id, { playerName, ...fields(formData) });
  if (!updated) return { ok: false, error: "The row could not be saved. Reload and try again." };
  revalidateFor(existing.fixtureId);
  return { ok: true, message: `Saved ${playerName}.` };
}

export async function deleteScoreAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const existing = await prisma.score.findUnique({ where: { id }, select: { fixtureId: true, playerName: true } });
  if (!existing) return { ok: false, error: "That score row no longer exists." };
  const removed = await deleteScore(id);
  if (!removed) return { ok: false, error: "The row could not be deleted. Reload and try again." };
  revalidateFor(existing.fixtureId);
  return { ok: true, message: `Removed ${existing.playerName}.` };
}
