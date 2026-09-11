import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Activity, Plus, CalendarDays, Radio, CheckCircle2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { listFixtures, formatFixtureDate } from "@/lib/fixtures";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/PageHeader";
import EmptyState from "@/components/admin/ui/EmptyState";
import QuickActionButton from "@/components/admin/ui/QuickActionButton";
import ConfirmDeleteButton from "@/components/admin/ConfirmDeleteButton";
import { FixturePill } from "@/components/admin/ui/StatusPill";
import { deleteFixtureAction, setFixtureStatusAction } from "./actions";

export const metadata: Metadata = {
  title: "Fixtures",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminFixturesPage() {
  await requireAdmin();
  const [fixtures, scoreCounts] = await Promise.all([
    listFixtures(),
    prisma.score.groupBy({ by: ["fixtureId"], _count: { _all: true } }),
  ]);
  const scoresFor = (id: string) => scoreCounts.find((s) => s.fixtureId === id)?._count._all ?? 0;
  const live = fixtures.filter((f) => f.status === "LIVE").length;

  return (
    <>
      <PageHeader
        eyebrow="Season"
        title="Fixtures"
        lede={
          <>
            The AM Green IGPL Season 2026 calendar as shown on <Link href="/fixtures">/fixtures</Link> and the home page.
            Only verified dates and venues belong here — every row is a public claim.
          </>
        }
        actions={
          <Link href="/admin/fixtures/new" className="adm-btn adm-btn-primary">
            <Plus /> Add fixture
          </Link>
        }
      />

      {live > 1 && (
        <div className="adm-alert" data-tone="warn" style={{ marginBottom: 14 }}>
          <span>{live} fixtures are marked live at once. The scores desk and home page lead with the earliest-dated one.</span>
        </div>
      )}

      <div className="adm-panel">
        {fixtures.length === 0 ? (
          <EmptyState
            icon={<CalendarDays />}
            title="No fixtures yet"
            body="Add the season calendar to populate /fixtures, the home page season strip and the scores desk."
            actions={
              <Link href="/admin/fixtures/new" className="adm-btn adm-btn-sm adm-btn-primary">
                <Plus /> Add fixture
              </Link>
            }
          />
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table is-responsive">
              <thead>
                <tr>
                  <th>Fixture</th>
                  <th>Dates</th>
                  <th>Venue</th>
                  <th>Status</th>
                  <th>Scores</th>
                  <th className="adm-td-actions">
                    <span className="adm-sr">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {fixtures.map((f) => {
                  const n = scoresFor(f.id);
                  return (
                    <tr key={f.id} className={f.status === "LIVE" ? "is-highlight" : f.status === "CANCELLED" ? "is-dim" : undefined}>
                      <td className="adm-td-primary">
                        <Link href={`/admin/fixtures/${f.id}/edit`} className="adm-cell-title" style={{ textDecoration: "none" }}>
                          {f.name}
                        </Link>
                        <div className="adm-cell-sub">
                          {f.leg ? `${f.leg} · ` : ""}
                          <span className="adm-mono">{f.slug}</span>
                        </div>
                      </td>
                      <td data-label="Dates" className="adm-td-muted adm-td-nowrap">
                        {formatFixtureDate(f)}
                      </td>
                      <td data-label="Venue" className="adm-td-muted">
                        {f.courseName ? (
                          <>
                            {f.courseName}
                            <br />
                          </>
                        ) : null}
                        {f.city}
                        {f.city !== f.country ? `, ${f.country}` : ""}
                      </td>
                      <td data-label="Status">
                        <FixturePill status={f.status} />
                      </td>
                      <td data-label="Scores">
                        <Link href={`/admin/scores?fixtureId=${f.id}`} className="adm-link">
                          {n === 0 ? "No rows" : `${n} row${n === 1 ? "" : "s"}`}
                        </Link>
                      </td>
                      <td className="adm-td-actions">
                        <div className="adm-actions">
                          <Link href={`/admin/fixtures/${f.id}/edit`} className="adm-btn adm-btn-sm">
                            <Pencil /> Edit
                          </Link>
                          <Link href={`/admin/scores?fixtureId=${f.id}`} className="adm-btn adm-btn-sm">
                            <Activity /> Scores
                          </Link>
                          {f.status === "UPCOMING" && (
                            <QuickActionButton action={setFixtureStatusAction} fields={{ id: f.id, status: "LIVE" }} className="adm-btn adm-btn-sm adm-btn-ghost" title="Mark as live">
                              <Radio /> Go live
                            </QuickActionButton>
                          )}
                          {f.status === "LIVE" && (
                            <QuickActionButton action={setFixtureStatusAction} fields={{ id: f.id, status: "COMPLETED" }} className="adm-btn adm-btn-sm adm-btn-ghost" title="Mark as completed">
                              <CheckCircle2 /> Complete
                            </QuickActionButton>
                          )}
                          <ConfirmDeleteButton
                            action={deleteFixtureAction}
                            id={f.id}
                            label={f.name}
                            meta={formatFixtureDate(f)}
                            description={
                              n > 0
                                ? `Removes the fixture from /fixtures AND permanently deletes its ${n} score row${n === 1 ? "" : "s"}. Mark it Cancelled instead if it should stay on record.`
                                : "Removes the fixture from /fixtures and the home page. Mark it Cancelled instead if it should stay on record."
                            }
                            triggerClassName="adm-btn adm-btn-sm adm-btn-ghost adm-tone-danger"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
