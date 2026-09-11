import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import PageHeader from "@/components/admin/ui/PageHeader";
import PostEditor from "@/components/admin/PostEditor";
import CoverageForm from "@/components/admin/CoverageForm";
import { getPost } from "@/lib/posts";
import { NEWS_KINDS, getMediaCoverage } from "@/lib/media-coverage";
import { updateOfficialNewsAction } from "../../actions";

export const metadata: Metadata = {
  title: "Edit",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * /admin/news/[id]/edit resolves the id against BOTH things the News area
 * manages, so no existing URL breaks:
 *
 *   an OFFICIAL MediaCoverage row  →  the official-news form
 *   a Post                         →  the long-form TipTap editor
 *
 * Ids are cuids from two different tables and cannot collide. A row that
 * is neither — including a press article, which belongs to /admin/media —
 * is a 404 here rather than a form for the wrong desk.
 */
export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const item = await getMediaCoverage(id);
  if (item && NEWS_KINDS.includes(item.kind)) {
    return (
      <>
        <PageHeader
          back={{ href: "/admin/news", label: "Official News" }}
          eyebrow="Official News"
          title={item.title}
          lede={item.sourceName}
        />
        <div className="adm-panel adm-panel-pad" style={{ maxWidth: 880 }}>
          <CoverageForm mode="news" action={updateOfficialNewsAction} item={item} />
        </div>
      </>
    );
  }

  const post = await getPost(id);
  if (!post) notFound();

  return (
    <>
      <PageHeader
        back={{ href: "/admin/news/editorial", label: "Editorial posts" }}
        eyebrow="Editorial post"
        title={post.title}
        lede={<span className="adm-mono">/news/{post.slug}</span>}
      />
      <PostEditor post={post} />
    </>
  );
}
