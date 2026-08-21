import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Trash2, Activity } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { listFixtures, formatFixtureDate } from "@/lib/fixtures";
import AdminShell from "@/components/admin/AdminShell";
import FixtureForm from "@/components/admin/FixtureForm";
import { createFixtureAction, deleteFixtureAction } from "./actions";

export const metadata: Metadata = {
  title: "Fixtures · Lions Admin",
  robots: { index: false, follow: false },
};

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  LIVE: { background: "#E9CB8E", color: "#3A1A06" },
  UPCOMING: { background: "rgba(196,32,42,0.10)", color: "#C4202A" },
  COMPLETED: { background: "rgba(26,21,19,0.08)", color: "#1A1513" },
  CANCELLED: { background: "rgba(107,99,92,0.10)", color: "#6B635C" },
};

export default async function AdminFixturesPage() {
  const user = await requireAdmin();
  const fixtures = await listFixtures();

  return (
    <AdminShell email={user.email} active="fixtures">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-sora font-extrabold text-[34px] tracking-[-0.02em] text-ink">Fixtures</h1>
          <p className="font-manrope text-[14px] text-muted mt-1">
            {fixtures.length} fixture{fixtures.length === 1 ? "" : "s"} · verified against the Chennai Lions IGPL brochure
          </p>
        </div>
        <Link href="#new" className="btn-dark">+ Add fixture</Link>
      </div>

      <div className="mt-7 bg-cream-50 border border-black/[0.07] rounded-[18px] p-4 overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Fixture</th>
              <th>Dates</th>
              <th>Venue</th>
              <th>Status</th>
              <th>Sort</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {fixtures.map((f) => (
              <tr key={f.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-[9px] bg-gradient-to-br from-[#C9242E] to-[#871119] text-white/85 font-sora font-extrabold text-[11px] flex items-center justify-center">
                      <Activity className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="font-sora font-bold text-[14px] text-ink">{f.name}</div>
                      <div className="font-manrope text-[12px] text-muted">{f.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="font-manrope text-muted">{formatFixtureDate(f)}</td>
                <td className="font-manrope text-muted">
                  {f.courseName ? `${f.courseName} · ` : ""}
                  {f.city}
                  {f.city !== f.country ? `, ${f.country}` : ""}
                </td>
                <td>
                  <span className="tier-badge" style={STATUS_STYLE[f.status]}>
                    {f.status}
                  </span>
                </td>
                <td className="font-manrope text-[12.5px] text-muted">{f.sortOrder}</td>
                <td>
                  <div className="flex items-center gap-2 justify-end">
                    <Link
                      href={`/admin/fixtures/${f.id}/edit`}
                      className="btn-ghost"
                    >
                      <Pencil className="w-[13px] h-[13px]" /> Edit
                    </Link>
                    <Link
                      href={`/admin/scores?fixtureId=${f.id}`}
                      className="btn-ghost"
                    >
                      <Activity className="w-[13px] h-[13px]" /> Scores
                    </Link>
                    <form action={deleteFixtureAction}>
                      <input type="hidden" name="id" value={f.id} />
                      <button type="submit" className="btn-ghost btn-danger">
                        <Trash2 className="w-[13px] h-[13px]" /> Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {fixtures.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center font-manrope text-muted py-8">
                  No fixtures yet. Add one below.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div id="new" className="mt-12 scroll-mt-24">
        <h2 className="font-sora font-extrabold text-[24px] tracking-[-0.02em] text-ink mb-5">
          Add a fixture
        </h2>
        <div className="bg-cream-50 border border-black/[0.07] rounded-[18px] p-7 max-w-[860px]">
          <FixtureForm action={createFixtureAction} submitLabel="Add fixture" />
        </div>
      </div>
    </AdminShell>
  );
}
