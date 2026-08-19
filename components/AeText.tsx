"use client";

import { createElement, useEffect, useRef, useState, type CSSProperties } from "react";

type Mode = "words" | "mask" | "chars";

interface AeTextProps {
  text: string;
  mode?: Mode;
  /** Heading/element tag, e.g. "h1", "h2", "span". */
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  style?: CSSProperties;
  /** Lead-in delay (ms) before the reveal triggers. */
  delay?: number;
}

/**
 * After-Effects-style staggered text reveals, ported from the [data-ae="…"]
 * splitter in assets/lions.js. Splits text up front (so SSR markup matches)
 * and toggles `.is-in` when scrolled into view.
 */
export default function AeText({
  text,
  mode = "words",
  as = "span",
  className = "",
  style,
  delay = 0,
}: AeTextProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setTimeout(() => setInView(true), delay);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -60px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  const baseClass = `ae-${mode}`;
  const cls = `${baseClass} ${className} ${inView ? "is-in" : ""}`.trim();

  let inner: React.ReactNode;
  if (mode === "mask") {
    inner = (
      <span className="ae-mask">
        <span className="ae-mask-inner">{text}</span>
      </span>
    );
  } else if (mode === "chars") {
    inner = [...text].map((c, i) => (
      <span key={i} className="ae-char" style={{ transitionDelay: `${i * 35}ms` }}>
        {c === " " ? " " : c}
      </span>
    ));
  } else {
    const words = text.trim().split(/\s+/);
    inner = words.map((w, i) => (
      <span key={i} className="ae-word">
        <span style={{ transitionDelay: `${i * 90}ms` }}>{w}</span>
      </span>
    ));
  }

  return createElement(as, { ref, className: cls, style }, inner);
}
