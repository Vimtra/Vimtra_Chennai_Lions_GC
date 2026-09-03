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
  title: "News · Vimtra Chennai Lions GC",
  description:
    "From the Den — official franchise news, third-party press coverage, and social updates about the Vimtra Chennai Lions.",
};

// Always resolve against the current DB row set so admin publishes and
// updates are reflected immediately.
export const dynamic = "force-dynamic";

/* ---------------------------------------------------------------------------
   The news desk.

   Three kinds of item, kept visibly apart because they have different
   authors: what the franchise wrote, what the press wrote, and what the
   franchise posted. That separation is the point of the page — a reader
   should never have to guess who is speaking — so it survives the redesign
   as three chapters rather than one merged feed.

   What changed is the presentation. The page was three bands of identical
   16:10 cards; it is now the same press-wall language the home page's Media
   chapter uses — one lead with its cover, the rest as ruled rows — so the
   two surfaces read as one system and the hand-off from the home page lands
   somewhere familiar.

   Every row is a real database row. Counts in the masthead rail are
   computed here. Nothing is padded: a section with no rows either shows its
   honest empty state (official news, which the franchise controls) or is
   absent entirely (press and social, which it does not).
--------------------------------------------------------------------------- */

// The single project-owned fallback, for an item an admin creates without a
// cover. Never shown for the currently seeded rows.
const FRANCHISE_FALLBACK = "/assets/car-2-web.jpg";

export default async function NewsPage() {
  const [posts, articles, social] = await Promise.all([
    listPublishedPosts(),
    listActiveMediaCoverage("ARTICLE"),
    listActiveMediaCoverage("SOCIAL"),
  ]);

  return (
    <>
      <PageMasthead
        eyebrow="From the Den · Vimtra Chennai Lions GC"
        title={["NEWS"]}
        line="What we publish, what the press publishes, and what we post — kept apart."
        stats={[
          { k: "Official", v: String(posts.length) },
          { k: "Press", v: String(articles.length) },
          { k: "Social", v: String(social.length) },
        ]}
      />

      {/* ---- 01 · Official franchise editorial ---- */}
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
            <p className="nw-note">
              Written and published by the Chennai Lions editorial team.
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="nw-empty">
              <p className="nw-empty-k">Nothing published yet</p>
              <p className="nw-empty-t">
                The newsroom opens with the season.
              </p>
              <p className="nw-empty-d">
                Franchise editorial publishes here once it is written and
                signed off. Until then the press coverage below is the record
                — reported by others, linked to the source.
              </p>
            </div>
          ) : (
            <ol className="nw-posts">
              {posts.map((post, i) => (
                <li key={post.id}>
                  <Link href={`/news/${post.slug}`}>
                    <span className="nw-n" aria-hidden>
                      {String(i + 1).padStart(2, "0")}
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
              ))}
            </ol>
          )}
        </div>
      </section>

      {/* ---- 02 · Third-party press ---- */}
      {articles.length > 0 && (
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
            <PressWall items={articles} />
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
