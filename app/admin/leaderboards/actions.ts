"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { StandingBoard } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import {
  deleteStanding,
  upsertStanding,
  type StandingExtra,
} from "@/lib/standings";

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
  const s = String(raw ?? "").trim();
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

export async function upsertStandingAction(formData: FormData) {
  await requireAdmin();
  const seasonYear = toInt(formData.get("seasonYear"), new Date().getUTCFullYear());
  const board = toBoard(formData.get("board"));
  const rank = toInt(formData.get("rank"));
  const name = optStr(formData.get("name"));
  if (!rank || !name) {
    redirect(`/admin/leaderboards?board=${board}&error=missing`);
  }
  await upsertStanding({
    seasonYear,
    board,
    rank,
    name,
    teamName: optStr(formData.get("teamName")),
    points: optInt(formData.get("points")),
    extra: extractExtras(formData, board),
  });
  revalidateStandings();
  redirect(`/admin/leaderboards?board=${board}&saved=1`);
}

export async function deleteStandingAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const board = toBoard(formData.get("board"));
  await deleteStanding(id);
  revalidateStandings();
  redirect(`/admin/leaderboards?board=${board}`);
}
