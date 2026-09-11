import "server-only";
import { prisma } from "@/lib/prisma";
import type { MediaCoverage, MediaKind, PostStatus } from "@prisma/client";

/**
 * Media Coverage data layer.
 *
 * One table, three kinds, one lifecycle:
 *
 *   OFFICIAL  the league's or the franchise's own reporting — managed under
 *             Admin → News, rendered under OFFICIAL NEWS on /news
 *   ARTICLE   third-party press — managed under Admin → Media, rendered
 *             under MEDIA COVERAGE on /news
 *   SOCIAL    a social-platform post — Admin → Media
 *
 * `status` (DRAFT / PUBLISHED / ARCHIVED) is the editorial state. `active`
 * is retained for every query that already filters on it and is ALWAYS
 * derived here on write (active = status === PUBLISHED), so the two can
 * never disagree and no caller has to know about both.
 */

export type { MediaCoverage, MediaKind, PostStatus };
export { formatCoverageDate, sourceInitials } from "./media-coverage-format";

/** The kinds each admin surface owns. The two sets never overlap. */
export const NEWS_KINDS: MediaKind[] = ["OFFICIAL"];
export const MEDIA_KINDS: MediaKind[] = ["ARTICLE", "SOCIAL"];

/** Everything, ordered for an admin table. */
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

/** Admin list scoped to one surface's kinds, drafts and archive included. */
export async function listMediaCoverageByKinds(
  kinds: MediaKind[]
): Promise<MediaCoverage[]> {
  return prisma.mediaCoverage.findMany({
    where: { kind: { in: kinds } },
    orderBy: [{ status: "asc" }, { sortOrder: "desc" }, { publishedAt: "desc" }],
  });
}

/**
 * Public — PUBLISHED only. Filters on `active`, which is the derived
 * mirror of status, so this is the same set `status: "PUBLISHED"` would
 * return and every pre-existing caller keeps its behaviour.
 */
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
  status: PostStatus;
  featuredOnHome?: boolean;
  sortOrder?: number;
}

/** The one place `active` is set. */
function derivedActive(status: PostStatus): boolean {
  return status === "PUBLISHED";
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
      status: input.status,
      active: derivedActive(input.status),
      featuredOnHome: input.featuredOnHome ?? false,
      sortOrder: input.sortOrder ?? 0,
    },
  });
}

export async function updateMediaCoverage(
  id: string,
  input: Partial<MediaCoverageInput>
): Promise<MediaCoverage | null> {
  try {
    const { status, ...rest } = input;
    return await prisma.mediaCoverage.update({
      where: { id },
      data: {
        ...rest,
        ...(status !== undefined ? { status, active: derivedActive(status) } : {}),
      },
    });
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
