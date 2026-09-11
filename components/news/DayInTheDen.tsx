"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import {
  gsap,
  registerGsap,
  reduced,
  EASE,
  parallax,
  revealImageOnScroll,
} from "@/components/motion/gsap";

/**
 * /news · 14 August 2026 — A DAY IN THE DEN
 *
 * An activity feature, NOT a news article. It is deliberately not a `Post`
 * or a `MediaCoverage` row: those tables are the verified news record and
 * the official IGPL items live there. This chapter is authored in code the
 * same way the brochure-sourced copy on /the-club is, and the news desks
 * either side of it are untouched.
 *
 * CONTENT PROVENANCE. Date, chapter title, both moment labels, both
 * headlines and both descriptions were supplied approved by the operator
 * and are reproduced verbatim. Nothing is derived, expanded or inferred —
 * no count, venue, name or outcome appears, because none was given.
 *
 * PHOTOGRAPHY. Two of the operator's own uploaded photographs, downscaled
 * through the project's existing derivative settings and otherwise
 * unaltered:
 *   morning → IMGL8570.JPG              (a drive off the tee, Lions backdrop)
 *   evening → IGPL Event/IMGL9398.JPG   (the meet & greet reception)
 *
 * CINEMATIC, IN TWO DIFFERENT IDIOMS. The chapter is set on ink, and each
 * moment is a film frame — but not the same frame twice:
 *
 *   01 MORNING   THE WIDE SHOT. An edge-to-edge photograph at near full
 *                viewport height, the site's own `.cm-full` idiom: parallax
 *                headroom, a bottom-weighted veil, grain, and the title card
 *                set INSIDE the frame on the lower-left over the grass —
 *                never over the player or the guests, who sit in the upper
 *                two-thirds of this crop.
 *
 *   02 EVENING   THE PROJECTED STILL. A 21:9 letterboxed frame inset on the
 *                grid with the page's own gutters as its black bars, and the
 *                caption set BELOW it, right-aligned. No type ever sits on
 *                this photograph, so the faces across its middle band are
 *                never covered.
 *
 * Both photographs are the hero of their moment. The type sizes, marks and
 * colour roles are one system; the frame, the anchor and the reveal differ.
 *
 * MOTION. Through the shared primitives, all of which are no-ops under
 * prefers-reduced-motion. The wide shot opens as a slow settle
 * (scale 1.06 → 1) and carries a 4% parallax; the still wipes open with the
 * site's clip-path reveal. Each moment has its own trigger — they sit a
 * screen apart, and one shared timeline would have played the evening while
 * it was still below the fold.
 */

export interface DenMoment {
  n: string;
  label: string;
  headline: string;
  body: string;
  image: string;
  imageAlt: string;
  imagePosition: string;
}

export default function DayInTheDen({
  date,
  stamp,
  moments,
}: {
  date: string;
  stamp: string;
  moments: DenMoment[];
}) {
  const root = useRef<HTMLElement | null>(null);
  const [morning, evening] = moments;

  useEffect(() => {
    if (reduced()) return;
    registerGsap();
    const el = root.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // Chapter head.
      gsap.fromTo(
        el.querySelectorAll("[data-den='head']"),
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: EASE,
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: "top 76%", once: true },
        }
      );

      // 01 — the wide shot: a slow settle, then the title card.
      const wide = el.querySelector("[data-den='wide']");
      if (wide) {
        const img = wide.querySelector("[data-den='media'] img");
        const tl = gsap.timeline({
          scrollTrigger: { trigger: wide, start: "top 72%", once: true },
        });
        if (img) {
          tl.fromTo(
            img,
            { scale: 1.06 },
            { scale: 1, duration: 1.6, ease: "power2.out" },
            0
          );
        }
        tl.fromTo(
          wide.querySelectorAll("[data-den='text']"),
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7, ease: EASE, stagger: 0.09 },
          0.25
        );
        const media = wide.querySelector("[data-den='media']");
        if (media) parallax(media, wide, 4);
      }

      // 02 — the still: wipes open, then its caption.
      const still = el.querySelector("[data-den='still']");
      if (still) {
        const fig = still.querySelector("[data-den='media']");
        if (fig) revealImageOnScroll(fig, still, { start: "top 78%" });
        gsap.fromTo(
          still.querySelectorAll("[data-den='text']"),
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: EASE,
            stagger: 0.08,
            scrollTrigger: { trigger: still, start: "top 66%", once: true },
          }
        );
      }
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="den-sec" aria-labelledby="den-title">
      {/* ---- Chapter head ---- */}
      <div className="hp-wrap den-head">
        <p className="den-rail" data-den="head">
          <span className="den-stamp">{stamp}</span>
          <span className="den-rule" aria-hidden />
          <span className="den-rail-k">A day in the Den</span>
        </p>
        <h2 className="den-title" id="den-title" data-den="head">
          <span>A DAY IN</span>
          <span>THE DEN.</span>
        </h2>
        <p className="den-date" data-den="head">
          {date}
        </p>
      </div>

      {/* ---- 01 · the wide shot ---- */}
      <article className="den-wide" data-den="wide">
        <div className="den-wide-media" data-den="media">
          <Image
            src={morning.image}
            alt={morning.imageAlt}
            fill
            sizes="100vw"
            style={{ objectPosition: morning.imagePosition }}
          />
        </div>
        <div className="den-wide-veil" aria-hidden />
        <div className="v-grain" aria-hidden />
        <p className="den-wide-stamp" data-den="text" aria-hidden>
          {stamp}
        </p>

        <div className="hp-wrap cm-track den-wide-inner">
          <div className="den-card den-card-wide">
            <p className="den-mark" data-den="text">
              <span className="den-n" aria-hidden>
                {morning.n}
              </span>
              <span className="den-label">{morning.label}</span>
            </p>
            <h3 className="den-h" data-den="text">
              {morning.headline}
            </h3>
            <p className="den-d" data-den="text">
              {morning.body}
            </p>
          </div>
        </div>
      </article>

      {/* ---- 02 · the projected still ---- */}
      <article className="den-still" data-den="still">
        <div className="hp-wrap">
          <figure className="den-still-fig" data-den="media">
            <Image
              src={evening.image}
              alt={evening.imageAlt}
              fill
              sizes="(max-width: 1600px) calc(100vw - 40px), 1400px"
              style={{ objectPosition: evening.imagePosition }}
            />
            <span className="den-still-index" aria-hidden>
              {evening.n}
            </span>
          </figure>

          <div className="cm-track den-still-caption">
            <div className="den-card den-card-still">
              <p className="den-mark" data-den="text">
                <span className="den-n" aria-hidden>
                  {evening.n}
                </span>
                <span className="den-label">{evening.label}</span>
              </p>
              <h3 className="den-h" data-den="text">
                {evening.headline}
              </h3>
              <p className="den-d" data-den="text">
                {evening.body}
              </p>
              <p className="den-foot" data-den="text">
                {stamp}
              </p>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}
