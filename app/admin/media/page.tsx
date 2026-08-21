import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Trash2, ExternalLink, EyeOff, Eye } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";
import {
  listMediaCoverage,
  formatCoverageDate,
} from "@/lib/media-coverage";
import MediaCoverageForm from "@/components/admin/MediaCoverageForm";
import {
  createMediaCoverageAction,
  deleteMediaCoverageAction,
  toggleActiveAction,
} from "./actions";

export const metadata: Metadata = {
  title: "Media Coverage · Lions Admin",
  robots: { index: false, follow: false },
};

export default async function AdminMediaPage() {
  const user = await requireAdmin();
  const items = await listMediaCoverage();
  const activeCount = items.filter((i) => i.active).length;

  return (
    <AdminShell email={user.email} active="media">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-sora font-extrabold text-[34px] tracking-[-0.02em] text-ink">
            Media Coverage
          </h1>
          <p className="font-manrope text-[14px] text-muted mt-1">
            Curated third-party press mentions. {activeCount} of {items.length}{" "}
            visible on the public{" "}
            <Link href="/news" className="text-crimson-600 no-underline">
              /news
            </Link>{" "}
            page.
          </p>
        </div>
        <Link href="#new" className="btn-dark">
          + Add coverage
        </Link>
      </div>

      <div className="mt-7 bg-cream-50 border border-black/[0.07] rounded-[18px] p-4 overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Kind</th>
              <th>Source</th>
              <th>Published</th>
              <th>Visible</th>
              <th>Sort</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((m) => (
              <tr key={m.id}>
                <td>
                  <div className="font-sora font-bold text-[14px] text-ink leading-[1.3]">
                    {m.title}
                  </div>
                  <div className="font-manrope text-[12px] text-muted mt-1 max-w-[520px] line-clamp-2">
                    {m.summary}
                  </div>
                </td>
                <td>
                  <span
                    className="tier-badge"
                    style={
                      m.kind === "SOCIAL"
                        ? {
                            background:
                              "linear-gradient(135deg,#E1306C,#833AB4)",
                            color: "#fff",
                          }
                        : { background: "#1A1513", color: "#E9CB8E" }
                    }
                  >
                    {m.kind}
                  </span>
                </td>
                <td>
                  <div className="font-manrope font-semibold text-[13px] text-ink">
                    {m.sourceName}
                  </div>
                  <a
                    href={m.sourceUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="font-manrope text-[11.5px] text-crimson-600 no-underline inline-flex items-center gap-1 mt-1"
                  >
                    <ExternalLink className="w-3 h-3" /> open
                  </a>
                </td>
                <td className="font-manrope text-[12.5px] text-muted">
                  {m.publishedAt ? formatCoverageDate(m.publishedAt) : "—"}
                </td>
                <td>
                  <span
                    className="tier-badge"
                    style={
                      m.active
                        ? { background: "rgba(14,138,79,0.10)", color: "#0E8A4F" }
                        : { background: "rgba(107,99,92,0.10)", color: "#6B635C" }
                    }
                  >
                    {m.active ? "VISIBLE" : "HIDDEN"}
                  </span>
                </td>
                <td className="font-manrope text-[12.5px] text-muted">{m.sortOrder}</td>
                <td>
                  <div className="flex items-center gap-2 justify-end">
                    <Link
                      href={`/admin/media/${m.id}/edit`}
                      className="btn-ghost"
                    >
                      <Pencil className="w-[13px] h-[13px]" /> Edit
                    </Link>
                    <form action={toggleActiveAction}>
                      <input type="hidden" name="id" value={m.id} />
                      <input
                        type="hidden"
                        name="active"
                        value={String(!m.active)}
                      />
                      <button type="submit" className="btn-ghost">
                        {m.active ? (
                          <>
                            <EyeOff className="w-[13px] h-[13px]" /> Hide
                          </>
                        ) : (
                          <>
                            <Eye className="w-[13px] h-[13px]" /> Show
                          </>
                        )}
                      </button>
                    </form>
                    <form action={deleteMediaCoverageAction}>
                      <input type="hidden" name="id" value={m.id} />
                      <button type="submit" className="btn-ghost btn-danger">
                        <Trash2 className="w-[13px] h-[13px]" /> Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="text-center font-manrope text-muted py-10"
                >
                  No media coverage entries yet. Add one below.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div id="new" className="mt-12 scroll-mt-24">
        <h2 className="font-sora font-extrabold text-[22px] tracking-[-0.02em] text-ink mb-5">
          Add coverage
        </h2>
        <div className="bg-cream-50 border border-black/[0.07] rounded-[18px] p-7 max-w-[860px]">
          <MediaCoverageForm
            action={createMediaCoverageAction}
            submitLabel="Add coverage"
          />
        </div>
      </div>

      <p className="mt-6 font-manrope text-[12.5px] text-muted max-w-[720px]">
        Do not paste full article text into the summary field. Write a short,
        original attribution of what the source published. Cover-image files
        are only appropriate to embed if you have permission from the source.
      </p>
    </AdminShell>
  );
}
