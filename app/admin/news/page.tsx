import type { Metadata } from "next";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import type { PostStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import CoverageTable from "@/components/admin/CoverageTable";
import PageHeader from "@/components/admin/ui/PageHeader";
import { NEWS_KINDS, listMediaCoverageByKinds } from "@/lib/media-coverage";
import {
  deleteOfficialNewsAction,
  setOfficialNewsStatusAction,
  setOfficialNewsFeaturedAction,
} from "./actions";

export const metadata: Metadata = {
  title: "Official News",
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
 * Admin → Official News. OFFICIAL coverage only: the league's and the
 * franchise's own reporting. Third-party press lives under Admin → Media
 * and never appears here. Long-form franchise posts (the TipTap editor)
 * keep their own list at /admin/news/editorial.
 */
export default async function AdminNewsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAdmin();
  const { status: raw } = await searchParams;
  const filter: Filter = raw === "DRAFT" || raw === "PUBLISHED" || raw === "ARCHIVED" ? raw : "ALL";
  const all = await listMediaCoverageByKinds(NEWS_KINDS);
  const items = filter === "ALL" ? all : all.filter((i) => i.status === filter);
  const counts = {
    ALL: all.length,
    DRAFT: all.filter((i) => i.status === "DRAFT").length,
    PUBLISHED: all.filter((i) => i.status === "PUBLISHED").length,
    ARCHIVED: all.filter((i) => i.status === "ARCHIVED").length,
  };
  const featured = all.filter((i) => i.status === "PUBLISHED" && i.featuredOnHome);

  return (
    <>
      <PageHeader
        eyebrow="Content"
        title="Official News"
        lede={
          <>
            The league&rsquo;s and the franchise&rsquo;s own reporting — published items appear under{" "}
            <strong>Official News</strong> on <Link href="/news">/news</Link>, and one featured story drives the home page.
            Press coverage is filed separately under <Link href="/admin/media">Media Coverage</Link>.
          </>
        }
        actions={
          <>
            <Link href="/admin/news/editorial" className="adm-btn">
              <FileText /> Editorial posts
            </Link>
            <Link href="/admin/news/new" className="adm-btn adm-btn-primary">
              <Plus /> Add official news
            </Link>
          </>
        }
      />

      {featured.length === 0 && counts.PUBLISHED > 0 && (
        <div className="adm-alert" data-tone="warn" style={{ marginBottom: 14 }}>
          <span>
            No published story is featured on the home page right now — the home news section is empty. Use{" "}
            <strong>Feature</strong> on a published item below.
          </span>
        </div>
      )}
      {featured.length > 1 && (
        <div className="adm-alert" data-tone="info" style={{ marginBottom: 14 }}>
          <span>
            {featured.length} published stories are marked featured. The home page shows only the highest-sorted one:{" "}
            <strong>{featured[0].title}</strong>.
          </span>
        </div>
      )}

      <div className="adm-toolbar">
        <div className="adm-chips">
          {TABS.map((t) => (
            <Link key={t.key} href={t.key === "ALL" ? "/admin/news" : `/admin/news?status=${t.key}`} className={`adm-chip ${filter === t.key ? "is-active" : ""}`}>
              {t.label} <span className="adm-chip-n">{counts[t.key]}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="adm-panel">
        <CoverageTable
          items={items}
          mode="news"
          filtered={filter !== "ALL"}
          setStatusAction={setOfficialNewsStatusAction}
          deleteAction={deleteOfficialNewsAction}
          setFeaturedAction={setOfficialNewsFeaturedAction}
        />
        {items.length > 0 && (
          <div className="adm-table-note">
            Only file items the league or the franchise itself published. Write a short, original description — never paste
            the article body.
          </div>
        )}
      </div>
    </>
  );
}
