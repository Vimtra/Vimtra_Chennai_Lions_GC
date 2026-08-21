import "server-only";
import { prisma } from "@/lib/prisma";
import type { Score } from "@prisma/client";

/**
 * Score data layer — per-fixture, per-player row (leaderboard shape).
 * Admins hand-key rows during a tournament week; a future IGPL scrape will
 * upsert into the same table via a natural (fixtureId, playerName, round)
 * key handled at the API layer.
 */

export type { Score };

export async function listScoresForFixture(fixtureId: string): Promise<Score[]> {
  return prisma.score.findMany({
    where: { fixtureId },
    orderBy: [{ round: "asc" }, { position: "asc" }, { playerName: "asc" }],
  });
}

export interface ScoreInput {
  fixtureId: string;
  playerName: string;
  round?: number;
  position?: string | null;
  r1?: string | null;
  r2?: string | null;
  r3?: string | null;
  r4?: string | null;
  thru?: string | null;
  today?: string | null;
  total?: string | null;
}

export async function createScore(input: ScoreInput): Promise<Score> {
  return prisma.score.create({
    data: {
      fixtureId: input.fixtureId,
      playerName: input.playerName,
      round: input.round ?? 1,
      position: input.position ?? null,
      r1: input.r1 ?? null,
      r2: input.r2 ?? null,
      r3: input.r3 ?? null,
      r4: input.r4 ?? null,
      thru: input.thru ?? null,
      today: input.today ?? null,
      total: input.total ?? null,
    },
  });
}

export async function updateScore(
  id: string,
  input: Partial<ScoreInput>
): Promise<Score | null> {
  try {
    return await prisma.score.update({ where: { id }, data: input });
  } catch {
    return null;
  }
}

export async function deleteScore(id: string): Promise<boolean> {
  try {
    await prisma.score.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
