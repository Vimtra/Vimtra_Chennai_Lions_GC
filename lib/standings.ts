import "server-only";
import { prisma } from "@/lib/prisma";
import type { Standing } from "@prisma/client";

/**
 * Public/admin standings data layer for the franchise table.
 *
 * Legacy PLAYER and ORDER rows may remain in the database, but are
 * intentionally excluded from this data layer.
 */

export type StandingBoard = "TEAM";
export type { Standing };

export type StandingExtra = Record<string, string | number | null | undefined>;

export interface StandingRow {
  id: string;
  seasonYear: number;
  board: "TEAM";
  rank: number;
  name: string;
  teamName: string | null;
  points: number | null;
  extra: StandingExtra;
}

function parseExtra(raw: string | null): StandingExtra {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as StandingExtra) : {};
  } catch {
    return {};
  }
}

function serializeExtra(extra?: StandingExtra | null): string | null {
  if (!extra || Object.keys(extra).length === 0) return null;
  return JSON.stringify(extra);
}

function toRow(s: Standing): StandingRow {
  return {
    id: s.id,
    seasonYear: s.seasonYear,
    board: "TEAM",
    rank: s.rank,
    name: s.name,
    teamName: s.teamName,
    points: s.points,
    extra: parseExtra(s.extra),
  };
}

export async function listStandings(seasonYear: number): Promise<{ team: StandingRow[] }> {
  const rows = await prisma.standing.findMany({
    where: { seasonYear, board: "TEAM" },
    orderBy: { rank: "asc" },
  });
  return { team: rows.map(toRow) };
}

export interface StandingInput {
  seasonYear: number;
  board: "TEAM";
  rank: number;
  name: string;
  teamName?: string | null;
  points?: number | null;
  extra?: StandingExtra | null;
}

export async function upsertStanding(input: StandingInput): Promise<Standing> {
  const data = {
    seasonYear: input.seasonYear,
    board: input.board,
    rank: input.rank,
    name: input.name,
    teamName: input.teamName ?? null,
    points: input.points ?? null,
    extra: serializeExtra(input.extra),
  };
  return prisma.standing.upsert({
    where: {
      seasonYear_board_rank: {
        seasonYear: input.seasonYear,
        board: input.board,
        rank: input.rank,
      },
    },
    update: data,
    create: data,
  });
}

/**
 * Update one existing row by id. Changing the rank moves THIS row rather
 * than creating a second one (which is what an upsert keyed on rank did).
 * Returns "conflict" if another row in the same season + board already
 * holds the requested rank.
 */
export async function updateStandingById(
  id: string,
  input: Omit<StandingInput, "seasonYear" | "board">
): Promise<{ ok: true; row: Standing } | { ok: false; reason: "missing" | "conflict" | "unsupported" }> {
  const existing = await prisma.standing.findUnique({ where: { id } });
  if (!existing) return { ok: false, reason: "missing" };
  if (existing.board !== "TEAM") return { ok: false, reason: "unsupported" };
  if (input.rank !== existing.rank) {
    const clash = await prisma.standing.findUnique({
      where: {
        seasonYear_board_rank: {
          seasonYear: existing.seasonYear,
          board: existing.board,
          rank: input.rank,
        },
      },
    });
    if (clash && clash.id !== id) return { ok: false, reason: "conflict" };
  }
  const row = await prisma.standing.update({
    where: { id },
    data: {
      rank: input.rank,
      name: input.name,
      teamName: input.teamName ?? null,
      points: input.points ?? null,
      extra: serializeExtra(input.extra),
    },
  });
  return { ok: true, row };
}

export async function getStanding(id: string): Promise<Standing | null> {
  return prisma.standing.findUnique({ where: { id } });
}

export async function deleteStanding(id: string): Promise<boolean> {
  const existing = await prisma.standing.findUnique({ where: { id } });
  if (!existing || existing.board !== "TEAM") return false;
  await prisma.standing.delete({ where: { id } });
  return true;
}
