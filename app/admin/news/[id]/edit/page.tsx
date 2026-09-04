import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";
import PostEditor from "@/components/admin/PostEditor";
import { getPost } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Edit Post · Lions Admin",
  robots: { index: false, follow: false },
};

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const user = await requireAdmin();
  const { id } = await params;
  const { saved } = await searchParams;
  const post = await getPost(id);
  if (!post) notFound();

  return (
    <AdminShell email={user.email} active="news">
      <Link
        href="/admin/news"
        className="font-manrope font-semibold text-[13px] text-crimson-600 no-underline"
      >
        ← Back to News
      </Link>
      <h1 className="mt-3 font-sora font-extrabold text-[32px] tracking-[-0.02em] text-ink">
        Edit post
      </h1>
      <p className="font-manrope text-[14px] text-muted mt-1">
        {post.title} · <span className="text-[12.5px]">/{post.slug}</span>
      </p>

      {saved === "1" && (
        <div role="status" className="admin-banner is-success mt-4">
          Saved.
        </div>
      )}

      <div className="mt-7">
        <PostEditor post={post} />
      </div>
    </AdminShell>
  );
}
