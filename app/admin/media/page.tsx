import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { PostStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import CoverageTable from "@/components/admin/CoverageTable";
import PageHeader from "@/components/admin/ui/PageHeader";
import { MEDIA_KINDS, listMediaCoverageByKinds } from "@/lib/media-coverage";
import { deleteMediaCoverageAction, setMediaStatusAction } from "./actions";

export const metadata: Metadata = {
  title: "Media Coverage",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Filter = "ALL" | PostStatus;
const TABS: { key: Filter; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "DRAFT", label: "Drafts" },
  { key: "PUBLISHED", label: "Published" },
  { key: "ARCHIVED", label: "Archived" },
];

/**
 * Admin → Media Coverage. Third-party press (ARTICLE) and social posts
 * (SOCIAL) only. The league's and the franchise's own reporting is OFFICIAL
 * and lives under Admin → Official News; it never appears here.
 */
export default async function AdminMediaPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAdmin();
  const { status: raw } = await searchParams;
  const filter: Filter = raw === "DRAFT" || raw === "PUBLISHED" || raw === "ARCHIVED" ? raw : "ALL";
  const all = await listMediaCoverageByKinds(MEDIA_KINDS);
  const items = filter === "ALL" ? all : all.filter((i) => i.status === filter);
  const counts = {
    ALL: all.length,
    DRAFT: all.filter((i) => i.status === "DRAFT").length,
    PUBLISHED: all.filter((i) => i.status === "PUBLISHED").length,
    ARCHIVED: all.filter((i) => i.status === "ARCHIVED").length,
  };

  return (
    <>
      <PageHeader
        eyebrow="Content"
        title="Media Coverage"
        lede={
          <>
            What the press and social platforms published about the Lions. Published items appear under{" "}
            <strong>Media Coverage</strong> on <Link href="/news">/news</Link>. The league&rsquo;s own reporting is filed
            under <Link href="/admin/news">Official News</Link>.
          </>
        }
        actions={
          <Link href="/admin/media/new" className="adm-btn adm-btn-primary">
            <Plus /> Add media article
          </Link>
        }
      />

      <div className="adm-toolbar">
        <div className="adm-chips">
          {TABS.map((t) => (
            <Link key={t.key} href={t.key === "ALL" ? "/admin/media" : `/admin/media?status=${t.key}`} className={`adm-chip ${filter === t.key ? "is-active" : ""}`}>
              {t.label} <span className="adm-chip-n">{counts[t.key]}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="adm-panel">
        <CoverageTable
          items={items}
          mode="media"
          filtered={filter !== "ALL"}
          setStatusAction={setMediaStatusAction}
          deleteAction={deleteMediaCoverageAction}
        />
        {items.length > 0 && (
          <div className="adm-table-note">
            Write a short, original attribution of what the source published. Upload a cover only if the franchise owns the
            photograph or has permission from the source.
          </div>
        )}
      </div>
    </>
  );
}
