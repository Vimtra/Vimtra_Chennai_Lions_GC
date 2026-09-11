-- M7 — MediaCoverage.status + OFFICIAL kind (SQLite mirror of the two
-- Postgres migrations 20260911120000 and 20260911120100). SQLite stores
-- Prisma enums as TEXT, so no enum alteration is needed; the column is
-- added, backfilled from `active`, and theigpl.com rows are reclassified.

-- AlterTable
ALTER TABLE "MediaCoverage" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'PUBLISHED';

UPDATE "MediaCoverage" SET "status" = 'DRAFT' WHERE "active" = 0;

UPDATE "MediaCoverage"
SET "kind" = 'OFFICIAL'
WHERE "kind" = 'ARTICLE'
  AND (lower("sourceUrl") LIKE 'https://theigpl.com/%'
    OR lower("sourceUrl") LIKE 'https://www.theigpl.com/%'
    OR lower("sourceUrl") LIKE 'http://theigpl.com/%'
    OR lower("sourceUrl") LIKE 'http://www.theigpl.com/%');

-- CreateIndex
CREATE INDEX "MediaCoverage_status_kind_sortOrder_idx" ON "MediaCoverage"("status", "kind", "sortOrder");
