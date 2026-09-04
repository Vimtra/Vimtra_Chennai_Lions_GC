import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Pencil, Trash2, ExternalLink, Plus, Send, Archive, Undo2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";
import { listPosts, formatPublishedDate } from "@/lib/posts";
import type { Post, PostStatus } from "@prisma/client";
import { newDraftAction, setStatusAction, deletePostAction } from "./actions";

export const metadata: Metadata = {
  title: "News · Lions Admin",
  robots: { index: false, follow: false },
};

type Filter = "all" | "DRAFT" | "PUBLISHED" | "ARCHIVED";

const FILTER_TABS: { key: Filter; label: string }[] = [
  { key: "all", label: "ALL" },
  { key: "DRAFT", label: "DRAFT" },
  { key: "PUBLISHED", label: "PUBLISHED" },
  { key: "ARCHIVED", label: "ARCHIVED" },
];

const STATUS_STYLE: Record<PostStatus, React.CSSProperties> = {
  DRAFT: { background: "rgba(107,99,92,0.10)", color: "#6B635C" },
  PUBLISHED: { background: "rgba(14,138,79,0.10)", color: "#0E8A4F" },
  ARCHIVED: { background: "rgba(26,21,19,0.08)", color: "#1A1513" },
};

export default async function AdminNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const user = await requireAdmin();
  const { filter: rawFilter } = await searchParams;
  const filter: Filter =
    rawFilter === "DRAFT" || rawFilter === "PUBLISHED" || rawFilter === "ARCHIVED"
      ? rawFilter
      : "all";
  const posts = await listPosts();
  const shown = filter === "all" ? posts : posts.filter((p) => p.status === filter);

  const counts = {
    all: posts.length,
    DRAFT: posts.filter((p) => p.status === "DRAFT").length,
    PUBLISHED: posts.filter((p) => p.status === "PUBLISHED").length,
    ARCHIVED: posts.filter((p) => p.status === "ARCHIVED").length,
  };

  return (
    <AdminShell email={user.email} active="news">
      <div className="admin-head">
        <div>
          <h1>News &amp; Notebook</h1>
          <p>
            Franchise editorial. Draft freely, publish deliberately, archive
            when a piece is out of date. Only <strong>Published</strong> posts
            appear on the public /news feed.
          </p>
        </div>
        <form action={newDraftAction}>
          <button type="submit" className="btn-dark press">
            <Plus className="w-[13px] h-[13px]" /> New post
          </button>
        </form>
      </div>

      <div className="admin-chip-row">
        {FILTER_TABS.map((t) => (
          <Link
            key={t.key}
            href={t.key === "all" ? "/admin/news" : `/admin/news?filter=${t.key}`}
            className={`admin-chip ${filter === t.key ? "is-active" : ""}`}
          >
            {t.label} <span className="opacity-60">({counts[t.key]})</span>
          </Link>
        ))}
      </div>

      <div className="admin-card overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Post</th>
              <th>Category</th>
              <th>Status</th>
              <th>Author</th>
              <th>Published</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((p) => (
              <PostRow key={p.id} post={p} />
            ))}
            {shown.length === 0 && (
              <tr>
                <td colSpan={6} className="admin-empty">
                  <p>
                    {filter === "all"
                      ? "No posts yet. Create your first draft to get started."
                      : `No ${filter.toLowerCase()} posts.`}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8 font-manrope text-[13px] text-muted flex items-center gap-2">
        <ExternalLink className="w-3.5 h-3.5" />
        <Link href="/news" className="text-crimson-600 no-underline">
          Preview the public /news feed →
        </Link>
      </div>
    </AdminShell>
  );
}

function PostRow({ post }: { post: Post }) {
  return (
    <tr>
      <td>
        <div className="flex items-center gap-3">
          {post.coverImage ? (
            <div className="relative w-[52px] h-[36px] rounded-[8px] overflow-hidden bg-cream-100 shrink-0">
              <Image
                src={post.coverImage}
                alt=""
                fill
                sizes="52px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-[52px] h-[36px] rounded-[8px] bg-gradient-to-br from-[#C9242E] to-[#871119] shrink-0" />
          )}
          <div>
            <div className="font-sora font-bold text-[14px] text-ink">
              {post.title}
            </div>
            <div className="font-manrope text-[12px] text-muted">
              /{post.slug}
            </div>
          </div>
        </div>
      </td>
      <td className="font-manrope text-muted">{post.category ?? "—"}</td>
      <td>
        <span className="tier-badge" style={STATUS_STYLE[post.status]}>
          {post.status}
        </span>
      </td>
      <td className="font-manrope text-muted">{post.authorName}</td>
      <td className="font-manrope text-[12.5px] text-muted">
        {post.publishedAt ? formatPublishedDate(post.publishedAt) : "—"}
      </td>
      <td>
        <div className="flex items-center gap-2 justify-end">
          <Link href={`/admin/news/${post.id}/edit`} className="btn-ghost">
            <Pencil className="w-[13px] h-[13px]" /> Edit
          </Link>
          {post.status === "DRAFT" && (
            <form action={setStatusAction}>
              <input type="hidden" name="id" value={post.id} />
              <input type="hidden" name="status" value="PUBLISHED" />
              <button type="submit" className="btn-ghost" title="Publish">
                <Send className="w-[13px] h-[13px]" /> Publish
              </button>
            </form>
          )}
          {post.status === "PUBLISHED" && (
            <form action={setStatusAction}>
              <input type="hidden" name="id" value={post.id} />
              <input type="hidden" name="status" value="ARCHIVED" />
              <button type="submit" className="btn-ghost" title="Archive">
                <Archive className="w-[13px] h-[13px]" /> Archive
              </button>
            </form>
          )}
          {post.status === "ARCHIVED" && (
            <form action={setStatusAction}>
              <input type="hidden" name="id" value={post.id} />
              <input type="hidden" name="status" value="DRAFT" />
              <button type="submit" className="btn-ghost" title="Restore to draft">
                <Undo2 className="w-[13px] h-[13px]" /> Restore
              </button>
            </form>
          )}
          <form action={deletePostAction}>
            <input type="hidden" name="id" value={post.id} />
            <button type="submit" className="btn-ghost btn-danger">
              <Trash2 className="w-[13px] h-[13px]" /> Delete
            </button>
          </form>
        </div>
      </td>
    </tr>
  );
}
