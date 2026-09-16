"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import {
  gsap,
  parallax,
  reduced,
  registerGsap,
  revealImageOnScroll,
  revealLinesOnScroll,
  riseOnScroll,
} from "@/components/motion/gsap";

export interface Tier {
  code: string;
  name: string;
  headline: string;
  bullets: string[];
}

/**
 * Commercial tiers — the lead tier, then the register.
 *
 * WHAT CHANGED AND WHY. The previous pass dressed each tier as a rounded
 * card: 22px radii, a tinted fill, a drop shadow, a 40px circular number
 * badge and the inclusions broken into pill tags. That is a product-page
 * card deck, and it read as one — the inclusions in particular stopped being
 * sentences and became tag soup, and none of it belonged to the sharp-edged
 * editorial language the rest of the site is built in.
 *
 * This is a composition instead of a deck. Tier 01 opens the section as a
 * hero: the photograph on the grid's left five columns, the tier itself on
 * the right seven, with a ghosted display numeral anchoring the corner.
 * Tiers 02-04 run beneath as a register of three columns, each opened by a
 * single hairline rather than closed inside a box. No radii, no shadows, no
 * chips — the separation is done with space, scale and one rule each.
 *
 * ALIGNMENT. Everything in the section hangs off the same left edge as the
 * section heading above it, and the three register columns share a baseline:
 * the numeral, name and headline rows are the same height in each, so the
 * inclusion lists start on one line across all three. That is what the
 * headline's `min-height` is for — it holds two lines whether the copy fills
 * them or not.
 *
 * MOTION. Scroll-driven and staggered. The photograph wipes open and then
 * drifts against the scroll inside its own frame; the lead name rises in a
 * masked line; each register column's rule draws across before its copy
 * lifts in, one column after the next. Every primitive in
 * components/motion/gsap is a no-op under prefers-reduced-motion, and the
 * two tweens written out here carry that same guard explicitly. Nothing is
 * hidden by CSS, so with JS off the whole section still renders.
 *
 * CONTENT. Every tier code, name, headline and inclusion is passed in from
 * the page's own TIERS constant, brochure p. 19, verbatim. Nothing here adds
 * a tier, a benefit, a price or a figure — the brochure states no prices, so
 * the section carries none. "Lead tier" is the one editorial label and it
 * describes position in the brochure's ordering, as it did before.
 */
export default function CommercialTiers({ tiers }: { tiers: Tier[] }) {
  const root = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const frame = el.querySelector("[data-pt-frame]");
      if (frame) revealImageOnScroll(frame, el);

      // Depth, not sliding. The media wrapper is 114% of the frame height,
      // so a ±5% drift never exposes an edge.
      const media = el.querySelector("[data-pt-media]");
      if (media) parallax(media, el, 5);

      const name = el.querySelectorAll("[data-pt-name] > span");
      if (name.length) revealLinesOnScroll(name, el, { stagger: 0.08 });

      const lead = el.querySelectorAll("[data-ptc-lead-rise]");
      if (lead.length) riseOnScroll(lead, el, { y: 18, stagger: 0.05 });

      // The register: each column's rule draws across, then its copy lifts
      // in behind it, one column after the next.
      el.querySelectorAll<HTMLElement>("[data-ptc-lane]").forEach((lane, i) => {
        const delay = i * 0.12;
        const rule = lane.querySelector("[data-pt-rule]");
        if (rule && !reduced()) {
          gsap.fromTo(
            rule,
            { scaleX: 0 },
            {
              scaleX: 1,
              duration: 0.9,
              delay,
              ease: "power3.out",
              scrollTrigger: { trigger: lane, start: "top 85%", once: true },
            }
          );
        }
        const copy = lane.querySelectorAll("[data-pt-rise]");
        if (copy.length && !reduced()) {
          gsap.fromTo(
            copy,
            { y: 20, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.75,
              delay: delay + 0.1,
              ease: "power3.out",
              stagger: 0.05,
              scrollTrigger: { trigger: lane, start: "top 85%", once: true },
            }
          );
        }
      });
    }, el);
    return () => ctx.revert();
  }, [tiers]);

  const [lead, ...rest] = tiers;
  if (!lead) return null;

  return (
    <div className="ptc-root" ref={root}>
      {/* ---- 01, the lead tier ---- */}
      <div className="ptc-lead">
        <figure className="ptc-photo" data-pt-frame>
          <div className="ptc-media" data-pt-media>
            {/* `-web` derivative, not the 5.6MB master beside it: the master
                stays in the repo untouched, per scripts/optimize-images.mjs.
                The frame is decorative — the tiers are the content — so the
                alt stays empty rather than describing stock imagery. */}
            <Image
              src="/assets/photo/the-partners-web.jpg"
              alt=""
              fill
              sizes="(max-width: 899px) 100vw, 42vw"
              style={{ objectPosition: "50% 52%" }}
            />
          </div>
        </figure>

        <article className="ptc-body">
          <span className="ptc-n" aria-hidden>
            {lead.code}
          </span>

          <p className="ptc-kicker" data-ptc-lead-rise>
            <span>Lead tier</span>
          </p>

          {/* The masked line is decorative geometry, so the accessible name
              is stated once on the heading itself. */}
          <h3 className="ptc-name" aria-label={lead.name}>
            <span className="mq-line" data-pt-name>
              <span>{lead.name}</span>
            </span>
          </h3>

          <p className="ptc-head" data-ptc-lead-rise>
            {lead.headline}
          </p>

          <ul className="ptc-incl ptc-incl-lead">
            {lead.bullets.map((b) => (
              <li key={b} data-ptc-lead-rise>
                <span className="ptc-mark" aria-hidden />
                {b}
              </li>
            ))}
          </ul>
        </article>
      </div>

      {/* ---- 02-04, the register ---- */}
      <div className="ptc-register">
        {rest.map((t) => (
          <article className="ptc-lane" key={t.code} data-ptc-lane>
            <span className="ptc-lane-rule" data-pt-rule aria-hidden />
            <span className="ptc-lane-n" data-pt-rise aria-hidden>
              {t.code}
            </span>
            <h3 className="ptc-lane-name" data-pt-rise>
              {t.name}
            </h3>
            <p className="ptc-lane-head" data-pt-rise>
              {t.headline}
            </p>
            <ul className="ptc-incl">
              {t.bullets.map((b) => (
                <li key={b} data-pt-rise>
                  <span className="ptc-mark" aria-hidden />
                  {b}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
