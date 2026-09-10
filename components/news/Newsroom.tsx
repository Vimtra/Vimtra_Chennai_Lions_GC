"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import Reveal from "@/components/Reveal";
import type { NewsChannel, NewsEntry } from "@/lib/news-desk";

/**
 * The newsroom index and story flow — everything on /news below the cover.
 *
 * Two things live here rather than on the server page because both are
 * interactive: the editorial index (a filter), and the tiering that gives
 * the remaining stories different visual weights. Tiering is derived from
 * the CURRENT filtered list, so "Media coverage" opens on its own lead
 * story instead of a page of identical rows.
 *
 * Tiers, in order:
 *   lead     — one large image-led story
 *   mid      — up to two medium stories, side by side from 768px
 *   row      — everything else, as ruled editorial rows
 *
 * A syndicated entry (the same story as one already shown, published by a
 * different outlet) can never take the lead or mid tier. It keeps its row
 * and its own publisher credit — it is real, separate coverage — but the
 * page never runs one headline twice at large size. That rule is applied
 * here, at render, on top of the flag lib/news-desk.ts computed.
 *
 * Nothing in this component supplies content. Titles, publishers, dates and
 * summaries are printed exactly as stored, a missing date renders as no
 * date at all, and a story whose cover was already used by another row
 * shows its publisher monogram instead of borrowing a second picture.
 */

type FilterKey = "all" | NewsChannel;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "official", label: "Official news" },
  { key: "press", label: "Media coverage" },
  { key: "social", label: "Social" },
];

/** Source · date, printing only the parts the row actually has. */
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

/**
 * The figure. A stored cover when this entry owns one, otherwise the
 * publisher's monogram on ink — the fallback the press wall already used,
 * so a repeated photograph never appears four times down one page.
 */
function Figure({
  entry,
  sizes,
  className,
}: {
  entry: NewsEntry;
  sizes: string;
  className: string;
}) {
  return (
    <span className={className}>
      {entry.image ? (
        <Image src={entry.image} alt="" fill sizes={sizes} />
      ) : (
        <span className="nwr-mark" aria-hidden>
          {entry.monogram}
        </span>
      )}
    </span>
  );
}

/** One entry's outermost element — internal post or external source link. */
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

function LeadStory({ entry, index }: { entry: NewsEntry; index: string }) {
  return (
    <Reveal variant="fade-up" className="nwr-lead-w">
      <EntryLink entry={entry} className="nwr-lead">
        <Figure
          entry={entry}
          className="nwr-lead-fig"
          sizes="(max-width: 767px) 100vw, (max-width: 1023px) 92vw, 56vw"
        />
        <span className="nwr-lead-b">
          <span className="nwr-n" aria-hidden>
            {index}
          </span>
          <Meta entry={entry} />
          <span className="nwr-lead-t">{entry.title}</span>
          {entry.summary && (
            <span className="nwr-lead-s">{entry.summary}</span>
          )}
          <span className="nwr-go" aria-hidden>
            {entry.external ? `Read at ${entry.source}` : "Read the story"}
            <i>→</i>
          </span>
        </span>
      </EntryLink>
    </Reveal>
  );
}

function MidStory({
  entry,
  index,
  delay,
}: {
  entry: NewsEntry;
  index: string;
  delay: number;
}) {
  return (
    <Reveal variant="fade-up" delay={delay} as="li" className="nwr-mid-w">
      <EntryLink entry={entry} className="nwr-mid">
        <Figure
          entry={entry}
          className="nwr-mid-fig"
          sizes="(max-width: 767px) 100vw, (max-width: 1279px) 46vw, 34vw"
        />
        <span className="nwr-mid-b">
          <span className="nwr-n" aria-hidden>
            {index}
          </span>
          <Meta entry={entry} />
          <span className="nwr-mid-t">{entry.title}</span>
          {entry.summary && <span className="nwr-mid-s">{entry.summary}</span>}
        </span>
      </EntryLink>
    </Reveal>
  );
}

