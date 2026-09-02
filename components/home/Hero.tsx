"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap, registerGsap, reduced, revealLines, rise } from "@/components/motion/gsap";

/**
 * Home hero — centre-stage campaign opener.
 *
 * Composed in depth rather than as a text block on a background:
 *
 *   photograph → veil → spotlight → display type → FIGURE → scrim → UI
 *
 * The cut-out golfer stands in the centre of the frame and crosses the
 * display type, so the headline reads as a printed backdrop the figure is
 * standing in front of. That occlusion is the whole point of the layer
 * order — the type is real text and stays in the accessibility tree, it is
 * simply overlapped by the figure the way a poster would overlap it.
 *
 * The source cut-out (`hero-golfer.png`, 1024²) carries a full-width strip
 * of turf with a hard horizontal top edge, and the figure itself fills only
 * the middle 38% of the canvas. `hero-golfer-cut.png` is that same artwork
 * cropped to the figure column (see the note in globals.css), so it can be
 * sized by height without the transparent margins pushing it off-frame.
 * The remaining turf is dissolved by a mask rather than cropped away, which
 * keeps the figure grounded instead of floating.
 *
 * Copy is unchanged and remains the franchise's own: the brand line
 * "Pride of Chennai" (brochure p.06 "The Mark") and the real next fixture,
 * read from the database by app/page.tsx.
 */
export interface HeroNext {
  name: string;
  place: string;
  dates: string;
}

/**
 * `next` is the real next UPCOMING fixture, read from the database and
 * passed down by app/page.tsx. When there is no upcoming fixture the foot
 * rail renders the scroll cue alone rather than inventing one.
 */
export default function Hero({ next }: { next?: HeroNext | null }) {
  const root = useRef<HTMLElement | null>(null);

  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el) return;
    // Every element's resting state is its final one, so under reduced
    // motion there is simply no timeline. (rise/revealLines already no-op;
    // the veil fade and the frame's opening scale did not, and the scale
    // is exactly the kind of motion the preference asks us to drop.)
    if (reduced()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      // 0.00 — atmosphere settles before anything moves
      tl.fromTo("[data-veil]", { opacity: 0 }, { opacity: 1, duration: 0.9 }, 0);
      // 0.05 — the frame opens, slowly
      tl.fromTo(
        "[data-media]",
        { scale: 1.07 },
        { scale: 1, duration: 1.9, ease: "power2.out" },
        0.05
      );
      // 0.40 — season marker
      const mk = rise("[data-marker]", { y: 10, duration: 0.6 });
      if (mk) tl.add(mk, 0.4);
      // 0.50 — the headline, word by word
      const ln = revealLines("[data-line] > span", { stagger: 0.13 });
      if (ln) tl.add(ln, 0.5);
      // 0.50 — the stage light comes up
      tl.fromTo(
        "[data-glow]",
        { opacity: 0 },
        { opacity: 1, duration: 1.6, ease: "power2.out" },
        0.5
      );
      // 0.62 — the figure steps into the frame, behind the last word and
      //        slower than the type so it reads as arriving, not sliding.
      tl.fromTo(
        "[data-figure]",
        { yPercent: 5, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.5, ease: "power3.out" },
        0.62
      );
      // 1.05 — supporting rail, then the foot
      const tail = rise("[data-tail]", { y: 14, stagger: 0.07 });
      if (tail) tl.add(tail, 1.05);
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="hero" aria-label="Pride of Chennai">
      <div className="hero-media" data-media>
        <Image
          src="/assets/photo/home-hero-sunset-green.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="hero-img"
        />
        <div className="hero-veil" data-veil aria-hidden />
        <div className="v-grain" aria-hidden />
      </div>

      {/* Stage light behind the figure — brand crimson at the base, gold
          above it. Lifts the cut-out off the photograph so its edge is a
          silhouette rather than a sticker. */}
      <div className="hero-glow" data-glow aria-hidden />

      <div className="hero-grid hp-wrap">
        <p className="hero-marker" data-marker>
          <i aria-hidden />
          Vimtra Chennai Lions GC
          <span>Season 2026</span>
        </p>

        <div className="hero-stage">
          <h1 className="hero-type">
            <span className="hero-row">
              <span className="mq-line" data-line>
                <span>PRIDE</span>
              </span>
              <span className="hero-of" aria-hidden>
                OF
              </span>
            </span>
            <span className="mq-line" data-line>
              <span>CHENNAI</span>
            </span>
          </h1>
        </div>

        <div className="hero-rail">
          <p className="hero-lead" data-tail>
            Chennai&rsquo;s franchise in the AM Green Indian Golf Premier
            League. A team built for the long game.
          </p>
          <Link href="/fixtures" className="hero-cta" data-tail>
            EXPLORE THE SEASON
            <span className="hp-arrow" aria-hidden>
              →
            </span>
          </Link>
        </div>
      </div>

      {/* The figure sits outside the padded wrap: it is anchored to the
          frame, not to the text column, and never takes pointer events so
          the rail and foot links underneath it stay clickable. */}
      <div className="hero-figure" data-figure>
        <Image
          src="/assets/hero-golfer-cut.png"
          alt="A golfer at the moment of impact, driving from the tee"
          width={428}
          height={968}
          priority
          sizes="(max-width: 767px) 240px, 320px"
          className="hero-cut"
        />
      </div>

      {/* Base scrim: dissolves the turf into the frame and seats the copy,
          the CTA and the foot rail on ink instead of on khaki. */}
      <div className="hero-base" aria-hidden />

      {/* Foot rail: the scroll cue anchors the left edge, the season
          opener the right — so the frame reads as a poster with all
          four corners resolved. */}
      <div className="hero-foot hp-wrap" data-tail>
        <span className="hero-cue" aria-hidden>
          <i className="v-chev" />
          Scroll
        </span>
        {next && (
          <span className="hero-next">
            <span className="hero-k">Next</span>
            <span className="hero-v">{next.name}</span>
            <span className="hero-s">{next.place}</span>
            <Link href="/fixtures" className="hero-date">
              {next.dates}
              <span className="hp-arrow" aria-hidden>
                →
              </span>
            </Link>
          </span>
        )}
      </div>
    </section>
  );
}
