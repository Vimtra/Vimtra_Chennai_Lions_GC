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

/**
 * Club-module story hero.
 *
 * One cinematic frame instead of a text band: a real photograph carries
 * the storytelling, a brand-only aurora gives the ground depth, and the
 * type is limited to an eyebrow, a display title, one short supporting
 * line and — at most — one call to action.
 *
 * The hero deliberately sits UNDER the floating header (see
 * FLOATING_HEADER_ROUTES in lib/nav.ts): `.cm-hero` reserves header
 * height as top padding so the image runs to the top of the frame while
 * the type still clears the bar.
 *
 * Layout is `.hp-wrap` + `.cm-track` — the same container and the same
 * 4 / 8 / 12 column track as every other section on the page.
 *
 * All motion goes through the shared primitives, which are no-ops under
 * prefers-reduced-motion. GSAP sets every "from" state, so if JS never
 * runs the hero still renders complete.
 */
export default function StoryHero({
  eyebrow,
  title,
  line,
  image,
  imageAlt,
  imagePosition = "50% 45%",
  cta,
}: {
  eyebrow: string;
  /** Hand-broken lines — each becomes one masked line that slides up. */
  title: string[];
  /** One short supporting line. Deliberately not a paragraph. */
  line?: string;
  /**
   * Optional. Omit it where a stock photograph would stand in for real
   * subject matter that the page itself is about to show — /players opens
   * on the franchise's own portraits, so a generic golfer in the hero
   * would be filler. Without an image the hero keeps the ink ground and
   * aurora and drops to a compact height, so it never becomes an empty
   * band.
   */
  image?: string;
  imageAlt?: string;
  imagePosition?: string;
  cta?: {
    href: string;
    label: string;
    /** Default ghost on dark. Primary is the gold fill — used where the
     *  hero itself is the call to act, not a chapter opener. */
    variant?: "ghost" | "primary";
  };
}) {
  const root = useRef<HTMLElement | null>(null);

  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      // The frame opens first, slowly — the image is the subject.
      if (el.querySelector("[data-sh-media] img")) {
        tl.fromTo(
          "[data-sh-media] img",
          { scale: 1.1 },
          { scale: 1, duration: 2, ease: "power2.out" },
          0
        );
      }
      const e = rise("[data-sh-eyebrow]", { y: 12, duration: 0.6 });
      if (e) tl.add(e, 0.25);
      const l = revealLines("[data-sh-line] > span", { stagger: 0.1 });
      if (l) tl.add(l, 0.38);
      const t = rise("[data-sh-tail]", { y: 16, stagger: 0.08 });
      if (t) tl.add(t, 0.8);

      // Depth, not sliding — 4% of the frame, with headroom built into
      // `.cm-hero-media` so no edge is ever exposed.
      const media = el.querySelector("[data-sh-media]");
      if (media) parallax(media, el, 4);
    }, el);
    return () => ctx.revert();
  }, []);

  // A long word cannot be allowed to run past its masked line: `.mq-line`
  // clips horizontally, so "DEVELOPMENT" at the default display size was
  // losing its last letters between roughly 600 and 900px wide. Long
  // titles step down to a size that fits at every breakpoint.
  const longestLine = Math.max(...title.map((t) => t.length));

  return (
    <section
      ref={root}
      className={`cm-hero ${image ? "" : "is-plain"} ${
        longestLine > 9 ? "is-long" : ""
      }`
        .replace(/\s+/g, " ")
        .trim()}
      aria-label={title.join(" ")}
    >
      {image && (
        <div className="cm-hero-media" data-sh-media>
          <Image
            src={image}
            alt={imageAlt ?? ""}
            fill
            priority
            sizes="100vw"
            style={{ objectPosition: imagePosition }}
          />
        </div>
      )}
      <div className="cm-hero-aurora" aria-hidden />
      <div className="cm-hero-veil" aria-hidden />
      <div className="v-grain" aria-hidden />

      <div className="hp-wrap cm-track cm-hero-inner">
        <div className="cm-hero-head">
          <p className="cm-eyebrow" data-sh-eyebrow>
            {eyebrow}
          </p>
          <h1 className="cm-hero-title">
            {title.map((t) => (
              <span className="mq-line" data-sh-line key={t}>
                <span>{t}</span>
              </span>
            ))}
          </h1>
        </div>

        {line && (
          <p className="cm-hero-line" data-sh-tail>
            {line}
          </p>
        )}

        {cta && (
          <p className="cm-hero-cta" data-sh-tail>
            <Link
              href={cta.href}
              className={
                cta.variant === "primary"
                  ? "hp-btn hp-btn-primary"
                  : "hp-btn hp-btn-ghost hp-on-dark"
              }
            >
              {cta.label}
              <span className="hp-arrow" aria-hidden>
                →
              </span>
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
