import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import AeText from "@/components/AeText";
import { listStandings } from "@/lib/standings";
import LeaderboardTabs from "@/components/leaderboards/LeaderboardTabs";

export const metadata: Metadata = {
  title: "Leaderboards · Vimtra Chennai Lions GC",
  description:
    "AM Green IGPL Season 2026 standings — franchise table, Player of the Season race, and Order of Merit. Populates as verified season data becomes available.",
};

// Standings live in the database. Empty state renders whenever no rows
// exist for the current season — no illustrative or placeholder ranks are
// ever presented as though they were live.
export const dynamic = "force-dynamic";

const SEASON = 2026;

export default async function LeaderboardsPage() {
  const boards = await listStandings(SEASON);
  const total = boards.team.length + boards.player.length + boards.order.length;

  return (
    <>
      <section
        className="relative overflow-hidden px-8 pt-[88px] pb-[70px]"
        style={{
          background:
            "radial-gradient(125% 105% at 50% -5%,#C9242E 0%,#A8181F 58%,#871119 100%)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 84% 16%,rgba(233,203,142,0.16),transparent 42%)",
          }}
        />
        <div className="relative max-w-[1200px] mx-auto">
          <div className="font-manrope font-bold text-[12px] tracking-[0.32em] text-[#E9CB8E] uppercase">
            AM Green IGPL · Season {SEASON} Standings
          </div>
          <AeText
            text="LEADERBOARDS"
            mode="words"
            as="h1"
            className="mt-[14px] font-sora font-extrabold text-white"
            style={{
              fontSize: "clamp(52px,8vw,128px)",
              lineHeight: 0.92,
              letterSpacing: "-0.035em",
            }}
          />
          <Reveal
            variant="fade-up"
            delay={100}
            as="p"
            className="max-w-[620px] mt-[22px] font-manrope text-[16px] leading-[1.6] text-white/85"
          >
            Three boards for the {SEASON} season — the Franchise Table, the
            Player of the Season race, and the Order of Merit. Rows appear
            here as verified season data becomes available.
          </Reveal>
        </div>
      </section>

      <section className="bg-cream-100 px-8 pt-12 pb-24">
        <div className="max-w-[1100px] mx-auto">
          {total === 0 ? (
            <EmptyLeaderboardsState />
          ) : (
            <LeaderboardTabs seasonYear={SEASON} boards={boards} />
          )}
        </div>
      </section>
    </>
  );
}

function EmptyLeaderboardsState() {
  return (
    <Reveal
      variant="fade-up"
      className="rounded-[22px] border border-dashed border-black/[0.18] bg-cream-50 p-10 md:p-12"
    >
      <div className="font-manrope font-bold text-[10.5px] tracking-[0.28em] text-crimson-600 uppercase">
        Season 2026 · Standings Locked
      </div>
      <h2 className="mt-3 mb-4 font-sora font-extrabold text-[clamp(26px,3.4vw,36px)] leading-[1.15] tracking-[-0.02em] text-ink">
        Standings unlock as the season progresses.
      </h2>
      <div className="font-manrope text-[15px] leading-[1.68] text-muted max-w-[720px]">
        <p className="mb-3">
          Nothing is fabricated on this page. The Franchise Table, Player of
          the Season race, and Order of Merit will populate here once season
          scoring produces verifiable rows — either as admins publish them or
          as the future IGPL sync writes to the database.
        </p>
        <p className="m-0">
          The Season 2026 calendar carries <strong>15 events across 10 franchises</strong>{" "}
          — ten in India and five international. Chennai is one of the ten.
          See the calendar for the currently-announced dates.
        </p>
      </div>
      <div className="mt-7 flex flex-wrap gap-3">
        <Link
          href="/fixtures"
          className="cta-gold press"
          style={{ padding: "12px 22px", fontSize: 13 }}
        >
          SEE THE CALENDAR
        </Link>
        <Link
          href="/players"
          className="press inline-flex items-center gap-2 px-5 py-[11px] rounded-[30px] border border-ink/25 text-ink font-manrope font-bold text-[13px] no-underline"
        >
          THE ROSTER →
        </Link>
      </div>
    </Reveal>
  );
}
