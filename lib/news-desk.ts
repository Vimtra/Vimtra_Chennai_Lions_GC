/**
 * Newsroom desk model — /news
 *
 * One pure module that turns the two database tables the news desk renders
 * (`Post` — franchise editorial, `MediaCoverage` — everything published
 * elsewhere) into a single ordered, classified, de-duplicated feed that the
 * page and its client components both read.
 *
 * It is deliberately pure and free of `server-only`: the page computes the
 * feed on the server from the live rows, and the client index component
 * filters those very same objects. Nothing here fetches, derives, estimates
 * or fills anything in — every string on a `NewsEntry` is copied verbatim
 * from a row, and a field the row does not carry (a date that was never
 * verified, a cover that was never uploaded) arrives as "" / null and the
 * UI renders the compact form rather than a placeholder.
 */

import type { MediaCoverage, Post } from "@prisma/client";
import { formatPublishedDate } from "./posts-format";
import { formatCoverageDate } from "./media-coverage-format";

/**
 * The official AM Green IGPL website. A `MediaCoverage` row sourced from
 * this exact host is the league reporting on itself — official news, not
 * third-party press and not Chennai Lions editorial. Matching on host
 * rather than a free-text flag keeps this deterministic and avoids adding a
 * schema field for what is, right now, a single confirmed source.
 *
 * Carried over unchanged from the previous /news implementation: the
 * classification rule is data integrity, not styling, so a visual redesign
 * does not get to reinterpret it.
 */
const OFFICIAL_IGPL_HOST = "theigpl.com";

export function isOfficialIgpl(sourceUrl: string): boolean {
  try {
    return (
      new URL(sourceUrl).hostname.replace(/^www\./, "") === OFFICIAL_IGPL_HOST
    );
  } catch {
    return false;
  }
}

/**
 * The three authorships the desk keeps apart. They are not cosmetic tags:
 * `official` means the franchise or the league published it, `press` means
 * somebody else did, `social` means it is a platform post. Nothing is ever
 * reclassified by title-matching or guesswork — only by table, kind and
 * source host.
 */
export type NewsChannel = "official" | "press" | "social";

export interface NewsEntry {
  id: string;
  channel: NewsChannel;
  /** Publisher / desk name exactly as stored. */
  source: string;
  /** Short caps classification word shown before the source. */
  kicker: string;
  title: string;
  /** Verbatim stored summary / excerpt; null when the row carries none. */
  summary: string | null;
  /** Formatted stored date; "" when the row has no verified date. */
  date: string;
  href: string;
  /** True for a link that leaves the site (everything but our own posts). */
  external: boolean;
  /**
   * Cover to render, or null. Null means either the row has no cover, or an
   * earlier entry already used that exact image — see `buildNewsDesk`.
   */
  image: string | null;
  /** Fallback tile glyph, used when `image` is null. */
  monogram: string;
  /**
   * True when an earlier entry in the feed is the same story published by a
   * different outlet. Such an entry keeps its own row and its own publisher
   * credit — it is genuine separate coverage — but it is never given large
   * visual weight a second time.
   */
  syndicated: boolean;
}

export interface NewsDesk {
  /** The cover story. Null only when the desk has no rows at all. */
  featured: NewsEntry | null;
  /** Everything else, in reading order. Never contains `featured`. */
  entries: NewsEntry[];
  /** Real counts across the whole desk, featured included. */
  counts: { official: number; press: number; social: number };
}

/**
 * The glyph on the fallback tile — the publisher's own initials, nothing
 * invented. Multi-word names give one letter per word ("Times of India" →
 * TOI, "The Hindu" → TH); a single-word name gives its first two letters
 * ("Sportstar" → SP), because one lone letter reads as a typo rather than
 * as a masthead. `sourceInitials` in media-coverage-format.ts is not used
 * here: it drops "the", which turned "The Hindu" into a single "H".
 */
function monogramFor(sourceName: string): string {
  const words = sourceName.trim().split(/\s+/).filter(Boolean);
  const letters =
    words.length > 1
      ? words
          .slice(0, 3)
          .map((w) => w.replace(/[^A-Za-z0-9]/g, "").charAt(0))
          .join("")
      : (words[0] ?? "").replace(/[^A-Za-z0-9]/g, "").slice(0, 2);
  return letters.toUpperCase() || sourceName.slice(0, 2).toUpperCase();
}