function RowStory({ entry, index }: { entry: NewsEntry; index: string }) {
  return (
    <li>
      <EntryLink entry={entry} className="nwr-row">
        <span className="nwr-n" aria-hidden>
          {index}
        </span>
        {/* Matches the figure's real widths in globals.css (104 / 132 /
            150), so the browser never fetches a derivative wider than the
            row can show — including below 560px, where the figure is not
            rendered at all. */}
        <Figure
          entry={entry}
          className="nwr-row-fig"
          sizes="(max-width: 1023px) 104px, (max-width: 1279px) 132px, 150px"
        />
        <span className="nwr-row-b">
          <Meta entry={entry} />
          <span className="nwr-row-t">{entry.title}</span>
        </span>
        <span className="hp-arrow nwr-row-go" aria-hidden>
          →
        </span>
      </EntryLink>
    </li>
  );
}

export default function Newsroom({ entries }: { entries: NewsEntry[] }) {
  const [filter, setFilter] = useState<FilterKey>("all");

  // Only offer a filter that has something behind it. With no social rows
  // the site does not advertise a social desk it cannot fill.
  const available = useMemo(
    () =>
      FILTERS.filter(
        (f) => f.key === "all" || entries.some((e) => e.channel === f.key)
      ),
    [entries]
  );

  const visible = useMemo(
    () =>
      filter === "all" ? entries : entries.filter((e) => e.channel === filter),
    [entries, filter]
  );

  // Tiering. A syndicated entry is pushed past the two promoted tiers so
  // one story is never given large weight twice on the same page.
  const { lead, mid, rows } = useMemo(() => {
    const promotable = visible.filter((e) => !e.syndicated);
    const promoted = promotable.slice(0, 3);
    const promotedIds = new Set(promoted.map((e) => e.id));
    return {
      lead: promoted[0] ?? null,
      mid: promoted.slice(1),
      rows: visible.filter((e) => !promotedIds.has(e.id)),
    };
  }, [visible]);

  // A continuous index down the page: the lead is 01, whatever follows
  // carries on from there, so the flow reads as one ordered front page.
  const numberOf = (entry: NewsEntry) =>
    String(visible.indexOf(entry) + 1).padStart(2, "0");

  return (
    <>
      <nav className="nwr-index" aria-label="Filter the newsroom">
        <ul className="nwr-index-l">
          {available.map((f) => (
            <li key={f.key}>
              <button
                type="button"
                className={`nwr-index-b ${filter === f.key ? "is-on" : ""}`.trim()}
                aria-pressed={filter === f.key}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* The count, not the list. Putting `aria-live` on the flow itself
          made a screen reader re-read every headline on each filter press;
          this announces what changed and leaves the reader to move into
          the stories in their own time. */}
      <p className="nwr-sr" role="status">
        {visible.length === 1 ? "1 story" : `${visible.length} stories`}
      </p>

      <div className="nwr-flow">
        {visible.length === 0 ? (
          <div className="nwr-empty">
            <p className="nwr-empty-k">Nothing filed here yet</p>
            <p className="nwr-empty-d">
              This desk has no entries. Everything the newsroom has on record
              is under All.
            </p>
          </div>
        ) : (
          <>
            {lead && <LeadStory entry={lead} index={numberOf(lead)} />}

            {mid.length > 0 && (
              <ul className="nwr-mids">
                {mid.map((e, i) => (
                  <MidStory
                    key={e.id}
                    entry={e}
                    index={numberOf(e)}
                    delay={i * 80}
                  />
                ))}
              </ul>
            )}

            {rows.length > 0 && (
              <ol className="nwr-rows">
                {rows.map((e) => (
                  <RowStory key={e.id} entry={e} index={numberOf(e)} />
                ))}
              </ol>
            )}
          </>
        )}
      </div>
    </>
  );
}
