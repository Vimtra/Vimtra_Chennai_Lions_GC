"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import {
  gsap,
  registerGsap,
  revealImageOnScroll,
  revealLinesOnScroll,
  riseOnScroll,
} from "@/components/motion/gsap";

export interface Take {
  /** Displayed numeral, e.g. "01". */
  n: string;
  title: string;
  body: string;
  image: string;
  alt: string;
  /** object-position for the crop, so horizons and subjects survive. */
  position?: string;
}

/**
 * How the team was built — the four takes as ONE spread.
 *
 * WHAT THIS REPLACES. The section used the shared `Chapters` component: four
 * full-width rows, photograph one side and copy the other, sides alternating.
 * Four rows of the same shape ran to 2,446px on a 1440 screen — forty per
 * cent of the page — and the rhythm never changed once across them. Worse,
 * the alternating half-and-half row is the single most repeated layout on the
 * web. `Chapters` itself is left untouched for anything that wants it.
 *
 * WHAT THIS IS. The brochure line the section is built on is "Four names. One
 * team sheet." — so the four takes are drawn as one sheet: four columns read
 * left to right in a single band, each dropped by a different amount so the
 * frames cascade rather than sit in a grid. The cascade is what stops four
 * columns reading as four cards.
 *
 * The numeral is the device that breaks the frame: it straddles the bottom
 * edge of each photograph on an ink plate, half in the picture and half in
 * the page, at every width. Nothing is a card, nothing is boxed, and no row
 * repeats another's shape.
 *
 * On phones the band becomes a single column and the composition changes with
 * it: the photograph goes full width at a wider ratio and the numeral stays
 * on the frame edge, so the layered idea survives at a size where four
 * columns could not.
 *
 * Every string rendered comes from the caller's data, which is the Season 2026
 * brochure verbatim. Nothing here is padded and the component adapts to
 * however many takes it is given.
 */
export default function ClubBuild({ items }: { items: Take[] }) {
  const root = useRef<HTMLOListElement | null>(null);

  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      el.querySelectorAll<HTMLElement>("[data-take]").forEach((take) => {
        const fig = take.querySelector("[data-take-fig]");
        if (fig) revealImageOnScroll(fig, take);
        if (take.querySelector("[data-take-line] > span")) {
          revealLinesOnScroll("[data-take-line] > span", take);
        }
        riseOnScroll("[data-take-rise]", take, { y: 18, stagger: 0.08 });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <ol className="cl-reel" ref={root}>
      {items.map((t, i) => (
        <li
          key={t.n}
          data-take
          className="cl-take"
          // The cascade. Read by CSS as a step multiplier so the pattern
          // follows however many takes the data holds.
          style={{ ["--step" as string]: [0, 3, 1, 4][i % 4] }}
        >
          <figure className="cl-take-f" data-take-fig>
            <Image
              src={t.image}
              alt={t.alt}
              fill
              sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 24vw"
              style={{ objectPosition: t.position ?? "50% 50%" }}
            />
            <span className="cl-take-n" aria-hidden>
              {t.n}
            </span>
          </figure>

          <div className="cl-take-b">
            <h3 className="cl-take-t">
              <span className="mq-line" data-take-line>
                <span>{t.title}</span>
              </span>
            </h3>
            <p className="cl-take-d" data-take-rise>
              {t.body}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
