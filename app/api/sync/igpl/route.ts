import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * IGPL sync endpoint.
 *
 * Gated behind IGPL_SYNC_ENABLED. Until an official IGPL data source (API
 * or scrapeable HTML) is wired in, the endpoint short-circuits with a
 * 503 so any accidental cron invocation is loud and honest instead of
 * silently returning fake success.
 *
 * When the flag flips on, the intended flow is:
 *
 *   1. fetch(process.env.IGPL_URL) → HTML or JSON
 *   2. parse to Fixture[], Score[], Standing[] shapes
 *   3. zod-validate each row (reject the whole batch if anything is off)
 *   4. upsert into Prisma
 *   5. revalidatePath("/fixtures"); revalidatePath("/scores"); revalidatePath("/leaderboards")
 *   6. return { ok: true, counts }
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  const key = req.nextUrl.searchParams.get("key");
  if (secret && auth !== `Bearer ${secret}` && key !== secret) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  if (process.env.IGPL_SYNC_ENABLED !== "true") {
    return NextResponse.json(
      {
        ok: false,
        disabled: true,
        note: "IGPL_SYNC_ENABLED is not set to 'true'. Enable it and configure IGPL_URL before invoking this endpoint.",
      },
      { status: 503 }
    );
  }

  // Placeholder success shape — the actual scrape lives behind the flag.
  const counts = {
    fixtures: await prisma.fixture.count(),
    scores: await prisma.score.count(),
    standings: await prisma.standing.count(),
  };

  return NextResponse.json({
    ok: true,
    syncedAt: new Date().toISOString(),
    source: "no-op-stub",
    counts,
    note: "Sync enabled but no scraper attached. Wire IGPL_URL + cheerio pipeline before relying on this endpoint.",
  });
}
