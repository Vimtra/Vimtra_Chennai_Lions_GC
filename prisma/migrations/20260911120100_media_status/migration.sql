-- Media coverage: editorial status + OFFICIAL backfill (M7, step 2 of 2).
--
-- `status` gives every coverage row the same Draft / Published / Archived
-- lifecycle Post already has, reusing the existing PostStatus enum rather
-- than minting a second one. `active` is kept: every existing query filters
-- on it, so it stays in the table and is derived from status on every
-- write by lib/media-coverage.ts. The backfill below sets both so no row
-- changes meaning — active rows are PUBLISHED, hidden rows are DRAFT.
--
-- The OFFICIAL backfill reclassifies exactly the rows the public page has
-- always treated as official: those whose source is theigpl.com. Nothing
-- is inferred from titles.

-- AlterTable
ALTER TABLE "MediaCoverage" ADD COLUMN "status" "PostStatus" NOT NULL DEFAULT 'PUBLISHED';

-- Backfill status from the existing visibility flag.
UPDATE "MediaCoverage" SET "status" = 'DRAFT' WHERE "active" = false;

-- Reclassify the league's own reporting.
UPDATE "MediaCoverage"
SET "kind" = 'OFFICIAL'
WHERE "kind" = 'ARTICLE'
  AND lower("sourceUrl") ~ '^https?://(www\.)?theigpl\.com/';

-- CreateIndex
CREATE INDEX "MediaCoverage_status_kind_sortOrder_idx" ON "MediaCoverage"("status", "kind", "sortOrder");
