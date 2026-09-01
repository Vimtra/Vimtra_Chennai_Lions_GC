"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap, registerGsap, revealLines, rise } from "@/components/motion/gsap";

/**
 * Home hero — campaign opener.
 *
 * One composed field rather than a text block sitting on a background.
 * The photograph is art-directed: the source is a 1:1 aerial of the
 * course at golden hour, so on a wide frame the crop is chosen (see
 * `.hero-img` object-position) instead of defaulting to centre and
 * losing the clubhouse and horizon.
 *
 * The type is staged across the frame as a poster — PRIDE flush to the
 * left edge, a tracked gold connector, then CHENNAI stepped inward. The
 * step echoes the converging V of the lion mark.
 *
 * Deliberately no player portrait: the homepage is the club, the city
 * and the season. Player photography belongs to /players.
 *
 * Copy is the franchise's own brand line ("Pride of Chennai", brochure
 * p.06 "The Mark") and the brochure-verified Season 2026 opener.
 *
 * The image is the only `priority` media on the page.
 */
export default function Hero() {
  const root = useRef<HTMLElement | null>(null);

  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el) return;
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
      // 0.95 — supporting rail, then the foot
      const tail = rise("[data-tail]", { y: 14, stagger: 0.07 });
      if (tail) tl.add(tail, 0.95);
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="hero" aria-label="Pride of Chennai">
      <div className="hero-media" data-media>
        <Image
          src="/assets/fac-main-web.jpg"
          alt="The Chennai Lions' home course at golden hour — clubhouse, lake and hill line"
          fill
          priority
          // fac-main-web.jpg is a 1024px source; asking for 1920 would
          // upscale it. Cap at the real resolution.
          sizes="(max-width: 1080px) 100vw, 1080px"
          className="hero-img"
        />
        <div className="hero-veil" data-veil aria-hidden />
        <div className="v-grain" aria-hidden />
      </div>

      <div className="hero-grid hp-wrap">
        <p className="hero-marker" data-marker>
          <i aria-hidden />
          Vimtra Chennai Lions GC
          <span>Season 2026</span>
        </p>

        <h1 className="hero-type">
          <span className="hero-row">
            <span className="mq-line" data-line>
              <span>PRIDE</span>
            </span>
            <span className="hero-of" aria-hidden>
              OF
            </span>
          </span>
          <span className="mq-line hero-w2" data-line>
            <span>CHENNAI</span>
          </span>
        </h1>

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

      {/* Foot rail: the scroll cue anchors the left edge, the season
          opener the right — so the frame reads as a poster with all
          four corners resolved. */}
      <div className="hero-foot hp-wrap" data-tail>
        <span className="hero-cue" aria-hidden>
          <i className="v-chev" />
          Scroll
        </span>
        <span className="hero-next">
          <span className="hero-k">Next</span>
          <span className="hero-v">Al Hamra Golf Club</span>
          <span className="hero-s">Ras Al Khaimah, UAE</span>
          <Link href="/fixtures" className="hero-date">
            23—25 Sep 2026
            <span className="hp-arrow" aria-hidden>
              →
            </span>
          </Link>
        </span>
      </div>
    </section>
  );
}
