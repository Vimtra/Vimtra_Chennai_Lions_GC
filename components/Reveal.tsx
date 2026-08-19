"use client";

import { createElement, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type Variant = "fade-up" | "fade-left" | "fade-right" | "zoom-in" | "fade";

interface RevealProps {
  children: ReactNode;
  /** Animation style — maps to the [data-reveal] CSS in globals.css. */
  variant?: Variant;
  /** Lead-in delay (ms) before the element animates in, like AOS delays. */
  delay?: number;
  /** Element tag to render (div by default; e.g. "a", "section", "li"). */
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  style?: CSSProperties;
  href?: string;
  "aria-label"?: string;
}

/**
 * Scroll-triggered reveal (the React replacement for the static site's AOS
 * usage). Adds `.is-in` once the element scrolls into view. "Nice and slow"
 * easing/duration live in globals.css under [data-reveal].
 */
export default function Reveal({
  children,
  variant = "fade-up",
  delay = 0,
  as = "div",
  className = "",
  style,
  ...rest
}: RevealProps) {
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
            const t = setTimeout(() => setInView(true), delay);
            io.unobserve(e.target);
            return () => clearTimeout(t);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -60px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  return createElement(
    as,
    {
      ref,
      "data-reveal": variant,
      className: inView ? `${className} is-in`.trim() : className,
      style,
      ...rest,
    },
    children
  );
}
