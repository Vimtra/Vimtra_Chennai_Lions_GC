import type { Metadata } from "next";
import Link from "next/link";
import StoryHero from "@/components/site/StoryHero";
import NewsHero from "@/components/news/NewsHero";
import Newsroom from "@/components/news/Newsroom";
import { listPublishedPosts } from "@/lib/posts";
import { listActiveMediaCoverage } from "@/lib/media-coverage";
import { buildNewsDesk } from "@/lib/news-desk";
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
   The news desk — a newsroom front page.

   Redesigned from three stacked chapters (official list → press wall →
   social rows) into one continuous editorial flow: a cover story, an
   editorial index, then the rest of the desk ranked by weight. What did NOT
   change is the thing that matters most here — who wrote what. Every row
   still declares its own authorship, official league reporting is still
   never mixed into the third-party wall by accident, and the classification
   is still decided by table, kind and source host rather than by anything
   the redesign found convenient.

   All of that now lives in lib/news-desk.ts, which this page calls once and
   hands to the client index. Read the comments there for the ordering,
   syndication and cover-image rules.

   Every item is a real database row. Nothing is padded: with no rows at all
   the page keeps its own opener and says the desk is quiet, rather than
   showing an example story.
--------------------------------------------------------------------------- */

export default async function NewsPage() {
  const [posts, articles, social] = await Promise.all([
    listPublishedPosts(),
    listActiveMediaCoverage("ARTICLE"),
    listActiveMediaCoverage("SOCIAL"),
  ]);

  const desk = buildNewsDesk({
    posts,
    articles,
    social,
    // Stored paths resolve to their optimized `-web` derivative at render
    // time — the project's existing image strategy, not a new one.
    resolveImage: (src) => webSrc(src) ?? null,
  });

  const closing = (
    <section className="hp-sec hp-sec-ink hp-sec-tight nwr-close">
      <div className="hp-wrap">
        <p className="hp-index hp-index-dark">
          — <span>The record continues</span>
        </p>
        <h2 className="nwr-close-t">The story continues.</h2>
        <div className="cm-track ss-links nwr-close-links">
          <Link href="/fixtures" className="ss-link">
            <span className="ss-link-k">Season 2026</span>
            <span className="ss-link-t">The season</span>
          </Link>
          <Link href="/players" className="ss-link">
            <span className="ss-link-k">The roster</span>
            <span className="ss-link-t">Players</span>
          </Link>
          <Link href="/the-club" className="ss-link">
            <span className="ss-link-k">The franchise</span>
            <span className="ss-link-t">The Club</span>
          </Link>
          <Link href="/contact" className="ss-link">
            <span className="ss-link-k">Press desk</span>
            <span className="ss-link-t">Contact</span>
          </Link>
        </div>
      </div>
    </section>
  );

  // No rows at all. The page keeps the site's own hero language (ink and
  // aurora, no photograph standing in for a story that does not exist) and
  // states the position plainly.
  if (!desk.featured) {
    return (
      <>
        <StoryHero
          eyebrow="From the Den · Vimtra Chennai Lions GC"
          title={["News"]}
          line="Franchise editorial, official league reporting and press coverage — filed as it is published."
        />
        <section className="hp-sec hp-sec-ivory nw-sec">
          <div className="hp-wrap">
            <div className="nwr-empty nwr-empty-page">
              <p className="nwr-empty-k">The desk is quiet</p>
              <p className="nwr-empty-t">Nothing published yet.</p>
              <p className="nwr-empty-d">
                Franchise editorial, official AM Green IGPL reporting and press
                coverage all publish here once confirmed. Nothing is listed
                until it is.
              </p>
            </div>
          </div>
        </section>
        {closing}
      </>
    );
  }

  return (
    <>
      <NewsHero story={desk.featured} counts={desk.counts} />

      <section
        className="hp-sec hp-sec-ivory nw-sec nwr-sec"
        aria-labelledby="nwr-latest"
      >
        <div className="hp-wrap">
          <div className="nw-head">
            <div>
              <p className="hp-index">
                01 <span>Latest coverage</span>
              </p>
              <h2 id="nwr-latest" className="nw-h">
                The rest of the record.
              </h2>
            </div>
            <p className="nw-note">
              Every entry names its own author — what we publish, what the
              league publishes, and what the press publishes are never merged
              into one voice.
            </p>
          </div>

          <Newsroom entries={desk.entries} />
        </div>
      </section>

      {closing}
    </>
  );
}
