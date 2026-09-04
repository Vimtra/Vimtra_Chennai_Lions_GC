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
      <div className="admin-head !mb-0">
        <div>
          <h1>Standings · Season {SEASON}</h1>
          <p>
            One row per rank, per board. The public{" "}
            <a href="/leaderboards" className="text-crimson-600 no-underline">
              /leaderboards
            </a>{" "}
            page reads directly from these rows.
          </p>
        </div>
      </div>

      <div className="admin-chip-row">
        {TABS.map((t) => (
          <a
            key={t.key}
            href={`/admin/leaderboards?board=${t.key}`}
            className={`admin-chip ${board === t.key ? "is-active" : ""}`}
          >
            {t.label}
          </a>
        ))}
      </div>

      {saved === "1" && (
        <div role="status" className="admin-banner is-success">
          Saved.
        </div>
      )}

      <div className="admin-card mt-2">
        <div className="admin-card-title">
          {BOARD_META[board].label} · {rows.length} row{rows.length === 1 ? "" : "s"}
        </div>

        {rows.length === 0 ? (
          <p className="font-manrope text-[13.5px] text-muted py-2 m-0">
            No rows yet. Add one below.
          </p>
        ) : (
          <div className="grid gap-3 mt-3">
            {rows.map((r) => (
              <StandingEditForm key={r.id} row={r} board={board} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="font-sora font-extrabold text-[20px] tracking-[-0.01em] text-ink mb-4">
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
    <div className="border border-black/[0.07] rounded-[4px] p-4" style={{ background: "#fff" }}>
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
    <form action={upsertStandingAction} className="admin-card grid gap-4">
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
