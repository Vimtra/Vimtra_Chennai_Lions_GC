"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  gsap,
  registerGsap,
  parallax,
  revealLines,
  rise,
} from "@/components/motion/gsap";

/**
 * The Club — opening gate.
 *
 * WHY THIS EXISTS. `/the-club` used to open on the shared `StoryHero`, which
 * eleven other routes also use: one full-bleed photograph with the display
 * type laid over its lower-left corner. On the page that is supposed to
 * introduce the franchise itself, the opener was indistinguishable from
 * /players, /invest, /fixtures and the rest. `StoryHero` is untouched — it
 * still serves those pages — and this component belongs to The Club alone.
 *
 * WHAT IT IS. A split gate rather than a banner: the photograph holds the
 * left of the frame, edge to edge, and the type sits on a deep-ink panel to
 * its right. The two never overlap, so the display line needs no scrim to be
 * legible and the photograph is never dimmed to make room for it. A gold
 * hairline runs the full height of the seam between them with a crimson
 * marker set into it — the page's first statement of the two brand colours
 * as a graphic, not as decoration.
 *
 * Because the type has its own column, "THE" and "CLUB" break onto two lines
 * at a scale a full-bleed hero could not carry without colliding with the
 * picture.
 *
 * At phone and tablet widths the split becomes a stack — photograph above,
 * ink panel below — which is a deliberate two-part composition, not the
 * desktop layout collapsed: the seam rotates from vertical to horizontal and
 * keeps its marker.
 *
 * `/the-club` is in FLOATING_HEADER_ROUTES, so the section reserves header
 * height itself rather than letting the header sit above it.
 *
 * All motion runs through the shared primitives, which are no-ops under
 * prefers-reduced-motion, and GSAP sets every "from" state — with JS off the
 * gate still renders complete.
 */
export default function ClubHero() {
  const root = useRef<HTMLElement | null>(null);

  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      // The picture opens first and slowly — it is the subject.
      tl.fromTo(
        "[data-clh-media] img",
        { scale: 1.14 },
        { scale: 1, duration: 2.1, ease: "power2.out" },
        0
      );
      // The seam itself is never tweened: it is 2px of geometry, and
      // content that small should not depend on an animation having run.
      const e = rise("[data-clh-eyebrow]", { y: 12, duration: 0.6 });
      if (e) tl.add(e, 0.34);
      const l = revealLines("[data-clh-line] > span", { stagger: 0.1 });
      if (l) tl.add(l, 0.46);
      const t = rise("[data-clh-tail]", { y: 18, stagger: 0.09 });
      if (t) tl.add(t, 0.95);

      const media = el.querySelector("[data-clh-media]");
      if (media) parallax(media, el, 4);
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="cl-hero" aria-label="The Club">
      <div className="cl-hero-media" data-clh-media>
        <Image
          src="/assets/photo/club-hero-fairway-dusk.jpg"
          alt="A championship fairway and treeline under a dusk sky"
          fill
          priority
          sizes="(max-width: 1023px) 100vw, 56vw"
          style={{ objectPosition: "52% 52%" }}
        />
        <span className="cl-hero-veil" aria-hidden />
      </div>

      <div className="cl-hero-seam" aria-hidden>
        <span className="cl-hero-seam-rule" />
        <span className="cl-hero-seam-mark" />
      </div>

      <div className="cl-hero-panel">
        <div className="cl-hero-inner">
          <p className="cl-hero-eyebrow" data-clh-eyebrow>
            AM Green IGPL · Season 2026
          </p>

          <h1 className="cl-hero-title">
            <span className="mq-line" data-clh-line>
              <span>THE</span>
            </span>
            <span className="mq-line" data-clh-line>
              <span>CLUB</span>
            </span>
          </h1>

          <p className="cl-hero-line" data-clh-tail>
            Chennai&apos;s franchise in the AM Green Indian Golf Premier
            League. Owned outright by Vimtra Ventures.
          </p>

          <p className="cl-hero-cta" data-clh-tail>
            <Link href="/players" className="hp-btn hp-btn-ghost hp-on-dark">
              MEET THE PRIDE
              <span className="hp-arrow" aria-hidden>
                →
              </span>
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
