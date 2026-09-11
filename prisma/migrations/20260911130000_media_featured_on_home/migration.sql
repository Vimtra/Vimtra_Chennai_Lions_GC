-- Allow admins to choose which published Official News appears on the home page.
ALTER TABLE "MediaCoverage" ADD COLUMN "featuredOnHome" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "MediaCoverage_featuredOnHome_status_kind_sortOrder_idx"
ON "MediaCoverage"("featuredOnHome", "status", "kind", "sortOrder");