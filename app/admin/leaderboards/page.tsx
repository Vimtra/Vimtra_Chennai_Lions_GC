import type { Metadata } from "next";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { listStandings, type StandingRow, type StandingBoard } from "@/lib/standings";
import PageHeader from "@/components/admin/ui/PageHeader";
import EmptyState from "@/components/admin/ui/EmptyState";
import StandingRowForm, { type ExtraField } from "@/components/admin/StandingRowForm";

export const metadata: Metadata = {
  title: "Standings",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const SEASON = 2026;

const BOARD_META: Record<StandingBoard, { label: string; short: string; extraFields: ExtraField[] }> = {
  TEAM: {
    label: "Franchise standings",
    short: "Team",
    extraFields: [
      { key: "events", label: "Events", placeholder: "5" },
      { key: "bestFinish", label: "Best finish", placeholder: "1st ×2" },
      { key: "avgScore", label: "Avg score", placeholder: "70.1" },
    ],
  },
  PLAYER: {
    label: "Player of the Season",
    short: "Player",
    extraFields: [
      { key: "top10", label: "Top 10s", placeholder: "3" },
      { key: "wins", label: "Wins", placeholder: "1" },
    ],
  },
  ORDER: {
    label: "Order of Merit",
    short: "Merit",
    extraFields: [
      { key: "events", label: "Events", placeholder: "5" },
      { key: "earnings", label: "Earnings (₹)", placeholder: "1,64,80,000" },
      { key: "avgPerEvent", label: "Avg / event", placeholder: "6.2" },
    ],
  },
};

const TABS: StandingBoard[] = ["TEAM", "PLAYER", "ORDER"];

export default async function AdminStandingsPage({ searchParams }: { searchParams: Promise<{ board?: string }> }) {
  await requireAdmin();
  const { board: rawBoard } = await searchParams;
  const board: StandingBoard = rawBoard === "PLAYER" || rawBoard === "ORDER" ? rawBoard : "TEAM";

  const boards = await listStandings(SEASON);
  const rows: StandingRow[] = board === "TEAM" ? boards.team : board === "PLAYER" ? boards.player : boards.order;
  const counts: Record<StandingBoard, number> = { TEAM: boards.team.length, PLAYER: boards.player.length, ORDER: boards.order.length };
  const meta = BOARD_META[board];

  return (
    <>
      <PageHeader
        eyebrow="Season"
        title={`Standings · Season ${SEASON}`}
        lede={
          <>
            One row per rank, per board. The public <Link href="/leaderboards">/leaderboards</Link> page reads directly from
            these rows and shows an &ldquo;awaiting verified data&rdquo; panel for any empty board. Enter only figures
            verified against official IGPL standings.
          </>
        }
      />

      <div className="adm-toolbar">
        <div className="adm-chips">
          {TABS.map((t) => (
            <Link key={t} href={`/admin/leaderboards?board=${t}`} className={`adm-chip ${board === t ? "is-active" : ""}`}>
              {BOARD_META[t].label} <span className="adm-chip-n">{counts[t]}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="adm-stack">
        <section className="adm-panel">
          <div className="adm-panel-head">
            <h2 className="adm-h3">{meta.label}</h2>
            <span className="adm-sub" style={{ margin: 0 }}>
              {rows.length} row{rows.length === 1 ? "" : "s"}
            </span>
          </div>
          {rows.length === 0 ? (
            <EmptyState
              compact
              icon={<Trophy />}
              title={`No ${meta.label.toLowerCase()} rows yet`}
              body="The public board shows its awaiting-data panel until rows exist. Add the first rank below."
            />
          ) : (
            rows.map((r) => <StandingRowForm key={r.id} board={board} seasonYear={SEASON} extraFields={meta.extraFields} row={r} />)
          )}
        </section>

        <section className="adm-panel">
          <div className="adm-panel-head">
            <h2 className="adm-h3">Add a rank</h2>
            <span className="adm-sub" style={{ margin: 0 }}>
              A rank that already exists must be edited above, not re-added.
            </span>
          </div>
          <StandingRowForm board={board} seasonYear={SEASON} extraFields={meta.extraFields} />
        </section>
      </div>
    </>
  );
}
