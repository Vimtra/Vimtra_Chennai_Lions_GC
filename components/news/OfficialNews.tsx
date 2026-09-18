import Image from "next/image";
import { Section, SectionTitle } from "@/components/site/Section";
import type { NewsEntry } from "@/lib/news-desk";

/**
 * /news · 01 OFFICIAL NEWS
 *
 * The league's own reporting, immediately after the hero. Every story here
 * is a verified AM Green IGPL row (or, when one exists, a published
 * franchise `Post`) — the classification is decided upstream in
 * lib/news-desk.ts by source host, and this component only lays out what
 * it is handed. Third-party press never reaches it.
 *
 * Rendered inside the shared `<Section>` so it picks up the site's own
 * scroll choreography — `[data-line]` masked title lines and `[data-rise]`
 * staggered reveals — instead of introducing a second motion language for
 * one section. Under prefers-reduced-motion those primitives are no-ops and
 * everything renders at rest.
 *
 * ONE REGISTER, IDENTICAL FRAMES. Every official story is a ruled row on the
 * 12-column track: a 3:2 frame on the first five columns, the copy on the
 * last six, a hairline between rows. The frames are the SAME size for every
 * story by design — the operator asked for that — so the ordering is
 * carried by the gold ordinal and the hairlines, not by one photograph
 * out-weighing another. 3:2 rather than a tighter ratio because the
 * squad photograph holds six people edge to edge and a narrower crop would
 * cut the outermost of them.
 *
 * A row whose record carries no cover keeps the same grid and simply has
 * no frame; nothing is substituted for it. Headline, source, summary and
 * destination are printed verbatim from the row, and a date only when the
 * row carries one — none of the current rows do, so none appears.
 */

export type OfficialStory = NewsEntry & {
  imageAlt: string;
  imagePosition: string;
};

function Meta({ story }: { story: OfficialStory }) {
  return (
    <span className="onw-meta">
      <span className="onw-meta-k">{story.kicker}</span>
      <i className="nwr-sep" aria-hidden>
        ·
      </i>
      <span className="onw-meta-s">{story.source}</span>
      {story.date && (
        <>
          <i className="nwr-sep" aria-hidden>
            ·
          </i>
          <span className="onw-meta-d">{story.date}</span>
        </>
      )}
    </span>
  );
}

export default function OfficialNews({
  stories,
}: {
  stories: OfficialStory[];
}) {
  return (
    <Section surface="ivory" className="onw-sec" aria-labelledby="onw-title">
      <div className="onw-head">
        <p className="hp-index hp-index-bare" data-rise>
          <span>Official</span>
        </p>
        <SectionTitle id="onw-title" lines={["OFFICIAL", "NEWS."]} />
      </div>

      <ol className="onw-rows">
        {stories.map((story, i) => (
          // THE ROW IS THE UNIT. Every part of a story used to carry its own
          // [data-rise] — figure, numeral, meta, title, summary, arrow — so a
          // two-story list assembled itself in twelve pieces. One marker on
          // the row reveals the story as one thing, which is what it is.
          <li key={story.id} data-rise>
            <a
              className={`cm-track onw-row ${story.image ? "has-fig" : ""}`.trim()}
              href={story.href}
              {...(story.external
                ? { target: "_blank", rel: "noreferrer noopener" }
                : {})}
            >
              {story.image && (
                <span className="onw-fig">
                  <Image
                    src={story.image}
                    alt={story.imageAlt}
                    fill
                    sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1023px) 46vw, 38vw"
                    style={{ objectPosition: story.imagePosition }}
                  />
                </span>
              )}

              <span className="onw-body">
                <span className="onw-n" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  <Meta story={story} />
                </span>
                <span className="onw-t">{story.title}</span>
                {story.summary && (
                  <span className="onw-s">{story.summary}</span>
                )}
                <span className="onw-go" aria-hidden>
                  {story.external ? `Read at ${story.source}` : "Read the story"}
                  <i>→</i>
                </span>
              </span>
            </a>
          </li>
        ))}
      </ol>
    </Section>
  );
}
