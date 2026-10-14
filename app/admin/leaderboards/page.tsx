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

const BOARD_LABEL = "Franchise standings";
const EXTRA_FIELDS: ExtraField[] = [
  { key: "r1", label: "R1", placeholder: "-" },
  { key: "r2", label: "R2", placeholder: "-" },
  { key: "r3", label: "R3", placeholder: "-" },
  { key: "score", label: "Score", placeholder: "-" },
];

export default async function AdminStandingsPage() {
  await requireAdmin();
  const boards = await listStandings(SEASON);
  const rows: StandingRow[] = boards.team;

  return (
    <>
      <PageHeader
        eyebrow="Season"
        title={`Standings · Season ${SEASON}`}
        lede={<>One row per rank. The public <Link href="/leaderboards">/leaderboards</Link> page reads these franchise standings directly. Enter only figures verified against official IGPL standings.</>}
      />

      <div className="adm-stack">
        <section className="adm-panel">
          <div className="adm-panel-head">
            <h2 className="adm-h3">{BOARD_LABEL}</h2>
            <span className="adm-sub" style={{ margin: 0 }}>
              {rows.length} row{rows.length === 1 ? "" : "s"}
            </span>
          </div>
          {rows.length === 0 ? (
            <EmptyState
              compact
              icon={<Trophy />}
              title="No franchise standings yet"
              body="The public standings page shows its awaiting-data panel until rows exist. Add the first rank below."
            />
          ) : (
            rows.map((r) => <StandingRowForm key={r.id} board="TEAM" seasonYear={SEASON} extraFields={EXTRA_FIELDS} row={r} />)
          )}
        </section>

        <section className="adm-panel">
          <div className="adm-panel-head">
            <h2 className="adm-h3">Add a rank</h2>
            <span className="adm-sub" style={{ margin: 0 }}>
              A rank that already exists must be edited above, not re-added.
            </span>
          </div>
          <StandingRowForm board="TEAM" seasonYear={SEASON} extraFields={EXTRA_FIELDS} />
        </section>
      </div>
    </>
  );
}
