import type { Metadata } from "next";
import Link from "next/link";
import StoryHero from "@/components/site/StoryHero";
import Newsroom from "@/components/news/Newsroom";
import OfficialNews, { type OfficialStory } from "@/components/news/OfficialNews";
import DayInTheDen from "@/components/news/DayInTheDen";
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
   The news desk.

   Opens on the site's shared `StoryHero` — the same opener /the-club,
   /the-pride, /players, /golf-development and /vimtra-ventures use — so the
   page introduces itself as NEWS and nothing else. The hero carries no
   story: the previous cover-story hero has been retired because a page
   identity and a news item are different things, and the hero is the
   former.

   Then, in order: OFFICIAL NEWS (the league's own reporting, each row a
   verified AM Green IGPL item), the 14 August activity chapter, MEDIA
   COVERAGE (third-party press, the client index), and the sign-off.

   Who wrote what is decided by the stored `kind` each row carries — set
   explicitly in the admin, OFFICIAL under News and ARTICLE / SOCIAL under
   Media — and read in lib/news-desk.ts. Official rows and press rows are
   split here from that one classified feed and rendered in exactly one
   place each, so no story appears twice and nothing is inferred from a URL.

   Every item is a real database row. Nothing is padded: with no rows at all
   the page keeps its opener and says the desk is quiet, rather than showing
   an example story.
--------------------------------------------------------------------------- */

/* ---------------------------------------------------------------------------
   14 AUGUST 2026 — A DAY IN THE DEN.

   An ACTIVITY FEATURE, deliberately not a news row. It is authored here
   rather than inserted into `Post` or `MediaCoverage` because those tables
   are the verified news record that the data-integrity rule protects — the
   official AM Green IGPL squad-launch item lives there and stays exactly
   where it is, classified as it was. Nothing below is a news article, and
   nothing here touches the news desk.

   Every string is the operator's own approved copy, reproduced verbatim:
   the date, the chapter title, both moment labels, both headlines and both
   descriptions. No attendance figure, venue, name, result or outcome
   appears anywhere in this chapter, because none was supplied.

   Both photographs are the operator's own uploads, downscaled through the
   project's existing derivative settings (2000px, q80, mozjpeg) and
   otherwise unaltered. The originals are untouched on disk. `imagePosition`
   holds the face/subject inside every crop the layout asks for.
--------------------------------------------------------------------------- */
const DEN_DATE = "14 August 2026";
const DEN_STAMP = "14.08.26";

const DEN_MOMENTS = [
  {
    n: "01",
    label: "Morning",
    headline: "Tee. Drive. Connect.",
    body:
      "A morning of golf, competition and camaraderie — celebrating the spirit of sport and the people behind it.",
    // IMGL8570.JPG — a drive off the tee in front of the Lions backdrop.
    image: "/assets/photo/den-morning-drive.jpg",
    imageAlt:
      "A golfer follows through on a drive from the tee as guests watch, in front of a Vimtra Chennai Lions backdrop",
    // Holds the golfer and the backdrop; the swing sits left of centre.
    imagePosition: "44% 52%",
  },
  {
    n: "02",
    label: "Evening",
    headline: "Connecting People. Creating Opportunities.",
    body:
      "An evening of meaningful connections at the Vimtra meet & greet, bringing the community together through conversation and collaboration.",
    // IGPL Event/IMGL9398.JPG — the meet & greet reception.
    image: "/assets/photo/den-evening-meet.jpg",
    imageAlt:
      "Guests and players gathered for the Vimtra meet and greet in front of a Vimtra Ventures screen",
    // Faces sit in the upper-middle band of this frame.
    imagePosition: "50% 42%",
  },
];

export default async function NewsPage() {
  // Everything PUBLISHED, every kind. The desk classifies by the stored
  // `kind` the admin set — OFFICIAL / ARTICLE / SOCIAL — never by URL.
  const [posts, coverage] = await Promise.all([
    listPublishedPosts(),
    listActiveMediaCoverage(),
  ]);

  const desk = buildNewsDesk({
    posts,
    coverage,
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

  // One classified feed, split by authorship and rendered in exactly one
  // place each. `buildNewsDesk` already ordered, classified and de-duplicated
  // every row; the only thing done here is deciding which section shows it.
  const all = desk.featured ? [desk.featured, ...desk.entries] : [];
  // The cover on each row — uploaded through Admin → News — is the source
  // of truth. Nothing is mapped or substituted here: a row with no cover
  // renders text-led with its source mark, by the component's own fallback.
  // `MediaCoverage` carries no alt text; the cover sits inside a link whose
  // text is the headline, so an empty alt is the correct, non-duplicating
  // description for assistive tech.
  const official: OfficialStory[] = all
    .filter((e) => e.channel === "official")
    .map((e) => ({ ...e, imageAlt: "", imagePosition: "50% 35%" }));
  const press = all.filter((e) => e.channel !== "official");

  // The page identity — the same opener every other chapter page uses.
  // `News Hero.JPG` is the operator's own photograph: a Lions player set up
  // on the tee, the fairway open ahead. The subject sits right of centre,
  // which leaves the lower-left — where the hero's type lives — over grass
  // rather than over the player at every crop.
  const hero = (
    <StoryHero
      eyebrow="From the Den · Vimtra Chennai Lions GC"
      title={["NEWS"]}
      line="Official league reporting and press coverage of the Vimtra Chennai Lions — filed as it is published."
      image="/assets/photo/news-hero-tee.jpg"
      imageAlt="A Vimtra Chennai Lions player addressing the ball on the tee, with the fairway ahead"
      imagePosition="52% 62%"
    />
  );

  // No rows at all: the page keeps its opener and states the position
  // plainly rather than showing an example story.
  if (all.length === 0) {
    return (
      <>
        {hero}
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
      {hero}

      {/* 01 — Official news: the league's own reporting, immediately after
          the hero. Absent entirely when there is none; never padded. */}
      {official.length > 0 && <OfficialNews stories={official} />}

      {/* The activity chapter. Its own dated head keeps it reading as a
          separate chapter rather than as an entry in either desk. */}
      <DayInTheDen date={DEN_DATE} stamp={DEN_STAMP} moments={DEN_MOMENTS} />

      {/* 02 — Media coverage: third-party press only. Official rows never
          reach this list, so no story is shown twice on the page. */}
      {press.length > 0 && (
        <section
          className="hp-sec hp-sec-ivory nw-sec nwr-sec"
          aria-labelledby="nwr-coverage"
        >
          <div className="hp-wrap">
            <div className="nw-head">
              <div>
                <p className="hp-index">
                  02 <span>Media coverage</span>
                </p>
                <h2 id="nwr-coverage" className="nw-h">
                  What the press is writing.
                </h2>
              </div>
              <p className="nw-note">
                Curated by us, published by others. Every entry names its
                publisher and opens at the source.
              </p>
            </div>

            <Newsroom entries={press} />
          </div>
        </section>
      )}

      {closing}
    </>
  );
}
