"use client";

import { useEffect, useRef } from "react";
import { gsap, reduced, registerGsap, riseOnScroll } from "@/components/motion/gsap";

export interface Pillar {
  n: string;
  t: string;
  d: string;
  figures: { v: string; l: string }[];
  set?: { k: string; v: string; d: string }[];
}

/**
 * The three pillars.
 *
 * WHAT CHANGED AND WHY. The previous pass was a ruled ledger: every pillar a
 * full-width row divided by a horizontal rule, a 2px rule capping the set and
 * another closing it, with the destination circuits adding one more rule per
 * entry. Seven horizontal lines in one section, and the reading was a stack
 * of rows rather than a composition.
 *
 * Worse, the mechanism that justified the ledger was dead. The layout split
 * each row into statement-left / figures-right, but all three pillars carry
 * `figures: []`, so every row fell through to the `is-solo` full-width case
 * and the right column never rendered at all. What remained was a plain list
 * wearing the clothes of a two-column ledger.
 *
 * THE COMPOSITION. A pillar is a vertical thing, so each one is now built on
 * one: a rail carrying its numeral above a gold spine that runs the full
 * height of the entry, with the content set against it. That gives the
 * section its structure without a single horizontal rule between pillars —
 * the separation is the rail, the numeral's scale, and space. It is also
 * deliberately not the device used by the players roster or the partners
 * register, so the three sections stay distinct.
 *
 * The destination circuits under pillar 01 were a stacked ruled list; they
 * are now a three-up register, which is what three parallel destinations
 * actually are, and which costs three rules rather than three rows.
 *
 * The figure group is kept and still renders when a pillar has figures — the
 * data carries the field, so the component honours it rather than assuming
 * today's empty arrays are permanent.
 *
 * MOTION. Per pillar, not per section: `<Section>` fires one `[data-rise]`
 * pass for everything inside it, which made all three arrive together. Each
 * pillar now owns its trigger — the spine draws down, then the label, title,
 * copy and circuits lift in behind it — so they arrive as you reach them.
 * This component uses its own `data-ivp-*` hooks so `<Section>`'s global
 * `[data-rise]` pass does not also animate these elements.
 *
 * CONTENT. Every pillar number, title, statement, circuit and figure is
 * passed in from the page's own PILLARS constant — Vimtra x PGA of America
 * brochure pp. 05, 06, 08, verbatim. Nothing is added, reworded or dropped.
 */
export default function ThreePillars({ pillars }: { pillars: Pillar[] }) {
  const root = useRef<HTMLOListElement | null>(null);

  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      el.querySelectorAll<HTMLElement>("[data-ivp-item]").forEach((item) => {
        const spine = item.querySelector("[data-ivp-spine]");
        if (spine && !reduced()) {
          gsap.fromTo(
            spine,
            { scaleY: 0 },
            {
              scaleY: 1,
              duration: 1.1,
              ease: "power3.out",
              scrollTrigger: { trigger: item, start: "top 82%", once: true },
            }
          );
        }
        const rise = item.querySelectorAll("[data-ivp-rise]");
        if (rise.length) riseOnScroll(rise, item, { y: 20, stagger: 0.07 });
      });
    }, el);
    return () => ctx.revert();
  }, [pillars]);

  return (
    <ol className="ivp-set" ref={root}>
      {pillars.map((p) => (
        <li className="ivp-item" key={p.n} data-ivp-item>
          {/* The rail is the pillar. Its numeral repeats what the label
              states in words, so it is decorative and hidden from AT. */}
          <div className="ivp-rail" aria-hidden>
            <span className="ivp-n">{p.n}</span>
            <span className="ivp-spine" data-ivp-spine />
          </div>

          <div className="ivp-body">
            <p className="ivp-k" data-ivp-rise>
              Pillar {p.n} of 03
            </p>
            <h3 className="ivp-t" data-ivp-rise>
              {p.t}
            </h3>
            <p className="ivp-d" data-ivp-rise>
              {p.d}
            </p>

            {p.set && p.set.length > 0 && (
              <ul className="ivp-circuit">
                {p.set.map((c) => (
                  <li key={c.v} data-ivp-rise>
                    <span className="ivp-c-tick" aria-hidden />
                    <span className="ivp-c-k">{c.k}</span>
                    <span className="ivp-c-v">{c.v}</span>
                    <span className="ivp-c-d">{c.d}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Only where the source actually supplies figures. Each carries
                the label of the metric it measures, per the data-integrity
                rule — none is a projection, a target or a return. */}
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
        </li>
      ))}
    </ol>
  );
}
