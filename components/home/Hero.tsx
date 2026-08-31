"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap, registerGsap, revealLines, rise } from "@/components/motion/gsap";

/**
 * Home hero — brand-first, full viewport.
 *
 * The frame is a single environmental photograph of the course at golden
 * hour (clubhouse, water, hill line). It is the whole composition, not an
 * element inside one: the image is full-bleed and the typography sits on
 * it. Deliberately no player portrait — the homepage represents the club,
 * the city and the season; player photography belongs to /players.
 *
 * Copy is the franchise's own brand line ("Pride of Chennai", brochure
 * p.06 "The Mark") plus the brochure-verified Season 2026 opener. Nothing
 * is invented.
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
      // 0.00 atmosphere settles
      tl.fromTo("[data-scrim]", { opacity: 0 }, { opacity: 1, duration: 0.8 }, 0);
      // 0.10 the frame opens
      tl.fromTo(
        "[data-frame]",
        { scale: 1.08 },
        { scale: 1, duration: 1.6, ease: "power2.out" },
        0.1
      );
      // 0.35 rubric
      const eb = rise("[data-eyebrow]", { y: 12, duration: 0.6 });
      if (eb) tl.add(eb, 0.35);
      // 0.45 headline, line by line
      const ln = revealLines("[data-line] > span", { stagger: 0.11 });
      if (ln) tl.add(ln, 0.45);
      // 0.85 supporting rail + CTA
      const tail = rise("[data-tail]", { y: 16, stagger: 0.08 });
      if (tail) tl.add(tail, 0.85);
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="hero" aria-label="Pride of Chennai">
      {/* Full-bleed environmental frame */}
      <div className="hero-frame" data-frame>
        <Image
          src="/assets/fac-main-web.jpg"
          alt="A championship golf course at golden hour — the Chennai Lions' home ground"
          fill
          priority
          sizes="100vw"
          className="hero-img"
        />
      </div>
      <div className="hero-scrim" data-scrim aria-hidden />

      <div className="hero-inner hp-wrap">
        <p className="hero-eyebrow" data-eyebrow>
          Vimtra Chennai Lions GC
          <span>Season 2026</span>
        </p>

        <h1 className="hero-title">
          <span className="mq-line" data-line>
            <span>PRIDE OF</span>
          </span>
          <span className="mq-line" data-line>
            <span>CHENNAI</span>
          </span>
        </h1>

        <div className="hero-rail">
          <p className="hero-lead" data-tail>
            Chennai&rsquo;s franchise in the AM Green Indian Golf Premier
            League. A team built for the long game.
          </p>
          <Link href="/the-club" className="hero-cta" data-tail>
            EXPLORE THE CLUB
            <span className="hp-arrow" aria-hidden>
              →
            </span>
          </Link>
        </div>
      </div>

      {/* Season opener — quiet editorial metadata pinned to the frame edge */}
      <div className="hero-meta hp-wrap" data-tail>
        <span className="hero-meta-k">Next</span>
        <span className="hero-meta-v">Al Hamra Golf Club</span>
        <span className="hero-meta-s">Ras Al Khaimah, UAE</span>
        <Link href="/fixtures" className="hero-meta-link">
          23—25 Sep 2026
          <span className="hp-arrow" aria-hidden>
            →
          </span>
        </Link>
      </div>
    </section>
  );
}
