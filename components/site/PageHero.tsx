"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap, registerGsap, revealLines, rise } from "@/components/motion/gsap";

/**
 * Shared page header.
 *
 * Replaces the crimson radial hero that every interior page used to carry.
 * Deep ink ground + brand-only Aurora atmosphere + grain, an editorial
 * eyebrow rule, an oversized masked-line title, and an optional lead.
 *
 * `title` is an array so the line breaks are composed by hand rather than
 * left to the browser — each entry becomes one masked line that slides up on
 * load. GSAP sets the "from" state, so if JS never runs the header still
 * renders complete.
 */
export default function PageHero({
  eyebrow,
  title,
  lead,
  children,
  align = "left",
  wrap = false,
  above,
  variant = "editorial",
}: {
  eyebrow: ReactNode;
  title: string[];
  lead?: ReactNode;
  children?: ReactNode;
  align?: "left" | "center";
  /**
   * Three levels, chosen by page family rather than applied uniformly:
   *   immersive — story pages (The Club, The Pride, Ventures, Invest…)
   *   editorial — media and roster pages (News, Gallery, Players)
   *   compact   — data and utility pages (Fixtures, Scores, Cart, Terms…)
   * The immersive level earns its presence from display scale, not from
   * a taller empty band.
   */
  variant?: "immersive" | "editorial" | "compact";
  /** Long titles (article headlines) must wrap rather than run off the
   *  edge, so they opt out of the masked single-line treatment. */
  wrap?: boolean;
  /** Optional element rendered above the eyebrow (e.g. a back link). */
  above?: ReactNode;
}) {
  const root = useRef<HTMLElement | null>(null);

  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      const e = rise("[data-ph-eyebrow]", { y: 12, duration: 0.55 });
      if (e) tl.add(e, 0.1);
      const l = revealLines("[data-ph-line] > span", { stagger: 0.09 });
      if (l) tl.add(l, 0.22);
      const t = rise("[data-ph-tail]", { y: 16, stagger: 0.08 });
      if (t) tl.add(t, 0.55);
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      className={`hp-pagehero is-${variant} ${
        align === "center" ? "is-center" : ""
      }`.trim()}
    >
      <div className="hp-pagehero-atmos" aria-hidden />
      <div className="hp-wrap hp-pagehero-inner">
        {above && (
          <div className="hp-pagehero-above" data-ph-eyebrow>
            {above}
          </div>
        )}
        <p className="hp-rule-label" data-ph-eyebrow>
          {eyebrow}
        </p>
        {wrap ? (
          <h1 className="hp-pagehero-title is-wrap" data-ph-tail>
            {title.join(" ")}
          </h1>
        ) : (
          <h1 className="hp-pagehero-title">
            {title.map((line) => (
              <span className="mq-line" data-ph-line key={line}>
                <span>{line}</span>
              </span>
            ))}
          </h1>
        )}
        {lead && (
          <p className="hp-pagehero-lead" data-ph-tail>
            {lead}
          </p>
        )}
        {children && (
          <div className="hp-pagehero-actions" data-ph-tail>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
