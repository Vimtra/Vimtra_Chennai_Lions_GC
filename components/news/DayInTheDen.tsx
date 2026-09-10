"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap, registerGsap, reduced, EASE } from "@/components/motion/gsap";

/**
 * /news · 14 August 2026 — A DAY IN THE DEN
 *
 * An activity feature, NOT a news article. It is deliberately not a `Post`
 * or a `MediaCoverage` row: those tables are the verified news record and
 * the official IGPL squad-launch item lives there. Turning a day's
 * programme into database "news" would put unverified rows into the same
 * feed the data-integrity rule protects, so this chapter is authored in
 * code the same way the brochure-sourced copy on /the-club and
 * /golf-development is, and the news desk below it is untouched.
 *
 * CONTENT PROVENANCE. Date, chapter title, both moment labels, both
 * headlines and both descriptions were supplied approved by the operator
 * and are reproduced verbatim. Nothing here is derived, expanded or
 * inferred — there are no counts, no venue, no attendee names and no
 * outcome claims, because none were given.
 *
 * PHOTOGRAPHY. Two of the operator's own uploaded photographs, downscaled
 * through the project's existing derivative settings and otherwise
 * unaltered:
 *   morning → IMGL8570.JPG  (a drive off the tee, Lions backdrop)
 *   evening → IGPL Event/IMGL9398.JPG  (the meet & greet reception)
 * The third upload (IMGL8435, the group photograph) is deliberately unused.
 *
 * COMPOSITION. The two moments must not read as a repeated image/text
 * pair, so they are built as opposites rather than as a mirror:
 *
 *   01 MORNING  text on a narrow LEFT rail, portrait-ish 4:3 frame on the
 *               right that breaks out through the right gutter, and the
 *               text hangs from the TOP of the frame.
 *   02 EVENING  a wider, shorter 16:9 frame on the LEFT that breaks out
 *               through the left gutter, text on the right, and the text
 *               sits on the FOOT of the frame.
 *
 * Different side, different ratio, different vertical anchor — one system,
 * two distinct moments.
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

  useEffect(() => {
    if (reduced()) return;
    registerGsap();
    const el = root.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // The chapter head gets its own trigger.
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

      // Each moment gets its OWN trigger rather than sharing the chapter's.
      // They sit a screen apart, so one timeline would have played the
      // evening while it was still far below the fold and the reader would
      // have arrived at content that had already resolved.
      el.querySelectorAll("[data-den='moment']").forEach((moment) => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: moment, start: "top 78%", once: true },
        });

        const img = moment.querySelector("[data-den='fig'] img");
        if (img) {
          tl.fromTo(
            img,
            { opacity: 0, scale: 1.03 },
            { opacity: 1, scale: 1, duration: 1, ease: EASE },
            0
          );
        }
        tl.fromTo(
          moment.querySelectorAll("[data-den='text']"),
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.6, ease: EASE, stagger: 0.08 },
          0.12
        );
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      className="hp-sec hp-sec-ink den-sec"
      aria-labelledby="den-title"
    >
      <div className="hp-wrap">
        <header className="den-head">
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
        </header>

        <div className="den-moments">
          {moments.map((m, i) => (
            <article
              key={m.n}
              className={`den-moment den-moment-${i + 1}`}
              data-den="moment"
            >
              <figure className="den-fig" data-den="fig">
                <Image
                  src={m.image}
                  alt={m.imageAlt}
                  fill
                  sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1023px) calc(100vw - 80px), 58vw"
                  style={{ objectPosition: m.imagePosition }}
                />
              </figure>

              <div className="den-body">
                <p className="den-mark" data-den="text">
                  <span className="den-n" aria-hidden>
                    {m.n}
                  </span>
                  <span className="den-label">{m.label}</span>
                </p>
                <h3 className="den-h" data-den="text">
                  {m.headline}
                </h3>
                <p className="den-d" data-den="text">
                  {m.body}
                </p>
                <p className="den-foot" data-den="text">
                  {stamp}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
