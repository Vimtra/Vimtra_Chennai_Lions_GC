-- CreateTable
CREATE TABLE "Fixture" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "leg" TEXT,
    "presentedBy" TEXT,
    "dateStart" DATETIME NOT NULL,
    "dateEnd" DATETIME,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "courseName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'UPCOMING',
    "note" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Score" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fixtureId" TEXT NOT NULL,
    "playerName" TEXT NOT NULL,
    "round" INTEGER NOT NULL DEFAULT 1,
    "position" TEXT,
    "r1" TEXT,
    "r2" TEXT,
    "r3" TEXT,
    "r4" TEXT,
    "thru" TEXT,
    "today" TEXT,
    "total" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Score_fixtureId_fkey" FOREIGN KEY ("fixtureId") REFERENCES "Fixture" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Standing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "seasonYear" INTEGER NOT NULL,
    "board" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "teamName" TEXT,
    "points" INTEGER,
    "extra" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Fixture_slug_key" ON "Fixture"("slug");

-- CreateIndex
CREATE INDEX "Score_fixtureId_idx" ON "Score"("fixtureId");

-- CreateIndex
CREATE UNIQUE INDEX "Standing_seasonYear_board_rank_key" ON "Standing"("seasonYear", "board", "rank");

