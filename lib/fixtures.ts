import "server-only";
import { prisma } from "@/lib/prisma";
import type { Fixture, FixtureStatus } from "@prisma/client";

/**
 * Fixture data layer — Postgres/SQLite via Prisma.
 *
 * The public /fixtures page and the admin surface both read/write through
 * this file. Every fixture the site displays comes out of here; there are
 * no hard-coded fixture arrays elsewhere in the code base any more.
 *
 * Pure formatters (formatFixtureDate, fixtureDay, fixtureMon) live in
 * lib/fixtures-format.ts so client components can import them without
 * pulling in the server-only Prisma surface.
 */

export type { Fixture, FixtureStatus };
export {
  formatFixtureDate,
  fixtureDay,
  fixtureMon,
} from "./fixtures-format";

/** Ordered by sortOrder (ascending) then dateStart (ascending). */
export async function listFixtures(): Promise<Fixture[]> {
  return prisma.fixture.findMany({
    orderBy: [{ sortOrder: "asc" }, { dateStart: "asc" }],
  });
}

/** Convenience buckets for the public page's category tabs. */
export function bucketFixtures(fixtures: Fixture[]): {
  live: Fixture[];
  upcoming: Fixture[];
  past: Fixture[];
} {
  return {
    live: fixtures.filter((f) => f.status === "LIVE"),
    upcoming: fixtures.filter((f) => f.status === "UPCOMING"),
    past: fixtures.filter(
      (f) => f.status === "COMPLETED" || f.status === "CANCELLED"
    ),
  };
}

export async function getFixture(id: string): Promise<Fixture | null> {
  return prisma.fixture.findUnique({ where: { id } });
}

export async function getFixtureBySlug(slug: string): Promise<Fixture | null> {
  return prisma.fixture.findUnique({ where: { slug } });
}

export interface FixtureInput {
  slug: string;
  name: string;
  leg?: string | null;
  presentedBy?: string | null;
  dateStart: Date;
  dateEnd?: Date | null;
  city: string;
  country: string;
  courseName?: string | null;
  status: FixtureStatus;
  note?: string | null;
  sortOrder?: number;
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "fixture"
  );
}

export async function uniqueFixtureSlug(name: string, ignoreId?: string): Promise<string> {
  const base = slugify(name);
  let candidate = base;
  let n = 2;
  while (true) {
    const existing = await prisma.fixture.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === ignoreId) return candidate;
    candidate = `${base}-${n++}`;
  }
}

export async function createFixture(input: FixtureInput): Promise<Fixture> {
  return prisma.fixture.create({ data: input });
}

export async function updateFixture(
  id: string,
  input: Partial<FixtureInput>
): Promise<Fixture | null> {
  try {
    return await prisma.fixture.update({ where: { id }, data: input });
  } catch {
    return null;
  }
}

export async function deleteFixture(id: string): Promise<boolean> {
  try {
    await prisma.fixture.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

