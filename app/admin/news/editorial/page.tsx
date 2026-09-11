import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Pencil, Plus, Send, Archive, Undo2, FileText, ExternalLink } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import PageHeader from "@/components/admin/ui/PageHeader";
import EmptyState from "@/components/admin/ui/EmptyState";
import QuickActionButton from "@/components/admin/ui/QuickActionButton";
import ConfirmDeleteButton from "@/components/admin/ConfirmDeleteButton";
import { PostPill } from "@/components/admin/ui/StatusPill";
import { listPosts, formatPublishedDate } from "@/lib/posts";
import type { Post, PostStatus } from "@prisma/client";
import { newDraftAction, setStatusAction, deletePostAction } from "../actions";

export const metadata: Metadata = {
  title: "Editorial posts",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Filter = "all" | PostStatus;

const FILTER_TABS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "DRAFT", label: "Drafts" },
  { key: "PUBLISHED", label: "Published" },
  { key: "ARCHIVED", label: "Archived" },
];

export default async function AdminEditorialPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  await requireAdmin();
  const { filter: rawFilter } = await searchParams;
  const filter: Filter =
    rawFilter === "DRAFT" || rawFilter === "PUBLISHED" || rawFilter === "ARCHIVED" ? rawFilter : "all";
  const posts = await listPosts();
  const shown = filter === "all" ? posts : posts.filter((p) => p.status === filter);

  const counts = {
    all: posts.length,
    DRAFT: posts.filter((p) => p.status === "DRAFT").length,
    PUBLISHED: posts.filter((p) => p.status === "PUBLISHED").length,
    ARCHIVED: posts.filter((p) => p.status === "ARCHIVED").length,
  };

  return (
    <>
      <PageHeader
        eyebrow="Content"
        title="Editorial posts"
        lede={
          <>
            Long-form franchise pieces with a full article body, each with its own page at <span className="adm-mono">/news/&lt;slug&gt;</span>.
            Only <strong>published</strong> posts appear on <Link href="/news">/news</Link>. Short official items with an
            external link belong under <Link href="/admin/news">Official News</Link>.
          </>
        }
        actions={
          <form action={newDraftAction}>
            <button type="submit" className="adm-btn adm-btn-primary">
              <Plus /> New post
            </button>
          </form>
        }
      />

      <div className="adm-toolbar">
        <div className="adm-chips">
          {FILTER_TABS.map((t) => (
            <Link
              key={t.key}
              href={t.key === "all" ? "/admin/news/editorial" : `/admin/news/editorial?filter=${t.key}`}
              className={`adm-chip ${filter === t.key ? "is-active" : ""}`}
            >
              {t.label} <span className="adm-chip-n">{counts[t.key]}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="adm-panel">
        {shown.length === 0 ? (
          <EmptyState
            icon={<FileText />}
            title={filter === "all" ? "No posts yet" : `No ${filter.toLowerCase()} posts`}
            body={filter === "all" ? "Create a draft to start writing. Nothing is public until you publish it." : "Posts move here as their status changes."}
            actions={
              filter === "all" ? (
                <form action={newDraftAction}>
                  <button type="submit" className="adm-btn adm-btn-sm adm-btn-primary">
                    <Plus /> New post
                  </button>
                </form>
              ) : undefined
            }
          />
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table is-responsive">
              <thead>
                <tr>
                  <th>Post</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Author</th>
                  <th>Published</th>
                  <th className="adm-td-actions">
                    <span className="adm-sr">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {shown.map((p) => (
                  <PostRow key={p.id} post={p} />
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="adm-panel-foot">
          <span>{shown.length} shown</span>
          <Link href="/news" className="adm-link" target="_blank" rel="noreferrer">
            <ExternalLink style={{ width: 12, height: 12, verticalAlign: -1 }} /> Preview the public /news feed
          </Link>
        </div>
      </div>
    </>
  );
}

function PostRow({ post }: { post: Post }) {
  return (
    <tr className={post.status === "ARCHIVED" ? "is-dim" : undefined}>
      <td className="adm-td-primary">
        <div className="adm-cell-media">
          {post.coverImage ? (
            <span className="adm-thumb is-wide">
              <Image src={post.coverImage} alt="" width={64} height={42} style={{ width: "100%", height: "100%" }} />
            </span>
          ) : (
            <span className="adm-thumb-mono">VCL</span>
          )}
          <div>
            <Link href={`/admin/news/${post.id}/edit`} className="adm-cell-title" style={{ textDecoration: "none" }}>
              {post.title}
            </Link>
            <div className="adm-cell-sub">/{post.slug}</div>
          </div>
        </div>
      </td>
      <td data-label="Category" className="adm-td-muted">
        {post.category ?? "—"}
      </td>
      <td data-label="Status">
        <PostPill status={post.status} />
      </td>
      <td data-label="Author" className="adm-td-muted">
        {post.authorName}
      </td>
      <td data-label="Published" className="adm-td-muted adm-td-nowrap">
        {post.publishedAt ? formatPublishedDate(post.publishedAt) : "—"}
      </td>
      <td className="adm-td-actions">
        <div className="adm-actions">
          <Link href={`/admin/news/${post.id}/edit`} className="adm-btn adm-btn-sm">
            <Pencil /> Edit
          </Link>
          {post.status === "DRAFT" && (
            <QuickActionButton action={setStatusAction} fields={{ id: post.id, status: "PUBLISHED" }} className="adm-btn adm-btn-sm adm-btn-primary" title="Publish">
              <Send /> Publish
            </QuickActionButton>
          )}
          {post.status === "PUBLISHED" && (
            <QuickActionButton action={setStatusAction} fields={{ id: post.id, status: "ARCHIVED" }} className="adm-btn adm-btn-sm adm-btn-ghost" title="Archive">
              <Archive /> Archive
            </QuickActionButton>
          )}
          {post.status === "ARCHIVED" && (
            <QuickActionButton action={setStatusAction} fields={{ id: post.id, status: "DRAFT" }} className="adm-btn adm-btn-sm adm-btn-ghost" title="Restore to draft">
              <Undo2 /> Restore
            </QuickActionButton>
          )}
          <ConfirmDeleteButton
            action={deletePostAction}
            id={post.id}
            label={post.title}
            meta={`/news/${post.slug}`}
            description="Permanently deletes the post and its public page. Archiving keeps it on file instead."
            triggerClassName="adm-btn adm-btn-sm adm-btn-ghost adm-tone-danger"
          />
        </div>
      </td>
    </tr>
  );
}
