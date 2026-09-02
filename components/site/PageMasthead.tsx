"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap, registerGsap, revealLines, rise } from "@/components/motion/gsap";

/**
 * Season-module masthead.
 *
 * A title card, not a hero band. `StoryHero` (the club module's opener)
 * reserves 42–46svh for an eyebrow and a word, which on /scores and
 * /leaderboards produced a large empty ink field before any of the actual
 * subject appeared. This is deliberately compact and ends on a data rail —
 * the same rail the board below repeats — so the page reads as one
 * continuous broadcast surface rather than a banner followed by content.
 *
 * The rail carries only counted facts (events on the card, rows published).
 * It is passed in already computed from the database by the page; nothing
 * here is derived, estimated or filled in.
 *
 * The photograph is atmosphere for the page, never a venue claim: it sits
 * behind the page's own title, is never adjacent to an event name, and
 * carries `alt=""`. Venue identity belongs to the tournament card below,
 * which is text from the Fixture row. See public/assets/photo/CREDITS.md.
 */
export interface MastheadStat {
  k: string;
  v: string;
}

export default function SeasonMasthead({
  eyebrow,
  title,
  line,
  status,
  stats,
  image,
  imagePosition = "50% 62%",
}: {
  eyebrow: string;
  /** Hand-broken lines — each becomes one masked line that slides up. */
  title: string[];
  /** One short line. Deliberately not a paragraph. */
  line?: string;
  status?: { live: boolean; label: string };
  stats?: MastheadStat[];
  /** Decorative only — see the note above. */
  image?: string;
  imagePosition?: string;
}) {
  const root = useRef<HTMLElement | null>(null);

  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      const e = rise("[data-tb-eyebrow]", { y: 12, duration: 0.6 });
      if (e) tl.add(e, 0.15);
      const l = revealLines("[data-tb-line] > span", { stagger: 0.1 });
      if (l) tl.add(l, 0.28);
      const t = rise("[data-tb-tail]", { y: 14, stagger: 0.07 });
      if (t) tl.add(t, 0.62);
      // The rail arrives last and from further down — it is the hand-off
      // into the board, so it should read as arriving from it.
      const s = rise("[data-tb-stat]", { y: 20, stagger: 0.06 });
      if (s) tl.add(s, 0.78);
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      className={`tb-mast ${image ? "has-media" : ""}`.trim()}
      aria-label={title.join(" ")}
    >
      {image && (
        <div className="tb-mast-media" aria-hidden>
          <Image
            src={image}
            alt=""
            fill
            priority
            sizes="100vw"
            style={{ objectPosition: imagePosition }}
          />
        </div>
      )}
      <div className="tb-mast-aurora" aria-hidden />
      <div className="v-grain" aria-hidden />

      <div className="hp-wrap tb-mast-inner">
        <div className="tb-mast-top">
          <p className="tb-mast-eyebrow" data-tb-eyebrow>
            {eyebrow}
          </p>
          {status && (
            <p
              className={`ss-status ${status.live ? "is-live" : "is-upcoming"}`}
              data-tb-eyebrow
            >
              <span className="ss-dot" aria-hidden />
              {status.label}
            </p>
          )}
        </div>

        <h1 className="tb-mast-title">
          {title.map((t) => (
            <span className="mq-line" data-tb-line key={t}>
              <span>{t}</span>
            </span>
          ))}
        </h1>

        {line && (
          <p className="tb-mast-line" data-tb-tail>
            {line}
          </p>
        )}

        {stats && stats.length > 0 && (
          <dl className="tb-rail">
            {stats.map((s) => (
              <div className="tb-rail-cell" key={s.k} data-tb-stat>
                <dt>{s.k}</dt>
                <dd>{s.v}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}
