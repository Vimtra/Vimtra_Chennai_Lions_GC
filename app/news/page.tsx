import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Instagram } from "lucide-react";
import Reveal from "@/components/Reveal";
import { listPublishedPosts, formatPublishedDate } from "@/lib/posts";
import {
  listActiveMediaCoverage,
  formatCoverageDate,
} from "@/lib/media-coverage";
import type { Post, MediaCoverage } from "@prisma/client";
import PageHero from "@/components/site/PageHero";
import { Section, IndexLabel } from "@/components/site/Section";
import { webSrc } from "@/lib/image-src";

export const metadata: Metadata = {
  title: "News · Vimtra Chennai Lions GC",
  description:
    "From the Den — official franchise news, third-party press coverage, and social updates about the Vimtra Chennai Lions.",
};

// Always resolve against the current DB row set so admin publishes and
// updates are reflected immediately.
export const dynamic = "force-dynamic";

// Uniform premium editorial ratio for every card on the page. Kept as a
// tuple so the same numbers apply to both the container and next/image
// sizes calculation.
const CARD_ASPECT = { w: 16, h: 10 } as const;

// The single project-owned fallback we ever use — reserved for future
// items an admin creates without a cover. Never shown for the currently
// seeded rows (every seeded row already has a genuinely-relevant cover).
const FRANCHISE_FALLBACK = "/assets/hero-golfer-web.png";

