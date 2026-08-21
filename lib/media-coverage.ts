import "server-only";
import { prisma } from "@/lib/prisma";
import type { MediaCoverage, MediaKind } from "@prisma/client";

/**
 * Media Coverage data layer.
 *
 * Two kinds share this table: ARTICLE (third-party press mentions) and
 * SOCIAL (Instagram / social-platform posts). Public /news filters both
 * to `active: true` and splits them into their respective sections.
 */

export type { MediaCoverage, MediaKind };
export { formatCoverageDate, sourceInitials } from "./media-coverage-format";

export async function listMediaCoverage(): Promise<MediaCoverage[]> {
  return prisma.mediaCoverage.findMany({
    orderBy: [
      { active: "desc" },
      { kind: "asc" },
      { sortOrder: "desc" },
      { publishedAt: "desc" },
    ],
  });
}

export async function listActiveMediaCoverage(
  kind?: MediaKind
): Promise<MediaCoverage[]> {
  return prisma.mediaCoverage.findMany({
    where: kind ? { active: true, kind } : { active: true },
    orderBy: [{ sortOrder: "desc" }, { publishedAt: "desc" }],
  });
}

export async function getMediaCoverage(id: string): Promise<MediaCoverage | null> {
  return prisma.mediaCoverage.findUnique({ where: { id } });
}

export interface MediaCoverageInput {
  kind: MediaKind;
  sourceName: string;
  sourceUrl: string;
  title: string;
  summary: string;
  publishedAt?: Date | null;
  coverImage?: string | null;
  active: boolean;
  sortOrder?: number;
}

export async function createMediaCoverage(input: MediaCoverageInput): Promise<MediaCoverage> {
  return prisma.mediaCoverage.create({
    data: {
      kind: input.kind,
      sourceName: input.sourceName,
      sourceUrl: input.sourceUrl,
      title: input.title,
      summary: input.summary,
      publishedAt: input.publishedAt ?? null,
      coverImage: input.coverImage ?? null,
      active: input.active,
      sortOrder: input.sortOrder ?? 0,
    },
  });
}

export async function updateMediaCoverage(
  id: string,
  input: Partial<MediaCoverageInput>
): Promise<MediaCoverage | null> {
  try {
    return await prisma.mediaCoverage.update({ where: { id }, data: input });
  } catch {
    return null;
  }
}

export async function deleteMediaCoverage(id: string): Promise<boolean> {
  try {
    await prisma.mediaCoverage.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
