import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import type { NewsEntry } from "@/lib/news-desk";

/**
 * /news · Media coverage — the press index.
 *
 * One uniform tier. Every entry is the same medium item: a 16:9 frame,
 * the authorship line, the headline, the stored summary, and a source
 * link — identical in size for every row, by request. Order is carried by
 * the gold ordinal, not by one entry out-weighing another.
 *
 * The filter index that used to sit above this list is gone: with official
 * rows now rendered in their own section, this list only ever holds one
 * channel, so a filter had nothing left to filter. Removing it also removes
 * the component's only state, which is why this is a server component
 * again — `Reveal` handles the entrance on the client.
 *
 * Nothing in this component supplies content. Titles, publishers, dates and
 * summaries are printed exactly as stored; a missing date renders as no
 * date at all; and an entry whose cover was already used by an earlier
 * entry shows its publisher monogram instead of a second copy of the same
 * photograph (see lib/news-desk.ts).
 */

function Meta({ entry }: { entry: NewsEntry }) {
  return (
    <span className="nwr-meta">
      <span className="nwr-meta-k">{entry.kicker}</span>
      <i className="nwr-sep" aria-hidden>
        ·
      </i>
      <span className="nwr-meta-s">{entry.source}</span>
      {entry.date && (
        <>
          <i className="nwr-sep" aria-hidden>
            ·
          </i>
          <span className="nwr-meta-d">{entry.date}</span>
        </>
      )}
    </span>
  );
}

function EntryLink({
  entry,
  className,
  children,
}: {
  entry: NewsEntry;
  className: string;
  children: React.ReactNode;
}) {
  if (entry.external) {
    return (
      <a
        className={className}
        href={entry.href}
        target="_blank"
        rel="noreferrer noopener"
      >
        {children}
      </a>
    );
  }
  return (
    <Link className={className} href={entry.href}>
      {children}
    </Link>
  );
}

export default function Newsroom({ entries }: { entries: NewsEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <ul className="nwr-mids">
      {entries.map((entry, i) => (
        <Reveal
          key={entry.id}
          variant="fade-up"
          delay={(i % 3) * 80}
          as="li"
          className="nwr-mid-w"
        >
          <EntryLink entry={entry} className="nwr-mid">
            <span className="nwr-mid-fig">
              {entry.image ? (
                <Image
                  src={entry.image}
                  alt=""
                  fill
                  sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1023px) 46vw, 30vw"
                />
              ) : (
                <span className="nwr-mark" aria-hidden>
                  {entry.monogram}
                </span>
              )}
            </span>
            <span className="nwr-mid-b">
              <span className="nwr-n" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
              <Meta entry={entry} />
              <span className="nwr-mid-t">{entry.title}</span>
              {entry.summary && (
                <span className="nwr-mid-s">{entry.summary}</span>
              )}
              <span className="nwr-go" aria-hidden>
                {entry.external ? `Read at ${entry.source}` : "Read the story"}
                <i>→</i>
              </span>
            </span>
          </EntryLink>
        </Reveal>
      ))}
    </ul>
  );
}
