import Image from "next/image";
import type { NewsEntry } from "@/lib/news-desk";
import {
  StoryGo,
  StoryLink,
  StoryMeta,
  distinctSummary,
} from "./Newsroom";
import s from "./News.module.css";

/**
 * /news · THE OPENING
 *
 * The page title and the lead story as one composition on ink. The title
 * row names the page at a size well below the photograph's height; the
 * lead story is the anchor.
 *
 * The lead is the desk's first entry (`buildNewsDesk().featured`) — the
 * same story, in the same position, the desk has always led with. Its
 * cover is framed at 16:9, the native ratio of the stored image, so the
 * full picture shows and nothing at its edges is cropped away. Meta,
 * headline, summary and destination are printed verbatim from the row.
 *
 * Desktop: picture 7 / text 5. Below 1024px the order is title, picture,
 * story. With no rows at all, only the title row renders and the page
 * states its empty position below.
 */
export default function NewsOpening({
  eyebrow,
  line,
  lead,
}: {
  eyebrow: string;
  line: string;
  lead: NewsEntry | null;
}) {
  const summary = lead ? distinctSummary(lead) : null;

  return (
    <section className={`${s.opening} ${s.onInk}`} aria-labelledby="nws-title">
      <div className="hp-wrap">
        <div className={s.intro}>
          <div>
            <p className={s.eyebrow}>{eyebrow}</p>
            <h1 id="nws-title" className={s.word}>
              News
            </h1>
          </div>
          <p className={s.introLine}>{line}</p>
        </div>

        {lead && (
          <StoryLink
            entry={lead}
            className={`${s.link} ${s.lead} ${lead.image ? "" : s.noFig}`}
          >
            {lead.image && (
              <span className={`${s.frame} ${s.leadFrame}`}>
                <Image
                  src={lead.image}
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 1023px) calc(100vw - 40px), 58vw"
                />
              </span>
            )}
            <span className={s.leadText}>
              <StoryMeta entry={lead} />
              <h2 className={s.title}>{lead.title}</h2>
              {summary && <span className={s.summary}>{summary}</span>}
              <StoryGo entry={lead} />
            </span>
          </StoryLink>
        )}
      </div>
    </section>
  );
}
