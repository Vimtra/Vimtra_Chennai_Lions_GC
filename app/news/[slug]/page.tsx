import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Reveal from "@/components/Reveal";
import { getPublishedPostBySlug, formatPublishedDate } from "@/lib/posts";
import PageHero from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { webSrc } from "@/lib/image-src";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) {
    return { title: "News · Vimtra Chennai Lions GC", robots: { index: false } };
  }
  const description = post.excerpt ?? `${post.title} — Vimtra Chennai Lions GC`;
  return {
    title: `${post.title} · Vimtra Chennai Lions GC`,
    description,
    openGraph: {
      type: "article",
      title: post.title,
      description,
      images: post.coverImage ? [post.coverImage] : undefined,
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.authorName],
    },
    twitter: {
      card: post.coverImage ? "summary_large_image" : "summary",
      title: post.title,
      description,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  // Draft and Archived posts must never render publicly.
  if (!post) notFound();

  return (
    <>
      <PageHero
        variant="editorial"
        above={
          <Link href="/news" className="hp-pagehero-back">
            ← From the Den
          </Link>
        }
        eyebrow={post.category ?? "Franchise News"}
        title={[post.title]}
        wrap
        lead={post.excerpt ?? undefined}
      />

      {post.coverImage && (
        <section className="bg-cream-100 px-8">
          <div className="max-w-[1100px] mx-auto -mt-10 relative">
            <div className="relative aspect-[16/9] rounded-[22px] overflow-hidden border border-black/[0.06]">
              <Image
                src={webSrc(post.coverImage)}
                alt={post.title}
                fill
                sizes="(max-width:1100px) 100vw, 1100px"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </section>
      )}

      <Section surface="ivory" size="tight">
          <Reveal
            variant="fade-up"
            className={[
              "post-body font-manrope text-[16px] leading-[1.75] text-[#3A1215]/90",
              // Editor-output typography, expressed as Tailwind arbitrary
              // selectors so we don't touch app/globals.css. Covers the
              // elements TipTap StarterKit emits.
              "[&_p]:my-[1em]",
              "[&_h2]:font-sora [&_h2]:font-extrabold [&_h2]:text-[clamp(24px,3vw,32px)] [&_h2]:tracking-[-0.015em] [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-ink",
              "[&_h3]:font-sora [&_h3]:font-bold [&_h3]:text-[22px] [&_h3]:tracking-[-0.01em] [&_h3]:mt-8 [&_h3]:mb-2 [&_h3]:text-ink",
              "[&_a]:text-crimson-600 [&_a]:underline [&_a]:underline-offset-[3px]",
              "[&_strong]:font-bold [&_strong]:text-ink",
              "[&_em]:italic",
              "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-[1em]",
              "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-[1em]",
              "[&_li]:my-[0.35em]",
              "[&_blockquote]:border-l-4 [&_blockquote]:border-crimson-600 [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-muted [&_blockquote]:my-6",
              "[&_code]:bg-cream-50 [&_code]:px-[6px] [&_code]:py-[2px] [&_code]:rounded-[6px] [&_code]:text-[14px]",
              "[&_pre]:bg-ink [&_pre]:text-white [&_pre]:p-4 [&_pre]:rounded-[12px] [&_pre]:overflow-x-auto [&_pre]:my-6",
              "[&_hr]:my-10 [&_hr]:border-t [&_hr]:border-black/[0.12]",
              "[&_img]:rounded-[14px] [&_img]:my-6",
            ].join(" ")}
          >
            {/* bodyHtml is produced by the admin TipTap editor; author is
                trusted (ADMIN role required to publish). Sanitisation could
                be layered in later if untrusted authors are added. */}
            <div dangerouslySetInnerHTML={{ __html: post.bodyHtml }} />
          </Reveal>

          <div className="mt-16 pt-8 border-t border-black/[0.08] flex flex-wrap items-center justify-between gap-4">
            <div className="font-manrope text-[13px] text-muted">
              Published on the Chennai Lions Notebook.
            </div>
            <Link
              href="/news"
              className="press inline-flex items-center gap-2 px-4 py-[9px] rounded-[24px] border border-ink/20 text-ink font-manrope font-bold text-[12.5px] no-underline"
            >
              ← Back to News
            </Link>
          </div>
        </Section>
    </>
  );
}
