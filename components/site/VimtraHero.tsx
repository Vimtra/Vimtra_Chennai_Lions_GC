"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import {
  gsap,
  registerGsap,
  parallax,
  revealLines,
  rise,
} from "@/components/motion/gsap";

/**
 * Vimtra Ventures opener.
 *
 * WHAT CHANGED. The page used to open on `StoryHero` pointed at a REMOTE
 * Unsplash URL of a circuit board — an image the site did not own, could not
 * guarantee would still resolve, and which said "technology company" about a
 * firm whose own six verticals are led by real estate, golf communities and
 * sports franchises. It is replaced by a frame the repository already holds
 * and already documents: `vv-hero-cliffside-community.jpg`, cliffside homes
 * above a coastal green — golf-integrated luxury residential, which is
 * literally two of the firm's verticals in one photograph. (See
 * public/assets/photo/CREDITS.md, which already listed this file against
 * this hero.) Nothing on the page is loaded from a third-party host any more.
 *
 * WHAT IT IS. Not a full-bleed banner. The photograph is a PLATE held to the
 * right of the frame, running the section's full height and bleeding off the
 * page edge, with its inner edge dissolved into the ink ground so there is no
 * seam and no letterbox. The display type sits on the ink at the left and its
 * final line runs into that dissolve. `/vimtra-ventures` is in
 * FLOATING_HEADER_ROUTES, so the section reserves header height itself.
 *
 * No credential rail here: the firm's four documented figures (1995, 60+,
 * 55+, 6) are the opening section's, and stating them twice on one page
 * would be the duplication this redesign is removing elsewhere.
 *
 * Motion runs through the shared primitives, which are no-ops under
 * prefers-reduced-motion; GSAP sets every "from" state, so the hero renders
 * complete with JS off.
 */
export default function VimtraHero() {
  const root = useRef<HTMLElement | null>(null);

  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo(
        "[data-vh-media] img",
        { scale: 1.12 },
        { scale: 1, duration: 2, ease: "power2.out" },
        0
      );
      const e = rise("[data-vh-eyebrow]", { y: 12, duration: 0.6 });
      if (e) tl.add(e, 0.2);
      const l = revealLines("[data-vh-line] > span", { stagger: 0.1 });
      if (l) tl.add(l, 0.32);
      const t = rise("[data-vh-tail]", { y: 16, stagger: 0.08 });
      if (t) tl.add(t, 0.78);

      const media = el.querySelector("[data-vh-media]");
      if (media) parallax(media, el, 4);
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="vv-hero" aria-label="Vimtra Ventures">
      <div className="vv-hero-plate">
        <div className="vv-hero-media" data-vh-media>
          <Image
            src="/assets/photo/vv-hero-cliffside-community.jpg"
            alt=""
            fill
            priority
            sizes="(max-width: 1023px) 100vw, 60vw"
            style={{ objectPosition: "58% 46%" }}
          />
        </div>
        <div className="vv-hero-dissolve" aria-hidden />
      </div>

      <div className="vv-hero-aurora" aria-hidden />
      <div className="v-grain" aria-hidden />

      <div className="hp-wrap vv-hero-inner">
        <div className="vv-hero-head">
          <p className="cm-eyebrow" data-vh-eyebrow>
            Ownership · The Firm
          </p>
          <h1 className="vv-hero-title">
            <span className="mq-line" data-vh-line>
              <span>VIMTRA</span>
            </span>
            <span className="mq-line" data-vh-line>
              <span>VENTURES</span>
            </span>
          </h1>
          <p className="vv-hero-line" data-vh-tail>
            The brain behind the team.
          </p>
        </div>
      </div>
    </section>
  );
}