/** Titles compared for syndication: case, punctuation and curly quotes out. */
function normalizeTitle(t: string): string {
  return t
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "");
}

type DraftEntry = Omit<NewsEntry, "image" | "syndicated"> & {
  cover: string | null;
};

function fromPost(post: Post): DraftEntry {
  return {
    id: `post-${post.id}`,
    channel: "official",
    // A Post is the franchise's own editorial. `category` is a real stored
    // field; when it is empty the desk names itself rather than inventing a
    // section that was never assigned to the row.
    source: post.category?.trim() || "Chennai Lions newsroom",
    kicker: "Official",
    title: post.title,
    summary: post.excerpt,
    date: formatPublishedDate(post.publishedAt),
    href: `/news/${post.slug}`,
    external: false,
    cover: post.coverImage,
    monogram: "VCL",
  };
}

function fromCoverage(item: MediaCoverage, channel: NewsChannel): DraftEntry {
  return {
    id: `media-${item.id}`,
    channel,
    source: item.sourceName,
    kicker:
      channel === "official"
        ? "Official"
        : channel === "social"
          ? "Social"
          : "Media coverage",
    title: item.title,
    summary: item.summary,
    date: formatCoverageDate(item.publishedAt),
    href: item.sourceUrl,
    external: true,
    cover: item.coverImage,
    monogram: monogramFor(item.sourceName),
  };
}

/**
 * Build the desk.
 *
 * Order is fixed and explained rather than clever:
 *
 *  1. Franchise editorial first, in the order the data layer returned it
 *     (pinned `sortOrder`, then newest). The newsroom leads its own page.
 *  2. Official AM Green IGPL rows next, same ordering rule.
 *  3. Third-party press.
 *  4. Social.
 *
 * The first entry becomes the cover story and is removed from the list, so
 * no story is ever shown twice on the page. Two further passes run over the
 * result in that same reading order:
 *
 * - **Syndication.** A story whose normalized title has already been used is
 *   flagged. It stays in the feed with its own publisher credit — it is real,
 *   separate coverage and dropping it would lose a genuine mention — but the
 *   renderer never promotes it above a compact row, so the same headline can
 *   never appear twice at large size.
 * - **Cover images.** The stored covers repeat across rows; four of the press
 *   mentions share one portrait. The first entry to use an image keeps it,
 *   and later entries pointing at the same file fall back to their source
 *   monogram tile. This is the strategy the previous press wall already used
 *   — preserved rather than replaced — and it is computed once here so a
 *   filtered view never re-shuffles which row owns which picture.
 */
export function buildNewsDesk(input: {
  posts: Post[];
  articles: MediaCoverage[];
  social: MediaCoverage[];
  /**
   * Resolver for stored image paths (`webSrc`). Injected so this module
   * stays a pure data shaper with no import of the asset map.
   */
  resolveImage: (src: string | null) => string | null;
}): NewsDesk {
  const { posts, articles, social, resolveImage } = input;

  const igpl = articles.filter((a) => isOfficialIgpl(a.sourceUrl));
  const press = articles.filter((a) => !isOfficialIgpl(a.sourceUrl));

  const draft: DraftEntry[] = [
    ...posts.map(fromPost),
    ...igpl.map((i) => fromCoverage(i, "official")),
    ...press.map((i) => fromCoverage(i, "press")),
    ...social.map((i) => fromCoverage(i, "social")),
  ];

  const seenTitles = new Set<string>();
  const usedCovers = new Set<string>();

  const all: NewsEntry[] = draft.map(({ cover, ...rest }) => {
    const key = normalizeTitle(rest.title);
    const syndicated = seenTitles.has(key);
    seenTitles.add(key);

    const resolved = resolveImage(cover);
    const free = resolved !== null && !usedCovers.has(resolved);
    if (resolved !== null) usedCovers.add(resolved);

    return { ...rest, image: free ? resolved : null, syndicated };
  });

  return {
    featured: all[0] ?? null,
    entries: all.slice(1),
    counts: {
      official: posts.length + igpl.length,
      press: press.length,
      social: social.length,
    },
  };
}
