"use server";

import { revalidatePath } from "next/cache";
import type { StandingBoard } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { deleteStanding, getStanding, updateStandingById, upsertStanding, type StandingExtra } from "@/lib/standings";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/admin-action-result";

const BOARDS: StandingBoard[] = ["TEAM", "PLAYER", "ORDER"];

function toBoard(raw: FormDataEntryValue | null): StandingBoard {
  const s = String(raw ?? "TEAM").toUpperCase();
  return (BOARDS as string[]).includes(s) ? (s as StandingBoard) : "TEAM";
}

function toInt(raw: FormDataEntryValue | null, fallback = 0): number {
  const n = Number(raw);
  return Number.isFinite(n) ? Math.round(n) : fallback;
}

function optStr(raw: FormDataEntryValue | null): string | null {
  const s = String(raw ?? "").trim().slice(0, 80);
  return s ? s : null;
}

function optInt(raw: FormDataEntryValue | null): number | null {
  const s = String(raw ?? "").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? Math.round(n) : null;
}

/** Board-specific extra columns. Only what the public LeaderboardTabs reads. */
function extractExtras(formData: FormData, board: StandingBoard): StandingExtra {
  const extras: StandingExtra = {};
  const push = (k: string) => {
    const v = optStr(formData.get(k));
    if (v !== null) extras[k] = v;
  };
  if (board === "TEAM") {
    push("events");
    push("bestFinish");
    push("avgScore");
  } else if (board === "PLAYER") {
    push("top10");
    push("wins");
  } else {
    push("events");
    push("earnings");
    push("avgPerEvent");
  }
  return extras;
}

function revalidateStandings() {
  revalidatePath("/leaderboards");
  revalidatePath("/admin/leaderboards");
}

/**
 * Save a rank row. With an `id` the existing row is updated in place (so a
 * rank change moves the row instead of duplicating it); without one a new
 * row is created, refusing to overwrite a rank that is already taken.
 */
export async function saveStandingAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const seasonYear = toInt(formData.get("seasonYear"), new Date().getUTCFullYear());
  const board = toBoard(formData.get("board"));
  const rank = toInt(formData.get("rank"));
  const name = optStr(formData.get("name"));
  if (!rank || rank < 1) return { ok: false, error: "Rank must be 1 or higher.", field: "rank" };
  if (!name) return { ok: false, error: "A team or player name is required.", field: "name" };

  const payload = {
    rank,
    name,
    teamName: optStr(formData.get("teamName")),
    points: optInt(formData.get("points")),
    extra: extractExtras(formData, board),
  };

  if (id) {
    const result = await updateStandingById(id, payload);
    if (!result.ok) {
      return result.reason === "conflict"
        ? { ok: false, error: `Rank ${rank} is already taken on this board. Change or delete that row first.`, field: "rank" }
        : { ok: false, error: "That row no longer exists." };
    }
    revalidateStandings();
    return { ok: true, message: `Saved rank ${rank} · ${name}.` };
  }

  const taken = await prisma.standing.findUnique({
    where: { seasonYear_board_rank: { seasonYear, board, rank } },
  });
  if (taken) {
    return { ok: false, error: `Rank ${rank} already exists (${taken.name}). Edit that row instead.`, field: "rank" };
  }
  await upsertStanding({ seasonYear, board, ...payload });
  revalidateStandings();
  return { ok: true, message: `Added rank ${rank} · ${name}.` };
}

export async function deleteStandingAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const existing = await getStanding(id);
  if (!existing) return { ok: false, error: "That row no longer exists." };
  const removed = await deleteStanding(id);
  if (!removed) return { ok: false, error: "The row could not be deleted. Reload and try again." };
  revalidateStandings();
  return { ok: true, message: `Removed rank ${existing.rank} · ${existing.name}.` };
}