export default async function NewsPage() {
  const [posts, articles, social] = await Promise.all([
    listPublishedPosts(),
    listActiveMediaCoverage("ARTICLE"),
    listActiveMediaCoverage("SOCIAL"),
  ]);

  return (
    <>
      {/* ============================ HERO ============================ */}
      <PageHero
        eyebrow="From the Den"
        title={["NEWS"]}
        lead={
    <>
      Official Chennai Lions franchise news, third-party press coverage, and social updates — clearly separated so it&apos;s always clear who is speaking.
    </>
  }
      />

      {/* =================== A · OFFICIAL NEWS =================== */}
      <SectionBand
        eyebrow="Official News · Franchise Editorial"
        title="From the newsroom."
        blurb="Articles written and published by the Chennai Lions editorial team."
        variant="cream"
      >
        {posts.length === 0 ? (
          <EditorialEmpty />
        ) : (
          <CardGrid>
            {posts.map((post) => (
              <EditorialCard key={post.id} post={post} />
            ))}
          </CardGrid>
        )}
      </SectionBand>

      {/* =================== B · MEDIA COVERAGE =================== */}
      {articles.length > 0 && (
        <SectionBand
          eyebrow="Media Coverage · In The News"
          title="What the press is writing about the franchise."
          blurb="Third-party coverage of the Vimtra Chennai Lions and IGPL — curated by us, published by others. Click through to read the full article on the source."
          variant="paper"
        >
          <CardGrid>
            {articles.map((item) => (
              <MediaCard key={item.id} item={item} />
            ))}
          </CardGrid>
        </SectionBand>
      )}

      {/* =================== C · SOCIAL UPDATES =================== */}
      {social.length > 0 && (
        <SectionBand
          eyebrow="Social Updates · From the Franchise Channels"
          title="Straight from the feed."
          blurb="Posts from the Chennai Lions and IGPL social channels. Tap through to view on the source platform."
          variant="cream"
        >
          <CardGrid>
            {social.map((item) => (
              <SocialCard key={item.id} item={item} />
            ))}
          </CardGrid>
        </SectionBand>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Layout primitives — kept local to this page so section rhythm stays
// consistent without introducing new global CSS.

function SectionBand({
  eyebrow,
  title,
  blurb,
  variant,
  children,
}: {
  eyebrow: string;
  title: string;
  blurb: string;
  variant: "cream" | "paper";
  children: React.ReactNode;
}) {
  return (
    <section
      className={`px-8 py-[72px] md:py-24 ${
        variant === "paper"
          ? "bg-cream-50 border-y border-black/[0.06]"
          : "bg-cream-100"
      }`}
    >
      <div className="max-w-[1200px] mx-auto">
        <Reveal
          variant="fade-up"
          className="mb-10 flex items-end justify-between gap-8 flex-wrap"
        >
          <div>
            <div className="font-manrope font-bold tracking-[0.22em] text-[11.5px] text-crimson-600 uppercase">
              {eyebrow}
            </div>
            <h2 className="mt-[14px] font-sora font-extrabold text-[clamp(28px,4vw,44px)] leading-[1.05] tracking-[-0.02em] text-ink">
              {title}
            </h2>
          </div>
          <p className="max-w-[440px] m-0 font-manrope text-[14px] leading-[1.62] text-muted">
            {blurb}
          </p>
        </Reveal>
        {children}
      </div>
    </section>
  );
}

function CardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card: Editorial post (Section A)

function EditorialCard({ post }: { post: Post }) {
  return (
    <Reveal
      variant="fade-up"
      className="lift group flex flex-col h-full no-underline text-inherit bg-cream-50 border border-black/[0.08] rounded-[20px] overflow-hidden"
    >
      <Link
        href={`/news/${post.slug}`}
        className="flex flex-col h-full no-underline text-inherit"
      >
        <div
          className="relative bg-ink"
          style={{ aspectRatio: `${CARD_ASPECT.w} / ${CARD_ASPECT.h}` }}
        >
          <Image
            src={post.coverImage ?? FRANCHISE_FALLBACK}
            alt={`${post.title} — Vimtra Chennai Lions GC`}
            fill
            sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 400px"
            className="object-cover"
          />
          {post.category && (
            <div className="absolute top-3 left-3 inline-flex items-center gap-2 rounded-[999px] bg-crimson-600/95 backdrop-blur-[6px] px-3 py-[6px] text-[10.5px] font-sora font-extrabold tracking-[0.16em] text-white uppercase">
              {post.category}
            </div>
          )}
        </div>
        <div className="p-6 flex-1 flex flex-col">
          <div className="font-manrope font-bold text-[10.5px] tracking-[0.28em] text-crimson-600 uppercase">
            Franchise Editorial
            {post.publishedAt ? ` · ${formatPublishedDate(post.publishedAt)}` : ""}
          </div>
          <h3 className="mt-[10px] mb-2 font-sora font-bold text-[20px] leading-[1.2] tracking-[-0.01em] text-ink">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="m-0 font-manrope text-[13.5px] leading-[1.55] text-muted">
              {post.excerpt}
            </p>
          )}
          <div className="mt-auto pt-4 border-t border-black/[0.06] flex items-center justify-between">
            <span className="font-manrope text-[12.5px] text-muted">
              By {post.authorName}
            </span>
            <span className="font-manrope font-semibold text-[12.5px] text-crimson-600 group-hover:underline">
              Read →
            </span>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

function EditorialEmpty() {
  return (
    <Reveal
      variant="fade-up"
      className="rounded-[22px] border border-dashed border-black/[0.18] bg-cream-50 p-10 md:p-14"
    >
      <div className="font-manrope font-bold text-[10.5px] tracking-[0.28em] text-crimson-600 uppercase">
        Nothing Published Yet
      </div>
      <h3 className="mt-3 mb-4 font-sora font-extrabold text-[clamp(24px,3.4vw,32px)] leading-[1.15] tracking-[-0.02em] text-ink">
        The Notebook opens with the first real story.
      </h3>
      <p className="m-0 max-w-[640px] font-manrope text-[15px] leading-[1.68] text-muted">
        Franchise notes, tournament wraps, player features, and academy
        updates will publish here when they&apos;re written and signed off — not
        before.
      </p>
    </Reveal>
  );
}

// ---------------------------------------------------------------------------
// Card: Media coverage — third-party press article (Section B)

function MediaCard({ item }: { item: MediaCoverage }) {
  const dateStr = item.publishedAt ? formatCoverageDate(item.publishedAt) : "";
  return (
    <Reveal
      variant="fade-up"
      className="lift group flex flex-col h-full no-underline text-inherit bg-white border border-black/[0.08] rounded-[20px] overflow-hidden"
    >
      <a
        href={item.sourceUrl}
        target="_blank"
        rel="noreferrer noopener"
        className="flex flex-col h-full no-underline text-inherit"
      >
        <div
          className="relative bg-cream-100 border-b border-black/[0.06]"
          style={{ aspectRatio: `${CARD_ASPECT.w} / ${CARD_ASPECT.h}` }}
        >
          <Image
            src={item.coverImage ?? FRANCHISE_FALLBACK}
            alt={`${item.sourceName} — ${item.title}`}
            fill
            sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 400px"
            className="object-cover"
          />
          <div className="absolute top-3 left-3 inline-flex items-center gap-2 rounded-[999px] bg-ink/90 backdrop-blur-[6px] px-3 py-[6px] text-[10.5px] font-sora font-extrabold tracking-[0.16em] text-[#E9CB8E] uppercase">
            {item.sourceName}
          </div>
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 flex items-center justify-center text-ink group-hover:bg-crimson-600 group-hover:text-white transition-colors">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div className="p-6 flex-1 flex flex-col">
          <div className="font-manrope font-bold text-[10.5px] tracking-[0.28em] text-crimson-600 uppercase">
            Media Coverage{dateStr ? ` · ${dateStr}` : ""}
          </div>
          <h3 className="mt-[10px] mb-2 font-sora font-bold text-[18px] leading-[1.22] tracking-[-0.005em] text-ink">
            {item.title}
          </h3>
          <p className="m-0 font-manrope text-[13.5px] leading-[1.6] text-muted">
            {item.summary}
          </p>
          <div className="mt-auto pt-4 border-t border-black/[0.06] flex items-center justify-between">
            <span className="font-manrope font-semibold text-[12.5px] text-ink group-hover:text-crimson-600 transition-colors">
              Read on {item.sourceName}
            </span>
            <ArrowUpRight className="w-4 h-4 text-muted group-hover:text-crimson-600 transition-colors" />
          </div>
        </div>
      </a>
    </Reveal>
  );
}

// ---------------------------------------------------------------------------
// Card: Social update — Instagram / social-platform post (Section C)

function SocialCard({ item }: { item: MediaCoverage }) {
  const dateStr = item.publishedAt ? formatCoverageDate(item.publishedAt) : "";
  const isInstagram = /instagram/i.test(item.sourceName);
  return (
    <Reveal
      variant="fade-up"
      className="lift group flex flex-col h-full no-underline text-inherit bg-white border border-black/[0.08] rounded-[20px] overflow-hidden"
    >
      <a
        href={item.sourceUrl}
        target="_blank"
        rel="noreferrer noopener"
        className="flex flex-col h-full no-underline text-inherit"
      >
        <div
          className="relative bg-ink"
          style={{ aspectRatio: `${CARD_ASPECT.w} / ${CARD_ASPECT.h}` }}
        >
          <Image
            src={item.coverImage ?? FRANCHISE_FALLBACK}
            alt={`${item.sourceName} — ${item.title}`}
            fill
            sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 400px"
            className="object-cover"
          />
          <div className="absolute top-3 left-3 inline-flex items-center gap-2 rounded-[999px] bg-gradient-to-br from-[#E1306C] to-[#833AB4] px-3 py-[6px] text-[10.5px] font-sora font-extrabold tracking-[0.16em] text-white uppercase">
            {isInstagram && <Instagram className="w-3 h-3" />}
            {item.sourceName}
          </div>
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 flex items-center justify-center text-ink group-hover:bg-crimson-600 group-hover:text-white transition-colors">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div className="p-6 flex-1 flex flex-col">
          <div className="font-manrope font-bold text-[10.5px] tracking-[0.28em] text-crimson-600 uppercase">
            Social Update{dateStr ? ` · ${dateStr}` : ""}
          </div>
          <h3 className="mt-[10px] mb-2 font-sora font-bold text-[18px] leading-[1.22] tracking-[-0.005em] text-ink">
            {item.title}
          </h3>
          <p className="m-0 font-manrope text-[13.5px] leading-[1.6] text-muted">
            {item.summary}
          </p>
          <div className="mt-auto pt-4 border-t border-black/[0.06] flex items-center justify-between">
            <span className="font-manrope font-semibold text-[12.5px] text-ink group-hover:text-crimson-600 transition-colors">
              {isInstagram ? "View on Instagram" : `View on ${item.sourceName}`}
            </span>
            <ArrowUpRight className="w-4 h-4 text-muted group-hover:text-crimson-600 transition-colors" />
          </div>
        </div>
      </a>
    </Reveal>
  );
}
