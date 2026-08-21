import "server-only";
import { prisma } from "@/lib/prisma";
import type { Standing, StandingBoard } from "@prisma/client";

/**
 * Standings data layer. Three boards per season — TEAM (franchise table),
 * PLAYER (Player of the Season race), ORDER (Order of Merit money list).
 *
 * The `extra` column holds a JSON string of board-specific columns (avg
 * score, best finish, top-tens, etc.) so we can render each board with
 * its own headers without adding columns to the base schema.
 */

export type { Standing, StandingBoard };

export type StandingExtra = Record<string, string | number | null | undefined>;

export interface StandingRow {
  id: string;
  seasonYear: number;
  board: StandingBoard;
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
    board: s.board,
    rank: s.rank,
    name: s.name,
    teamName: s.teamName,
    points: s.points,
    extra: parseExtra(s.extra),
  };
}

export async function listStandings(seasonYear: number): Promise<{
  team: StandingRow[];
  player: StandingRow[];
  order: StandingRow[];
}> {
  const rows = await prisma.standing.findMany({
    where: { seasonYear },
    orderBy: [{ board: "asc" }, { rank: "asc" }],
  });
  const converted = rows.map(toRow);
  return {
    team: converted.filter((r) => r.board === "TEAM"),
    player: converted.filter((r) => r.board === "PLAYER"),
    order: converted.filter((r) => r.board === "ORDER"),
  };
}

export interface StandingInput {
  seasonYear: number;
  board: StandingBoard;
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

export async function deleteStanding(id: string): Promise<boolean> {
  try {
    await prisma.standing.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
