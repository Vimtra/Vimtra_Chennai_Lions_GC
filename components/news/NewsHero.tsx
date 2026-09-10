"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  gsap,
  registerGsap,
  revealLines,
  rise,
  parallax,
} from "@/components/motion/gsap";
import type { NewsEntry } from "@/lib/news-desk";

/**
 * Newsroom cover story — the /news opener.
 *
 * Built ON the site's existing hero system rather than beside it: the
 * section carries `.cm-hero` itself, so the ink ground, the header
 * clearance, the frame height, the photographic `.cm-hero-media`, the two
 * crossed veils, the brand aurora and the grain are literally the same
 * rules `StoryHero` applies on /the-club, /players, /fixtures and the rest.
 * `.nwr-hero` only re-composes what sits INSIDE that frame, because this
 * hero has a job the others do not: it is a front page, so it has to carry
 * a real story — its publisher, its classification and its link — and not
 * only a page name.
 *
 * Everything rendered here comes from one database row (`NewsEntry`, built
 * in lib/news-desk.ts). Headline, publisher, date and destination are
 * verbatim; the photograph is that row's own stored cover. There is no
 * fallback headline and no stand-in image — a row with no cover keeps the
 * ink-and-aurora ground (`.cm-hero.is-plain`, the same treatment /players
 * uses) instead of borrowing a picture from somewhere else, and with no
 * rows at all the page never renders this component.
 *
 * Semantics: the `h1` is the page ("News") and the cover story is an `h2`,
 * so the heading order still describes the document even though the story
 * carries the larger type.
 *
 * Motion goes through the shared primitives, which are no-ops under
 * prefers-reduced-motion, and GSAP sets every "from" state — if JS never
 * runs, the hero renders complete.
 */
export default function NewsHero({
  story,
  counts,
}: {
  story: NewsEntry;
  counts: { official: number; press: number; social: number };
}) {
  const root = useRef<HTMLElement | null>(null);

  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      if (el.querySelector("[data-nh-media] img")) {
        tl.fromTo(
          "[data-nh-media] img",
          { scale: 1.1 },
          { scale: 1, duration: 2, ease: "power2.out" },
          0
        );
      }
      const e = rise("[data-nh-eyebrow]", { y: 12, duration: 0.6 });
      if (e) tl.add(e, 0.2);
      const m = revealLines("[data-nh-mast] > span", { stagger: 0.1 });
      if (m) tl.add(m, 0.3);
      // The headline rises rather than sliding out of a mask: `.mq-line`
      // sets `white-space: nowrap` on its child, which is right for a
      // hand-broken display word and wrong for a wire headline that has to
      // wrap to three lines at 375px.
      const h = rise("[data-nh-title]", { y: 22, duration: 0.9 });
      if (h) tl.add(h, 0.5);
      const t = rise("[data-nh-tail]", { y: 16, stagger: 0.08 });
      if (t) tl.add(t, 0.78);

      const media = el.querySelector("[data-nh-media]");
      if (media) parallax(media, el, 4);
    }, el);
    return () => ctx.revert();
  }, []);

  const rail: { k: string; v: number }[] = [
    { k: "Official", v: counts.official },
    { k: "Press", v: counts.press },
    { k: "Social", v: counts.social },
  ];

  // Only fields the row actually carries. A story with no verified date
  // shows publisher alone rather than an empty separator.
  const meta = [story.kicker, story.source, story.date].filter(Boolean);

  return (
    <section
      ref={root}
      className={`cm-hero nwr-hero ${story.image ? "" : "is-plain"}`.trim()}
      aria-labelledby="nwr-mast"
    >
      {story.image && (
        <div className="cm-hero-media nwr-hero-media" data-nh-media>
          <Image
            src={story.image}
            alt=""
            fill
            priority
            sizes="100vw"
            className="nwr-hero-img"
          />
        </div>
      )}
      <div className="cm-hero-aurora" aria-hidden />
      <div className="cm-hero-veil nwr-hero-veil" aria-hidden />
      <div className="v-grain" aria-hidden />

      <div className="hp-wrap nwr-hero-inner">
        <div className="nwr-hero-top">
          <div className="nwr-hero-id">
            <p className="cm-eyebrow nwr-hero-eyebrow" data-nh-eyebrow>
              From the Den · Vimtra Chennai Lions GC
            </p>
            <h1 className="nwr-hero-mast" id="nwr-mast">
              <span className="mq-line" data-nh-mast>
                <span>News</span>
              </span>
            </h1>
          </div>
          <dl className="nwr-hero-rail" data-nh-eyebrow>
            {rail.map((r) => (
              <div key={r.k}>
                <dt>{r.k}</dt>
                <dd>{String(r.v).padStart(2, "0")}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="nwr-hero-foot">
          <div className="nwr-hero-story">
            <p className="nwr-hero-kick" data-nh-tail>
              <span className="nwr-hero-flag">Cover story</span>
              <span className="nwr-hero-meta">
                {meta.map((m, i) => (
                  <span key={m}>
                    {i > 0 && (
                      <i className="nwr-sep" aria-hidden>
                        ·
                      </i>
                    )}
                    {m}
                  </span>
                ))}
              </span>
            </p>
            <h2 className="nwr-hero-t" data-nh-title>
              {story.title}
            </h2>
          </div>

          <p className="nwr-hero-act" data-nh-tail>
            {story.external ? (
              <a
                className="hp-btn hp-btn-ghost hp-on-dark"
                href={story.href}
                target="_blank"
                rel="noreferrer noopener"
              >
                Read at {story.source}
                <span className="hp-arrow" aria-hidden>
                  →
                </span>
              </a>
            ) : (
              <Link className="hp-btn hp-btn-ghost hp-on-dark" href={story.href}>
                Read the story
                <span className="hp-arrow" aria-hidden>
                  →
                </span>
              </Link>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
