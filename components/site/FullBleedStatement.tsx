"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import {
  gsap,
  registerGsap,
  revealLinesOnScroll,
  riseOnScroll,
  parallax,
} from "@/components/motion/gsap";

/**
 * Full-width visual chapter.
 *
 * The module's section-transition device: one edge-to-edge photograph and one
 * line of type, nothing else. It exists to change the reader's altitude
 * between two ruled sections rather than to carry information, so it never
 * takes body copy, metadata or a CTA.
 *
 * The photograph bleeds past the container on purpose — it is the only place
 * in the module that does — but the type still sits on `.hp-wrap` +
 * `.cm-track`, so the line starts on the same left edge as every heading
 * above and below it.
 *
 * `line` must be approved copy that makes no claim about the photograph's
 * location: a generic stock frame under a place-name reads as a picture of
 * that place. See public/assets/photo/CREDITS.md.
 */
export default function FullBleedStatement({
  eyebrow,
  line,
  image,
  imageAlt,
  imagePosition = "50% 50%",
}: {
  /** Optional rule + caps label, where the chapter needs naming. */
  eyebrow?: string;
  /** Hand-broken lines — each becomes one masked line. */
  line: string[];
  image: string;
  imageAlt: string;
  imagePosition?: string;
}) {
  const root = useRef<HTMLElement | null>(null);

  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      revealLinesOnScroll("[data-fb-line] > span", el, { stagger: 0.1 });
      if (el.querySelector("[data-fb-rise]")) {
        riseOnScroll("[data-fb-rise]", el, { y: 14 });
      }
      const media = el.querySelector("[data-fb-media]");
      if (media) parallax(media, el, 5);
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="cm-full" aria-label={line.join(" ")}>
      <div className="cm-full-media" data-fb-media>
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes="100vw"
          style={{ objectPosition: imagePosition }}
        />
      </div>
      <div className="cm-full-veil" aria-hidden />
      <div className="v-grain" aria-hidden />

      <div className="hp-wrap cm-track cm-full-inner">
        {eyebrow && (
          <p className="cm-eyebrow cm-full-eyebrow" data-fb-rise>
            {eyebrow}
          </p>
        )}
        <p className="cm-full-line">
          {line.map((l) => (
            <span className="mq-line" data-fb-line key={l}>
              <span>{l}</span>
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
