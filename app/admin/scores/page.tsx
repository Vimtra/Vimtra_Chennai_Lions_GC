import type { Metadata } from "next";
import Link from "next/link";
import { Trash2, Save, ArrowRight } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";
import {
  listFixtures,
  getFixture,
  formatFixtureDate,
} from "@/lib/fixtures";
import { listScoresForFixture } from "@/lib/scores";
import type { Score } from "@prisma/client";
import {
  createScoreAction,
  deleteScoreAction,
  updateScoreAction,
} from "./actions";

export const metadata: Metadata = {
  title: "Scores · Lions Admin",
  robots: { index: false, follow: false },
};

export default async function AdminScoresPage({
  searchParams,
}: {
  searchParams: Promise<{ fixtureId?: string; saved?: string }>;
}) {
  const user = await requireAdmin();
  const { fixtureId, saved } = await searchParams;
  const fixtures = await listFixtures();
  const active = fixtureId
    ? (await getFixture(fixtureId)) ?? null
    : (fixtures.find((f) => f.status === "LIVE") ??
        fixtures.find((f) => f.status === "UPCOMING") ??
        fixtures[0] ?? null);
  const scores = active ? await listScoresForFixture(active.id) : [];

  return (
    <AdminShell email={user.email} active="scores">
      <div className="admin-head !mb-0">
        <div>
          <h1>Scores</h1>
          <p>
            Hand-key round-by-round leaderboard rows. The public{" "}
            <Link href="/scores" className="text-crimson-600 no-underline">
              /scores
            </Link>{" "}
            page reads from the same rows.
          </p>
        </div>
      </div>

      <div className="admin-chip-row">
        {fixtures.length === 0 && (
          <span className="font-manrope text-[13px] text-muted">
            Add a fixture first.
          </span>
        )}
        {fixtures.map((f) => (
          <Link
            key={f.id}
            href={`/admin/scores?fixtureId=${f.id}`}
            className={`admin-chip ${active?.id === f.id ? "is-active" : ""}`}
          >
            {f.name}
          </Link>
        ))}
      </div>

      {saved === "1" && (
        <div role="status" className="admin-banner is-success">
          Saved.
        </div>
      )}

      {!active ? (
        <div className="admin-card !border-dashed text-center">
          <p className="font-manrope text-[14px] text-muted m-0">
            No fixture selected. Add one under{" "}
            <Link href="/admin/fixtures" className="text-crimson-600 no-underline">
              Fixtures
            </Link>
            .
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 rounded-[4px] p-6" style={{ background: "var(--hp-ink)", color: "var(--hp-ivory)" }}>
            <div className="font-manrope font-bold text-[10.5px] tracking-[0.28em] uppercase" style={{ color: "var(--hp-gold-lt)" }}>
              Current fixture · {active.status}
            </div>
            <div className="mt-2 font-sora font-extrabold text-[22px] tracking-[-0.015em]">
              {active.name}
            </div>
            <div className="font-manrope text-[13px] mt-1" style={{ color: "var(--hp-muted-dark)" }}>
              {active.courseName ? `${active.courseName} · ` : ""}
              {active.city}
              {active.city !== active.country ? `, ${active.country}` : ""}
              {" · "}
              {formatFixtureDate(active)}
            </div>
          </div>

          <div className="admin-card mt-6 overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Pos</th>
                  <th>Player</th>
                  <th>Rnd</th>
                  <th>R1</th>
                  <th>R2</th>
                  <th>R3</th>
                  <th>R4</th>
                  <th>Thru</th>
                  <th>Today</th>
                  <th>Total</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((s) => (
                  <ScoreEditRow key={s.id} score={s} fixtureId={active.id} />
                ))}
                {scores.length === 0 && (
                  <tr>
                    <td colSpan={11} className="admin-empty">
                      <p>No score rows for this fixture yet. Add the first row below.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div id="new" className="mt-10 scroll-mt-24">
            <h2 className="font-sora font-extrabold text-[20px] tracking-[-0.01em] text-ink mb-4">
              Add a score row
            </h2>
            <form
              action={createScoreAction}
              className="admin-card grid grid-cols-1 md:grid-cols-11 gap-3"
            >
              <input type="hidden" name="fixtureId" value={active.id} />
              <ScoreInput label="Pos" name="position" placeholder="T2" />
              <ScoreInput label="Player" name="playerName" required className="md:col-span-3" />
              <ScoreInput label="Rnd" name="round" type="number" defaultValue="1" />
              <ScoreInput label="R1" name="r1" />
              <ScoreInput label="R2" name="r2" />
              <ScoreInput label="R3" name="r3" />
              <ScoreInput label="R4" name="r4" />
              <ScoreInput label="Thru" name="thru" />
              <ScoreInput label="Today" name="today" />
              <ScoreInput label="Total" name="total" />
              <div className="md:col-span-11">
                <button type="submit" className="btn-dark press">
                  Add row <ArrowRight className="w-[13px] h-[13px]" />
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </AdminShell>
  );
}

function ScoreInput({
  label,
  name,
  className = "",
  ...rest
}: {
  label: string;
  name: string;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`field ${className}`}>
      <label>{label}</label>
      <input name={name} {...rest} />
    </div>
  );
}

// Compact cell input — shared with the rest of admin via .admin-cell-input
// rather than a bespoke opt-out class.
const CELL = "admin-cell-input";

function ScoreEditRow({ score, fixtureId }: { score: Score; fixtureId: string }) {
  return (
    <tr className="align-top">
      <td colSpan={11} className="!p-0">
        <div className="border-b border-black/[0.06] py-3 px-3">
          <form
            action={updateScoreAction}
            className="grid grid-cols-2 md:grid-cols-11 gap-2 items-center"
          >
            <input type="hidden" name="id" value={score.id} />
            <input type="hidden" name="fixtureId" value={fixtureId} />
            <input
              name="position"
              defaultValue={score.position ?? ""}
              className={CELL}
              placeholder="Pos"
              aria-label="Position"
            />
            <input
              name="playerName"
              defaultValue={score.playerName}
              className={`${CELL} md:col-span-3 font-semibold`}
              required
              aria-label="Player name"
            />
            <input
              name="round"
              type="number"
              defaultValue={score.round}
              className={CELL}
              aria-label="Round"
            />
            <input name="r1" defaultValue={score.r1 ?? ""} className={CELL} placeholder="R1" aria-label="R1" />
            <input name="r2" defaultValue={score.r2 ?? ""} className={CELL} placeholder="R2" aria-label="R2" />
            <input name="r3" defaultValue={score.r3 ?? ""} className={CELL} placeholder="R3" aria-label="R3" />
            <input name="r4" defaultValue={score.r4 ?? ""} className={CELL} placeholder="R4" aria-label="R4" />
            <input name="thru" defaultValue={score.thru ?? ""} className={CELL} placeholder="Thru" aria-label="Thru" />
            <input name="today" defaultValue={score.today ?? ""} className={CELL} placeholder="Today" aria-label="Today" />
            <input name="total" defaultValue={score.total ?? ""} className={CELL} placeholder="Total" aria-label="Total" />
            <div className="col-span-2 md:col-span-11 flex justify-end gap-2 mt-1">
              <button type="submit" className="btn-ghost">
                <Save className="w-[13px] h-[13px]" /> Save
              </button>
            </div>
          </form>
          <form action={deleteScoreAction} className="mt-2 flex justify-end">
            <input type="hidden" name="id" value={score.id} />
            <input type="hidden" name="fixtureId" value={fixtureId} />
            <button type="submit" className="btn-ghost btn-danger">
              <Trash2 className="w-[13px] h-[13px]" /> Delete row
            </button>
          </form>
        </div>
      </td>
    </tr>
  );
}
