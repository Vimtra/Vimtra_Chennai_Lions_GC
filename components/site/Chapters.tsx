"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import {
  gsap,
  registerGsap,
  revealLinesOnScroll,
  revealImageOnScroll,
  riseOnScroll,
} from "@/components/motion/gsap";

export interface Chapter {
  /** Displayed numeral, e.g. "01". */
  n: string;
  title: string;
  body: string;
  image: string;
  alt: string;
  /** object-position for the crop, so faces and horizons survive. */
  position?: string;
}

/**
 * Numbered editorial story.
 *
 * The house alternative to a row of feature cards: each chapter is a
 * full-width row on the 12-column track carrying one large numeral, one
 * heading, a short paragraph and one photograph. Sides alternate for
 * rhythm — the column math is identical in both directions, so the
 * numerals, headings and image edges all land on the same vertical lines
 * down the page.
 *
 * Motion is per-chapter and one-shot: the frame wipes open, the heading
 * slides up from its own baseline, the copy rises. Everything is a no-op
 * under prefers-reduced-motion.
 */
export default function Chapters({ items }: { items: Chapter[] }) {
  const root = useRef<HTMLOListElement | null>(null);

  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      el.querySelectorAll<HTMLElement>("[data-ch]").forEach((ch) => {
        const fig = ch.querySelector("[data-ch-fig]");
        if (fig) revealImageOnScroll(fig, ch);
        if (ch.querySelector("[data-ch-line] > span")) {
          revealLinesOnScroll("[data-ch-line] > span", ch);
        }
        riseOnScroll("[data-ch-rise]", ch, { y: 20, stagger: 0.1 });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <ol className="cm-chapters" ref={root}>
      {items.map((c, i) => (
        <li
          key={c.n}
          data-ch
          className={`cm-ch cm-track ${i % 2 === 1 ? "is-flipped" : ""}`.trim()}
        >
          <div className="cm-ch-media">
            <div className="cm-ch-fig" data-ch-fig>
              <Image
                src={c.image}
                alt={c.alt}
                fill
                sizes="(max-width: 1023px) 100vw, 58vw"
                style={{ objectPosition: c.position ?? "50% 50%" }}
              />
            </div>
          </div>
          <div className="cm-ch-body">
            <span className="cm-ch-n" data-ch-rise aria-hidden>
              {c.n}
            </span>
            <h3 className="cm-ch-t">
              <span className="mq-line" data-ch-line>
                <span>{c.title}</span>
              </span>
            </h3>
            <p className="cm-ch-d" data-ch-rise>
              {c.body}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
