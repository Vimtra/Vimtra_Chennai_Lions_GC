import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Activity } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { listFixtures, getFixture, formatFixtureDate } from "@/lib/fixtures";
import { listScoresForFixture } from "@/lib/scores";
import PageHeader from "@/components/admin/ui/PageHeader";
import EmptyState from "@/components/admin/ui/EmptyState";
import { FixturePill } from "@/components/admin/ui/StatusPill";
import ScoreRowForm from "@/components/admin/ScoreRowForm";

export const metadata: Metadata = {
  title: "Scores",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminScoresPage({ searchParams }: { searchParams: Promise<{ fixtureId?: string }> }) {
  await requireAdmin();
  const { fixtureId } = await searchParams;
  const fixtures = await listFixtures();
  const active = fixtureId
    ? ((await getFixture(fixtureId)) ?? null)
    : (fixtures.find((f) => f.status === "LIVE") ?? fixtures.find((f) => f.status === "UPCOMING") ?? fixtures[0] ?? null);
  const scores = active ? await listScoresForFixture(active.id) : [];
  const rounds = Array.from(new Set(scores.map((s) => s.round))).sort((a, b) => a - b);

  return (
    <>
      <PageHeader
        eyebrow="Season"
        title="Scores"
        lede={
          <>
            Hand-keyed leaderboard rows per fixture, exactly as the public <Link href="/scores">/scores</Link> board shows
            them. Enter only figures verified against the official IGPL leaderboard.
          </>
        }
      />

      {fixtures.length === 0 ? (
        <div className="adm-panel">
          <EmptyState
            icon={<CalendarDays />}
            title="No fixtures to score"
            body="Add the season calendar first — every score row belongs to a fixture."
            actions={
              <Link href="/admin/fixtures/new" className="adm-btn adm-btn-sm adm-btn-primary">
                Add fixture
              </Link>
            }
          />
        </div>
      ) : (
        <>
          <div className="adm-toolbar">
            <div className="adm-chips-scroll">
              <div className="adm-chips">
                {fixtures.map((f) => (
                  <Link key={f.id} href={`/admin/scores?fixtureId=${f.id}`} className={`adm-chip ${active?.id === f.id ? "is-active" : ""}`}>
                    {f.status === "LIVE" && <span aria-hidden style={{ width: 6, height: 6, borderRadius: 3, background: "var(--adm-gold)" }} />}
                    {f.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {!active ? (
            <div className="adm-panel">
              <EmptyState title="Fixture not found" body="Pick a fixture above." />
            </div>
          ) : (
            <div className="adm-stack">
              <section className="adm-panel adm-panel-dark adm-panel-pad">
                <div className="adm-inline" style={{ justifyContent: "space-between" }}>
                  <div>
                    <div className="adm-kicker">Scoring</div>
                    <h2 className="adm-h2" style={{ marginTop: 8 }}>
                      {active.name}
                    </h2>
                    <p className="adm-sub">
                      {active.courseName ? `${active.courseName} · ` : ""}
                      {active.city}
                      {active.city !== active.country ? `, ${active.country}` : ""} · {formatFixtureDate(active)}
                    </p>
                  </div>
                  <div className="adm-inline">
                    <FixturePill status={active.status} />
                    <Link href={`/admin/fixtures/${active.id}/edit`} className="adm-btn adm-btn-sm adm-btn-ink" style={{ background: "transparent", borderColor: "var(--adm-hair-ink)", color: "var(--adm-on-ink)" }}>
                      Edit fixture
                    </Link>
                  </div>
                </div>
              </section>

              <section className="adm-panel">
                <div className="adm-panel-head">
                  <h2 className="adm-h3">Leaderboard rows</h2>
                  <span className="adm-sub" style={{ margin: 0 }}>
                    {scores.length} row{scores.length === 1 ? "" : "s"}
                    {rounds.length > 1 ? ` across rounds ${rounds.join(", ")}` : ""}
                  </span>
                </div>
                {scores.length === 0 ? (
                  <EmptyState
                    compact
                    icon={<Activity />}
                    title="No score rows for this fixture"
                    body="Add the first row below. The public board stays unlit until rows exist."
                  />
                ) : (
                  scores.map((s) => <ScoreRowForm key={s.id} fixtureId={active.id} score={s} />)
                )}
              </section>

              <section className="adm-panel">
                <div className="adm-panel-head">
                  <h2 className="adm-h3">Add a row</h2>
                </div>
                <ScoreRowForm fixtureId={active.id} />
              </section>
            </div>
          )}
        </>
      )}
    </>
  );
}
