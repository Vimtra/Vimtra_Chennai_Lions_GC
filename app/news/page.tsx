import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PageMasthead from "@/components/site/PageMasthead";
import { listPublishedPosts, formatPublishedDate } from "@/lib/posts";
import {
  listActiveMediaCoverage,
  formatCoverageDate,
} from "@/lib/media-coverage";
import type { Post, MediaCoverage } from "@prisma/client";
import { webSrc } from "@/lib/image-src";

export const metadata: Metadata = {
  alternates: { canonical: "/news" },
  title: "News",
  description:
    "From the Den — official franchise news (including official AM Green IGPL coverage), third-party press, and social updates about the Vimtra Chennai Lions.",
};

// Always resolve against the current DB row set so admin publishes and
// updates are reflected immediately.
export const dynamic = "force-dynamic";

/* ---------------------------------------------------------------------------
   The news desk.

   Three chapters, kept visibly apart because they have different authors:
   what's official (the franchise's own editorial AND, in the same chapter,
   official reporting FROM the league itself), what third-party press wrote,
   and what the franchise posted socially.

   OFFICIAL NEWS (chapter 01) is a single merged list rather than two
   sections — per the October 2026 revision, an "Official IGPL News" section
   was tried and rejected: one section per real item was reading as one
   section per row. The first AM Green IGPL item (theigpl.com) now renders
   inside THIS list, labelled per-row as official league coverage rather
   than in a section of its own, so the chapter still reads as "official
   news" as a whole while never implying the item was written by the
   Chennai Lions newsroom. `isOfficialIgpl` below is what keeps a
   theigpl.com row out of the third-party "Media coverage" wall — nothing
   is reclassified by title-matching or guesswork, only by source host.

   Every row is a real database row. Counts in the masthead rail are
   computed here. Nothing is padded: a chapter with no rows is absent
   entirely (press, social) except Official news, which always has a
   heading — the franchise's own empty state only shows if there is
   truly nothing official to report at all.
--------------------------------------------------------------------------- */

// The single project-owned fallback, for an item an admin creates without a
// cover. Never shown for the currently seeded rows.
const FRANCHISE_FALLBACK = "/assets/car-2-web.jpg";

// The official AM Green IGPL website. A `MediaCoverage` row sourced from
// this exact host is the league reporting on itself — official news, not
// third-party press and not Chennai Lions editorial. Matching on host
// rather than a free-text flag keeps this deterministic and avoids adding a
// schema field for what is, right now, a single confirmed source.
const OFFICIAL_IGPL_HOST = "theigpl.com";

function isOfficialIgpl(sourceUrl: string): boolean {
  try {
    return new URL(sourceUrl).hostname.replace(/^www\./, "") === OFFICIAL_IGPL_HOST;
  } catch {
    return false;
  }
}

// One merged, date-ordered feed for chapter 01 — the franchise's own posts
// plus official AM Green IGPL items — so "Official news" is one list a
// reader scans once, not two headings for the same chapter.
type OfficialEntry =
  | { kind: "post"; date: Date | null; post: Post }
  | { kind: "igpl"; date: Date | null; item: MediaCoverage };

function toTime(d: Date | string | null): number {
  if (!d) return 0;
  const t = new Date(d).getTime();
  return Number.isNaN(t) ? 0 : t;
}

