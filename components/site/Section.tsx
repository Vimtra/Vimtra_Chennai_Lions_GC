"use client";

import { useEffect, useRef, type ReactNode } from "react";
import {
  gsap,
  registerGsap,
  revealLinesOnScroll,
  riseOnScroll,
} from "@/components/motion/gsap";

/**
 * Shared page section primitives.
 *
 * `<Section>` owns the surface + vertical rhythm and wires the scroll
 * choreography once for everything inside it:
 *   [data-line] > span  → masked line reveal
 *   [data-rise]         → staggered rise + fade
 *
 * Children opt in by adding those attributes, so a page never writes its own
 * GSAP. All motion is skipped under prefers-reduced-motion.
 */
export function Section({
  surface = "ivory",
  size = "default",
  className = "",
  children,
  ...rest
}: {
  surface?: "ivory" | "paper" | "ink";
  size?: "tight" | "default" | "loose";
  className?: string;
  children: ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  const root = useRef<HTMLElement | null>(null);

  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      if (el.querySelector("[data-line] > span")) {
        revealLinesOnScroll("[data-line] > span", el);
      }
      if (el.querySelector("[data-rise]")) {
        riseOnScroll("[data-rise]", el, { y: 22, stagger: 0.08 });
      }
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      className={`hp-sec hp-sec-${surface} hp-sec-${size} ${className}`.trim()}
      {...rest}
    >
      <div className="hp-wrap">{children}</div>
    </section>
  );
}

/** "01 —— THE FRANCHISE" index label. */
export function IndexLabel({
  n,
  children,
  tone = "light",
}: {
  n: string;
  children: ReactNode;
  tone?: "light" | "dark";
}) {
  return (
    <p className={`hp-index ${tone === "dark" ? "hp-index-dark" : ""}`} data-rise>
      {n} <span>{children}</span>
    </p>
  );
}

/** Section title composed as hand-broken masked lines. */
export function SectionTitle({
  lines,
  id,
  className = "",
}: {
  lines: string[];
  id?: string;
  className?: string;
}) {
  return (
    <h2 id={id} className={`hp-section-title ${className}`.trim()}>
      {lines.map((l) => (
        <span className="mq-line" data-line key={l}>
          <span>{l}</span>
        </span>
      ))}
    </h2>
  );
}

/** Numbered editorial list — the house alternative to a grid of cards. */
export function NumberedList({
  items,
}: {
  items: { k?: string; t: string; d: ReactNode }[];
}) {
  return (
    <ol className="hp-pillars">
      {items.map((p, i) => (
        <li className="hp-pillar" key={p.t} data-rise>
          <span className="hp-pillar-n">{String(i + 1).padStart(2, "0")}</span>
          <div>
            {p.k && <p className="hp-pillar-k">{p.k}</p>}
            <h3 className="hp-pillar-t">{p.t}</h3>
            <p className="hp-pillar-d">{p.d}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Statistic row. Numerals are graphic elements, not badges. */
export function Figures({
  items,
  tone = "dark",
}: {
  items: { v: string; l: string }[];
  tone?: "light" | "dark";
}) {
  return (
    <dl className={`hp-figures-grid ${tone === "light" ? "is-light" : ""}`}>
      {items.map((f) => (
        <div className="hp-figure" key={f.l} data-rise>
          <dt className="hp-figure-n">{f.v}</dt>
          <dd className="hp-figure-l">
            <span className="hp-figure-label">{f.l}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Honest empty state. Used where real data does not exist yet (scores,
 * leaderboards) — designed on purpose rather than looking unfinished, and
 * never filled with invented numbers.
 */
export function EmptyState({
  eyebrow,
  title,
  body,
  children,
}: {
  eyebrow: string;
  title: string;
  body: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="hp-empty" data-rise>
      <p className="hp-empty-eyebrow">{eyebrow}</p>
      <h3 className="hp-empty-title">{title}</h3>
      <p className="hp-empty-body">{body}</p>
      {children && <div className="hp-empty-actions">{children}</div>}
    </div>
  );
}
