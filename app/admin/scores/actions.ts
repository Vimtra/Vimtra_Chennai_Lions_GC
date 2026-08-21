"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createScore, deleteScore, updateScore } from "@/lib/scores";

function opt(raw: FormDataEntryValue | null): string | null {
  const s = String(raw ?? "").trim();
  return s ? s : null;
}

function num(raw: FormDataEntryValue | null, fallback = 1): number {
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

function revalidateFor(fixtureId: string) {
  revalidatePath("/scores");
  revalidatePath("/fixtures");
  revalidatePath(`/admin/scores`);
  revalidatePath(`/admin/scores?fixtureId=${fixtureId}`);
}

export async function createScoreAction(formData: FormData) {
  await requireAdmin();
  const fixtureId = String(formData.get("fixtureId") ?? "");
  const playerName = String(formData.get("playerName") ?? "").trim();
  if (!fixtureId || !playerName) {
    redirect(`/admin/scores?fixtureId=${fixtureId}&error=missing`);
  }
  await createScore({
    fixtureId,
    playerName,
    round: num(formData.get("round"), 1),
    position: opt(formData.get("position")),
    r1: opt(formData.get("r1")),
    r2: opt(formData.get("r2")),
    r3: opt(formData.get("r3")),
    r4: opt(formData.get("r4")),
    thru: opt(formData.get("thru")),
    today: opt(formData.get("today")),
    total: opt(formData.get("total")),
  });
  revalidateFor(fixtureId);
  redirect(`/admin/scores?fixtureId=${fixtureId}&saved=1`);
}

export async function updateScoreAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const fixtureId = String(formData.get("fixtureId") ?? "");
  await updateScore(id, {
    playerName: String(formData.get("playerName") ?? "").trim() || undefined,
    round: num(formData.get("round"), 1),
    position: opt(formData.get("position")),
    r1: opt(formData.get("r1")),
    r2: opt(formData.get("r2")),
    r3: opt(formData.get("r3")),
    r4: opt(formData.get("r4")),
    thru: opt(formData.get("thru")),
    today: opt(formData.get("today")),
    total: opt(formData.get("total")),
  });
  revalidateFor(fixtureId);
  redirect(`/admin/scores?fixtureId=${fixtureId}&saved=1`);
}

export async function deleteScoreAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const fixtureId = String(formData.get("fixtureId") ?? "");
  await deleteScore(id);
  revalidateFor(fixtureId);
  redirect(`/admin/scores?fixtureId=${fixtureId}`);
}