export default async function NewsPage() {
  const [posts, allArticles, social] = await Promise.all([
    listPublishedPosts(),
    listActiveMediaCoverage("ARTICLE"),
    listActiveMediaCoverage("SOCIAL"),
  ]);

  // Split once, render each list in exactly one place — an official-IGPL
  // row never also appears in the third-party "Media coverage" wall below.
  const igplOfficial = allArticles.filter((a) => isOfficialIgpl(a.sourceUrl));
  const pressArticles = allArticles.filter((a) => !isOfficialIgpl(a.sourceUrl));

  const officialEntries: OfficialEntry[] = [
    ...posts.map(
      (post): OfficialEntry => ({ kind: "post", date: post.publishedAt, post })
    ),
    ...igplOfficial.map(
      (item): OfficialEntry => ({ kind: "igpl", date: item.publishedAt, item })
    ),
  ].sort((a, b) => toTime(b.date) - toTime(a.date));

  return (
    <>
      <PageMasthead
        eyebrow="From the Den · Vimtra Chennai Lions GC"
        title={["NEWS"]}
        line="What we publish, what the press publishes, and what we post — kept apart."
        stats={[
          { k: "Official", v: String(officialEntries.length) },
          { k: "Press", v: String(pressArticles.length) },
          { k: "Social", v: String(social.length) },
        ]}
      />

      {/* ---- 01 · Official news ----
          A single list: the franchise's own editorial (when published) and
          official AM Green IGPL reporting, together — because both are
          official, and splitting them into two sections read as one
          section per item. Each row is labelled by its own source, so
          nothing here is ever mistaken for something the Chennai Lions
          newsroom wrote itself.

          Single-column: the old `.nw-note` explanatory line that used to
          sit to the right of the heading at desktop width is gone. It said
          "Written and published by the Chennai Lions editorial team",
          which stopped being true for every row the moment an item this
          chapter doesn't write itself lives in the same list — rather than
          leave a claim that's now only sometimes accurate, it's removed
          outright and the per-row label carries that distinction instead. */}
      <section className="hp-sec hp-sec-ivory nw-sec" aria-labelledby="nw-a">
        <div className="hp-wrap">
          <div className="nw-head">
            <div>
              <p className="hp-index">
                01 <span>Official news</span>
              </p>
              <h2 id="nw-a" className="nw-h">
                From the newsroom.
              </h2>
            </div>
          </div>

          {officialEntries.length === 0 ? (
            <div className="nw-empty">
              <p className="nw-empty-k">Nothing published yet</p>
              <p className="nw-empty-t">
                The newsroom opens with the season.
              </p>
              <p className="nw-empty-d">
                Franchise editorial and official league coverage publish here
                once confirmed. Until then the press coverage below is the
                record — reported by others, linked to the source.
              </p>
            </div>
          ) : (
            <ol className="nw-posts">
              {officialEntries.map((entry, i) => {
                const n = String(i + 1).padStart(2, "0");

                if (entry.kind === "post") {
                  const post = entry.post;
                  return (
                    <li key={`post-${post.id}`}>
                      <Link href={`/news/${post.slug}`}>
                        <span className="nw-n" aria-hidden>
                          {n}
                        </span>
                        {post.coverImage && (
                          <span className="nw-fig">
                            <Image
                              src={webSrc(post.coverImage) ?? FRANCHISE_FALLBACK}
                              alt=""
                              fill
                              sizes="(max-width: 767px) 100vw, 22vw"
                            />
                          </span>
                        )}
                        <span className="nw-post-b">
                          <span className="nw-post-t">{post.title}</span>
                          {post.publishedAt && (
                            <span className="nw-date">
                              {formatPublishedDate(post.publishedAt)}
                            </span>
                          )}
                        </span>
                        <span className="hp-arrow" aria-hidden>
                          →
                        </span>
                      </Link>
                    </li>
                  );
                }

                // entry.kind === "igpl" — official AM Green IGPL reporting.
                // Verbatim title, verbatim date, linked straight to the
                // official source. Labelled "Official · AM Green IGPL ·
                // <date>" rather than a plain date, so this specific row
                // reads as league reporting even inside the shared list —
                // never as something the franchise itself wrote.
                const item = entry.item;
                const date = item.publishedAt
                  ? formatCoverageDate(item.publishedAt)
                  : null;
                return (
                  <li key={`igpl-${item.id}`}>
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      <span className="nw-n" aria-hidden>
                        {n}
                      </span>
                      <span className="nw-post-b">
                        <span className="nw-post-t">{item.title}</span>
                        <span className="nw-date nw-date-official">
                          Official · {item.sourceName}
                          {date && <i className="nw-sep">·</i>}
                          {date}
                        </span>
                      </span>
                      <span className="hp-arrow" aria-hidden>
                        →
                      </span>
                    </a>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </section>

      {/* ---- 02 · Third-party press ---- */}
      {pressArticles.length > 0 && (
        <section className="hp-sec hp-sec-paper nw-sec" aria-labelledby="nw-b">
          <div className="hp-wrap">
            <div className="nw-head">
              <div>
                <p className="hp-index">
                  02 <span>Media coverage</span>
                </p>
                <h2 id="nw-b" className="nw-h">
                  What the press is writing.
                </h2>
              </div>
              <p className="nw-note">
                Curated by us, published by others. Each headline opens at its
                source.
              </p>
            </div>
            <PressWall items={pressArticles} />
          </div>
        </section>
      )}

      {/* ---- 03 · Franchise social ---- */}
      {social.length > 0 && (
        <section className="hp-sec hp-sec-ivory nw-sec" aria-labelledby="nw-c">
          <div className="hp-wrap">
            <div className="nw-head">
              <div>
                <p className="hp-index">
                  03 <span>Social</span>
                </p>
                <h2 id="nw-c" className="nw-h">
                  Straight from the feed.
                </h2>
              </div>
              <p className="nw-note">
                Posts from the franchise channels. Tap through to the platform.
              </p>
            </div>
            <ul className="hm-press-rows nw-social">
              {social.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <span className="hm-press-src">{item.sourceName}</span>
                    <span className="hm-press-rt">{item.title}</span>
                    <span className="hp-arrow" aria-hidden>
                      →
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="hp-sec hp-sec-paper hp-sec-tight">
        <div className="hp-wrap cm-track ss-links">
          <Link href="/the-pride" className="ss-link">
            <span className="ss-link-k">The franchise</span>
            <span className="ss-link-t">The Pride</span>
          </Link>
          <Link href="/fixtures" className="ss-link">
            <span className="ss-link-k">Season 2026</span>
            <span className="ss-link-t">Fixtures</span>
          </Link>
          <Link href="/scores" className="ss-link">
            <span className="ss-link-k">Live board</span>
            <span className="ss-link-t">Scores</span>
          </Link>
        </div>
      </section>
    </>
  );
}

/**
 * Press wall — one lead carrying its cover, the rest as ruled rows.
 *
 * Shares `.hm-press-*` with the home page's Media chapter. Several of these
 * articles are about the same subject and point at the same portrait, so a
 * grid of identical thumbnails read as a template error rather than as
 * coverage; only the lead takes an image.
 */
function PressWall({ items }: { items: MediaCoverage[] }) {
  const [lead, ...rest] = items;
  if (!lead) return null;
  const cover = webSrc(lead.coverImage);
  const leadDate = lead.publishedAt ? formatCoverageDate(lead.publishedAt) : null;

  return (
    <div className="hm-press">
      <a
        className="hm-press-lead"
        href={lead.sourceUrl}
        target="_blank"
        rel="noreferrer noopener"
      >
        <span className="hm-press-fig">
          <Image
            src={cover ?? FRANCHISE_FALLBACK}
            alt=""
            fill
            sizes="(max-width: 767px) 100vw, 42vw"
          />
        </span>
        <span className="hm-press-lead-b">
          <span className="hm-press-src">
            {lead.sourceName}
            {leadDate && <i className="nw-sep">·</i>}
            {leadDate}
          </span>
          <span className="hm-press-t">{lead.title}</span>
          <span className="hm-press-sum">{lead.summary}</span>
          <span className="hm-press-go" aria-hidden>
            Read at {lead.sourceName} →
          </span>
        </span>
      </a>

      {rest.length > 0 && (
        <ul className="hm-press-rows">
          {rest.map((item) => {
            const date = item.publishedAt
              ? formatCoverageDate(item.publishedAt)
              : null;
            return (
              <li key={item.id}>
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <span className="hm-press-src">
                    {item.sourceName}
                    {date && <i className="nw-sep">·</i>}
                    {date}
                  </span>
                  <span className="hm-press-rt">{item.title}</span>
                  <span className="hp-arrow" aria-hidden>
                    →
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export type { Post };
