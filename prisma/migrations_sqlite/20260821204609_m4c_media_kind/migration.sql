-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MediaCoverage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kind" TEXT NOT NULL DEFAULT 'ARTICLE',
    "sourceName" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "publishedAt" DATETIME,
    "coverImage" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_MediaCoverage" ("active", "coverImage", "createdAt", "id", "publishedAt", "sortOrder", "sourceName", "sourceUrl", "summary", "title", "updatedAt") SELECT "active", "coverImage", "createdAt", "id", "publishedAt", "sortOrder", "sourceName", "sourceUrl", "summary", "title", "updatedAt" FROM "MediaCoverage";
DROP TABLE "MediaCoverage";
ALTER TABLE "new_MediaCoverage" RENAME TO "MediaCoverage";
CREATE INDEX "MediaCoverage_active_kind_sortOrder_idx" ON "MediaCoverage"("active", "kind", "sortOrder");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

