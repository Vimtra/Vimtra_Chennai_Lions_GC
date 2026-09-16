"use client";

import { useEffect, useRef } from "react";
import {
  gsap,
  reduced,
  registerGsap,
  revealLinesOnScroll,
  riseOnScroll,
} from "@/components/motion/gsap";

export interface Pillar {
  n: string;
  t: string;
  d: string;
  figures: { v: string; l: string }[];
  set?: { k: string; v: string; d: string }[];
}

/**
 * The three pillars — a measured index.
 *
 * THE COMPOSITION. Each pillar is one row of the page's own 12-column
 * track: the name on columns 1-5, the statement on 7-12, and — where a
 * pillar has them — the destination circuits as a full-measure register
 * beneath both. Three vertical lines, held by every entry, and nothing
 * else. No rail, no spine, no rule, no box.
 *
 * THE TITLES. Every pillar name in the source is exactly two words, so
 * each is set one word per masked line. That is not a flourish: it gives
 * all three titles identical structure and identical height, which is what
 * lets the statements beside them sit on a shared first baseline. A name
 * of three words would simply take three lines and still align.
 *
 * THE NUMERAL is part of the label line rather than a graphic of its own —
 * a large tabular figure, a short gold rule, then the source's own "Pillar
 * 01 of 03" framing. It states the position once instead of stamping it
 * twice.
 *
 * SPACE is the section's structure. A full rhythm step between entries, a
 * measured statement (~46ch) that never runs the full page width, and the
 * circuits given the whole measure so three destinations read as three
 * destinations rather than three cramped slivers.
 *
 * MOTION. Per pillar, not per section: `<Section>` fires one `[data-rise]`
 * pass for everything inside it, which made all three arrive together. Each
 * entry now owns its trigger — the name rises in masked lines, the label,
 * statement and circuits lift in behind it. This component uses its own
 * `data-ivp-*` hooks so `<Section>`'s global `[data-rise]` pass does not
 * also animate these elements. Every primitive is a no-op under
 * prefers-reduced-motion and nothing is hidden by CSS, so with JS off the
 * section still renders in full.
 *
 * CONTENT. Every number, title, statement, circuit and figure is passed in
 * from the page's own PILLARS constant — Vimtra x PGA of America brochure
 * pp. 05, 06, 08, verbatim. Nothing added, reworded or dropped.
 */
export default function ThreePillars({ pillars }: { pillars: Pillar[] }) {
  const root = useRef<HTMLOListElement | null>(null);

  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      el.querySelectorAll<HTMLElement>("[data-ivp-item]").forEach((item) => {
        const words = item.querySelectorAll("[data-ivp-word] > span");
        if (words.length) revealLinesOnScroll(words, item, { stagger: 0.08 });

        const rise = item.querySelectorAll("[data-ivp-rise]");
        if (rise.length) riseOnScroll(rise, item, { y: 20, stagger: 0.06 });

        // The label's gold rule draws out from the numeral it follows.
        const rule = item.querySelector("[data-ivp-rule]");
        if (rule && !reduced()) {
          gsap.fromTo(
            rule,
            { scaleX: 0 },
            {
              scaleX: 1,
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: { trigger: item, start: "top 84%", once: true },
            }
          );
        }
      });
    }, el);
    return () => ctx.revert();
  }, [pillars]);

  return (
    <ol className="ivp-set" ref={root}>
      {pillars.map((p) => (
        <li className="ivp-item" key={p.n} data-ivp-item>
          <div className="ivp-lead">
            {/* The numeral is decorative here — "Pillar 01 of 03" beside it
                states the same position in words. */}
            <p className="ivp-k" data-ivp-rise>
              <span className="ivp-n" aria-hidden>
                {p.n}
              </span>
              <span className="ivp-rule" data-ivp-rule aria-hidden />
              <span className="ivp-k-t">Pillar {p.n} of 03</span>
            </p>

            {/* One word per masked line. The accessible name is stated once
                on the heading, since the spans are decorative geometry and
                would otherwise concatenate without spaces. */}
            <h3 className="ivp-t" aria-label={p.t}>
              {p.t.split(" ").map((w) => (
                <span className="mq-line" data-ivp-word key={w}>
                  <span>{w}</span>
                </span>
              ))}
            </h3>
          </div>

          <div className="ivp-say">
            <p className="ivp-d" data-ivp-rise>
              {p.d}
            </p>

            {/* Only where the source actually supplies figures. Each carries
                the metric it measures, per the data-integrity rule — none is
                a projection, a target or a return. */}
            {p.figures.length > 0 && (
              <dl className="ivp-f" data-ivp-rise>
                {p.figures.map((f) => (
                  <div key={f.l}>
                    <dt>{f.v}</dt>
                    <dd>{f.l}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          {/* Given the full measure rather than squeezed into the statement
              column: three destinations should read as three destinations. */}
          {p.set && p.set.length > 0 && (
            <ul className="ivp-circuit">
              {p.set.map((c) => (
                <li key={c.v} data-ivp-rise>
                  <span className="ivp-c-k">{c.k}</span>
                  <span className="ivp-c-v">{c.v}</span>
                  <span className="ivp-c-d">{c.d}</span>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ol>
  );
}
