import { NextResponse, type NextRequest } from "next/server";
import { FIXTURES } from "@/data/fixtures";

export const dynamic = "force-dynamic";

/**
 * IGPL sync endpoint (scaffold) — see CLAUDE.md → IGPL Scoreboard & Fixture
 * Integration Plan. Intended to run on a Vercel Cron schedule (vercel.json).
 *
 * TODO (when a data source + DB exist):
 *   const html = await fetch(process.env.IGPL_URL!).then((r) => r.text());
 *   const $ = cheerio.load(html);
 *   // parse live scores, fixtures, and rankings from the tournament tables
 *   await db.saveScores(...); await db.saveFixtures(...); await db.saveStandings(...);
 *   revalidatePath("/scores"); revalidatePath("/fixtures"); revalidatePath("/leaderboards");
 *
 * For now it authenticates the cron request and returns the current shape.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  const key = req.nextUrl.searchParams.get("key");
  if (secret && auth !== `Bearer ${secret}` && key !== secret) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    syncedAt: new Date().toISOString(),
    source: "static-placeholder",
    counts: { fixtures: FIXTURES.length },
    note: "Replace with a cheerio scrape of the public IGPL page; persist to DB and revalidate /scores, /fixtures, /leaderboards.",
  });
}
