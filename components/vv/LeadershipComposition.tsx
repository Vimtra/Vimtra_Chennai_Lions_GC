"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap, registerGsap, reduced, EASE } from "@/components/motion/gsap";

/**
 * Vimtra Ventures · 03 Leadership — the editorial portrait composition.
 *
 * Owns its whole section rather than sitting inside the shared `<Section>`
 * primitive. That is deliberate: `Section` wires one generic choreography
 * for everything under it (`[data-rise]` → riseOnScroll, `[data-line]` →
 * masked lines), and this composition needs a single ordered timeline —
 * label, heading, then each principal's portrait / index / name / biography
 * in sequence. Nesting a second ScrollTrigger context inside that one would
 * have animated the same nodes twice.
 *
 * The section's ground, rhythm and container are the site's own
 * (`hp-sec`, `hp-sec-ivory`, `hp-wrap`), so it still lands on the global
 * grid; only `.vvl-*` is new, and nothing here reaches another section.
 *
 * COMPOSITION. The heading is a LEFT RAIL and the two principals occupy
 * the right of the same grid row, so the portraits rise to the heading's
 * own top edge and the section opens on the people rather than on empty
 * ivory.
 *
 * The two principals are STRICTLY LEVEL. There is no vertical stagger
 * anywhere — no offset margin, no translate, no nth-child rule, and no
 * per-profile y difference in the timeline below. The pair reads as two
 * equal pillars, and the editorial character comes from the type, the gold
 * index marks and the spacing rather than from vertical displacement.
 * `.vvl-name` reserves a two-line block so the longer name's wrap cannot
 * push its biography off the shared baseline.
 *
 * DATA. Names, roles, biographies, photographs, alt text and crop origins
 * are passed straight through from FOUNDERS and rendered verbatim. Nothing
 * is derived, shortened or added, and the two portraits are the project's
 * existing assets.
 */

export interface Principal {
  name: string;
  role: string;
  image: string;
  imageAlt: string;
  imagePosition: string;
  body: string;
}

export default function LeadershipComposition({
  people,
}: {
  people: Principal[];
}) {
  const root = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // `reduced()` reads matchMedia, so it must not run during render —
    // this is the client-only entry point for all of it.
    if (reduced()) return;
    registerGsap();
    const el = root.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // One trigger for the whole section, fired once. Every tween sets its
      // own "from" state through fromTo, so nothing is hidden by CSS: if
      // this effect never runs, the section renders complete.
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top 78%", once: true },
      });

      tl.fromTo(
        "[data-vvl='label']",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: EASE },
        0
      );
      tl.fromTo(
        "[data-vvl='heading']",
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.75, ease: EASE },
        0.1
      );

      // Each principal resolves in the reading order the layout uses:
      // portrait, then index + role, then name, then biography.
      //
      // The ONLY difference between the two principals is WHEN they start —
      // `at` shifts the second one a beat later on the timeline. Both use
      // identical from-values and both resolve to y: 0, so the animation
      // cannot leave the pair off a shared baseline at any point, and the
      // resting layout is exactly level. Nothing here offsets a profile
      // vertically relative to the other.
      el.querySelectorAll("[data-vvl='person']").forEach((person, i) => {
        const at = 0.26 + i * 0.12;
        const fig = person.querySelector("[data-vvl='figure'] img");
        if (fig) {
          tl.fromTo(
            fig,
            { opacity: 0, scale: 1.02 },
            { opacity: 1, scale: 1, duration: 0.9, ease: EASE },
            at
          );
        }
        tl.fromTo(
          person.querySelectorAll("[data-vvl='text']"),
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, ease: EASE, stagger: 0.07 },
          at + 0.08
        );
      });
    }, el);

    // Reverts every tween AND kills the ScrollTrigger this context created,
    // so a remount never stacks a second instance.
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      className="hp-sec hp-sec-ivory hp-sec-default vvl-sec"
      aria-labelledby="vvl-title"
    >
      <div className="hp-wrap">
        <div className="vvl-grid">
          <header className="vvl-head">
            <p className="hp-index vvl-label" data-vvl="label">
              03 <span>Leadership</span>
            </p>
            <h2 className="vvl-title" id="vvl-title" data-vvl="heading">
              <span>THE PEOPLE</span>
              <span>BEHIND IT.</span>
            </h2>
          </header>

          {/* A `<ul>`: the source names two founders of equal standing and
              states no rank between them, so the markup asserts no order.
              The 01 / 02 marks are editorial indexing and are hidden from
              assistive tech for the same reason. */}
          <ul className="vvl-people">
            {people.map((p, i) => (
              <li className="vvl-person" key={p.name} data-vvl="person">
                <p className="vvl-mark" data-vvl="text">
                  <span className="vvl-n" aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="vvl-role">{p.role}</span>
                </p>

                <figure className="vvl-figure" data-vvl="figure">
                  <Image
                    src={p.image}
                    alt={p.imageAlt}
                    fill
                    sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1023px) calc(50vw - 60px), 34vw"
                    style={{ objectPosition: p.imagePosition }}
                  />
                </figure>

                <h3 className="vvl-name" data-vvl="text">
                  {p.name}
                </h3>
                <p className="vvl-bio" data-vvl="text">
                  {p.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
