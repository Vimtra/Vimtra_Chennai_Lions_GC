import type { Metadata } from "next";
import { Trash2, Save } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";
import { listStandings, type StandingRow, type StandingBoard } from "@/lib/standings";
import {
  deleteStandingAction,
  upsertStandingAction,
} from "./actions";

export const metadata: Metadata = {
  title: "Standings · Lions Admin",
  robots: { index: false, follow: false },
};

const SEASON = 2026;

const BOARD_META: Record<
  StandingBoard,
  { label: string; extraFields: { key: string; label: string; placeholder?: string }[] }
> = {
  TEAM: {
    label: "Franchise Standings",
    extraFields: [
      { key: "events", label: "Events", placeholder: "5" },
      { key: "bestFinish", label: "Best Finish", placeholder: "1st ×2" },
      { key: "avgScore", label: "Avg Score", placeholder: "70.1" },
    ],
  },
  PLAYER: {
    label: "Player of the Season",
    extraFields: [
      { key: "top10", label: "Top 10s", placeholder: "3" },
      { key: "wins", label: "Wins", placeholder: "1" },
    ],
  },
  ORDER: {
    label: "Order of Merit",
    extraFields: [
      { key: "events", label: "Events", placeholder: "5" },
      { key: "earnings", label: "Earnings (₹)", placeholder: "1,64,80,000" },
      { key: "avgPerEvent", label: "Avg / Event", placeholder: "6.2" },
    ],
  },
};

const TABS: { key: StandingBoard; label: string }[] = [
  { key: "TEAM", label: "TEAM STANDINGS" },
  { key: "PLAYER", label: "PLAYER OF THE SEASON" },
  { key: "ORDER", label: "ORDER OF MERIT" },
];

export default async function AdminStandingsPage({
  searchParams,
}: {
  searchParams: Promise<{ board?: string; saved?: string }>;
}) {
  const user = await requireAdmin();
  const { board: rawBoard, saved } = await searchParams;
  const board: StandingBoard =
    rawBoard === "PLAYER" || rawBoard === "ORDER" ? rawBoard : "TEAM";

  const boards = await listStandings(SEASON);
  const rows: StandingRow[] =
    board === "TEAM" ? boards.team : board === "PLAYER" ? boards.player : boards.order;

  return (
    <AdminShell email={user.email} active="leaderboards">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-sora font-extrabold text-[34px] tracking-[-0.02em] text-ink">
            Standings · Season {SEASON}
          </h1>
          <p className="font-manrope text-[14px] text-muted mt-1">
            One row per rank, per board. The public{" "}
            <a href="/leaderboards" className="text-crimson-600 no-underline">
              /leaderboards
            </a>{" "}
            page reads directly from these rows.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <a
            key={t.key}
            href={`/admin/leaderboards?board=${t.key}`}
            className={`px-3 py-[7px] rounded-full font-manrope font-semibold text-[12.5px] transition-colors border ${
              board === t.key
                ? "bg-ink text-white border-ink"
                : "bg-cream-50 text-ink border-black/[0.08] hover:border-crimson-600 hover:text-crimson-600"
            }`}
          >
            {t.label}
          </a>
        ))}
      </div>

      {saved === "1" && (
        <div
          role="status"
          className="mt-5 p-[12px] rounded-[12px] font-manrope font-semibold text-[13.5px]"
          style={{ background: "rgba(14,138,79,0.10)", color: "#0E8A4F" }}
        >
          Saved.
        </div>
      )}

      <div className="mt-8 bg-cream-50 border border-black/[0.07] rounded-[18px] p-6">
        <h2 className="m-0 mb-4 font-sora font-extrabold text-[20px] tracking-[-0.015em] text-ink">
          {BOARD_META[board].label} · {rows.length} row{rows.length === 1 ? "" : "s"}
        </h2>

        {rows.length === 0 ? (
          <div className="font-manrope text-[13.5px] text-muted py-6">
            No rows yet. Add one below.
          </div>
        ) : (
          <div className="grid gap-3">
            {rows.map((r) => (
              <StandingEditForm key={r.id} row={r} board={board} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="font-sora font-extrabold text-[22px] tracking-[-0.02em] text-ink mb-4">
          Add a rank row
        </h2>
        <NewStandingForm board={board} />
      </div>
    </AdminShell>
  );
}

function StandingEditForm({ row, board }: { row: StandingRow; board: StandingBoard }) {
  return (
    // Two sibling forms in one card — HTML doesn't allow nested <form>.
    <div className="bg-white border border-black/[0.06] rounded-[14px] p-4">
      <form
        action={upsertStandingAction}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end"
      >
        <input type="hidden" name="seasonYear" value={row.seasonYear} />
        <input type="hidden" name="board" value={board} />
        <div className="field">
          <label>Rank</label>
          <input name="rank" type="number" defaultValue={row.rank} required />
        </div>
        <div className="field md:col-span-2">
          <label>Name</label>
          <input name="name" defaultValue={row.name} required />
        </div>
        <div className="field">
          <label>Points</label>
          <input
            name="points"
            type="number"
            defaultValue={row.points ?? ""}
            placeholder="—"
          />
        </div>
        <div className="field md:col-span-2">
          <label>Team (optional)</label>
          <input name="teamName" defaultValue={row.teamName ?? ""} />
        </div>
        {BOARD_META[board].extraFields.map((f) => (
          <div key={f.key} className="field">
            <label>{f.label}</label>
            <input
              name={f.key}
              defaultValue={(row.extra[f.key] as string | undefined) ?? ""}
              placeholder={f.placeholder}
            />
          </div>
        ))}
        <div className="flex gap-2 justify-end col-span-1 sm:col-span-2 md:col-span-4">
          <button type="submit" className="btn-ghost">
            <Save className="w-[13px] h-[13px]" /> Save
          </button>
        </div>
      </form>
      <form action={deleteStandingAction} className="mt-3 flex justify-end">
        <input type="hidden" name="id" value={row.id} />
        <input type="hidden" name="board" value={board} />
        <button type="submit" className="btn-ghost btn-danger">
          <Trash2 className="w-[13px] h-[13px]" /> Delete row
        </button>
      </form>
    </div>
  );
}

function NewStandingForm({ board }: { board: StandingBoard }) {
  return (
    <form
      action={upsertStandingAction}
      className="bg-cream-50 border border-black/[0.07] rounded-[18px] p-6 grid gap-4"
    >
      <input type="hidden" name="seasonYear" value={SEASON} />
      <input type="hidden" name="board" value={board} />
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="field">
          <label>Rank</label>
          <input name="rank" type="number" required placeholder="1" />
        </div>
        <div className="field md:col-span-2">
          <label>Name (team or player)</label>
          <input name="name" required placeholder="Vimtra Chennai Lions GC" />
        </div>
        <div className="field md:col-span-2">
          <label>Team / Franchise (players only)</label>
          <input name="teamName" placeholder="Vimtra Chennai Lions" />
        </div>
        <div className="field">
          <label>Points</label>
          <input name="points" type="number" placeholder="1694" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {BOARD_META[board].extraFields.map((f) => (
          <div key={f.key} className="field">
            <label>{f.label}</label>
            <input name={f.key} placeholder={f.placeholder} />
          </div>
        ))}
      </div>
      <div>
        <button type="submit" className="btn-dark press">
          Add / Update row
        </button>
      </div>
    </form>
  );
}
