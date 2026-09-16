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
import type { PlayerFeature } from "@/data/players";

/**
 * The roster, read end to end.
 *
 * Four full profiles in squad order — no selector, no active player, no hash
 * selection. Everything is rendered; the page is read by scrolling it.
 *
 * COMPOSITION. Each profile holds the full width on its own ground tone
 * (`bg`, from the data) and alternates the side its portrait sits on
 * (`reverse`, also from the data), so the eye resets at every player without
 * a decorative divider. Both columns land on the page grid — portrait on
 * columns 1-5, copy on 7-12, mirrored when flipped — so the outer edges stay
 * on the same verticals as every other section of the site.
 *
 * TYPE. The copy column is one flush-left edge with a deliberate scale
 * rhythm: micro-caps label, display name, fine metadata, then the figures at
 * a size that competes with the name. Rules are used once each and never as
 * boxes — a gold gradient rule closes the label line, a single hairline opens
 * the figures, and each signature moment carries a gold spine rather than a
 * bullet and a border. That is the difference between this and the boxed,
 * evenly-spaced version it replaces.
 *
 * MOTION. Per-profile and scroll-driven, so players arrive as you reach them:
 * the portrait wipes open and then drifts against the scroll inside its own
 * frame, the name rises in masked lines, and the copy staggers in behind it.
 * The drift is why the media wrapper is oversized — see `.plr-media`. Every
 * primitive in components/motion/gsap is a no-op under prefers-reduced-motion
 * and none of them hides content via CSS, so with JS off or motion reduced
 * the whole roster is still fully readable.
 *
 * Everything rendered comes from data/players.ts, sourced entirely from the
 * Season 2026 brochure. A player with no `meta`, no `stats` or no `sideCards`
 * renders without them; nothing is padded out.
 *
 * Section ids are kept so /players#sethie still scrolls to that player. That
 * is plain anchor navigation — the hash selects nothing, because there is
 * nothing to select.
 */
export default function PlayerExperience({
  players,
}: {
  players: PlayerFeature[];
}) {
  const root = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      el.querySelectorAll<HTMLElement>("[data-plr-player]").forEach((player) => {
        const frame = player.querySelector("[data-plr-frame]");
        if (frame) revealImageOnScroll(frame, player);

        // Depth, not sliding. The wrapper is 114% of the frame height, so a
        // ±5% drift never exposes an edge.
        const media = player.querySelector("[data-plr-media]");
        if (media) parallax(media, player, 5);

        const name = player.querySelectorAll("[data-plr-name] > span");
        if (name.length) revealLinesOnScroll(name, player, { stagger: 0.09 });

        // The copy staggers in as one run, in document order, so the label,
        // metadata, figures and paragraphs arrive behind the name rather
        // than all at once.
        const tail = player.querySelectorAll("[data-plr-rise]");
        if (tail.length) riseOnScroll(tail, player, { y: 18, stagger: 0.05 });

        // Each moment's gold spine draws down as its row lands. This is the
        // one tween written out here rather than taken from the motion
        // module, so it carries the module's own reduced-motion contract
        // explicitly: no tween is created, and CSS leaves the spine at full
        // height, so the rule is simply there from the start.
        const spines = player.querySelectorAll("[data-plr-spine]");
        if (spines.length && !reduced()) {
          gsap.fromTo(
            spines,
            { scaleY: 0 },
            {
              scaleY: 1,
              duration: 0.7,
              ease: "power3.out",
              stagger: 0.08,
              scrollTrigger: { trigger: player, start: "top 70%", once: true },
            }
          );
        }
      });
    }, el);
    return () => ctx.revert();
  }, [players]);

  return (
    <div className="plr-roster" ref={root}>
      {/* The masthead carries the first player's ground tone rather than the
          page ivory, so the roster opens into profile 01 seamlessly instead
          of banding against it — the alternation should be the only tonal
          change on the page. */}
      <section
        className="hp-sec plr-sec-head"
        style={{ background: players[0]?.bg }}
      >
        <div className="hp-wrap">
          <div className="plr-head">
            <p className="plr-head-k">Season 2026 · The Team Sheet</p>
            <p className="plr-head-note">Four players, in squad order.</p>
          </div>
        </div>
      </section>

      {players.map((p, i) => {
        // Given name on the first line, everything else on the second.
        // Splitting on the LAST word instead would orphan the trailing
        // initial of "Yashas Chandra M S" onto its own line.
        const [given, ...rest] = p.name.split(" ");
        const lines = rest.length ? [given, rest.join(" ")] : [given];

        // Which side the portrait sits on. `reverse` is honoured wherever the
        // data states it; where it is unset the side falls out of position in
        // the running order, so the roster alternates left/right/left/right
        // instead of stalling on two portraits down the same edge. Only
        // Sethie carries an explicit `reverse`, and index parity agrees with
        // it — this extends the same rhythm rather than overriding anything.
        const flip = p.reverse ?? i % 2 === 1;

        return (
          <article
            key={p.anchor}
            id={p.anchor}
            className="plr-player"
            data-plr-player
            data-flip={flip ? "true" : undefined}
            style={{ background: p.bg }}
            aria-labelledby={`plr-h-${p.anchor}`}
          >
            <div className="hp-wrap">
              <div className="plr-grid">
                <figure className="plr-figure">
                  <div className="plr-frame" data-plr-frame>
                    <div className="plr-media" data-plr-media>
                      <Image
                        src={p.image}
                        alt={`${p.name} — Vimtra Chennai Lions GC`}
                        fill
                        priority={i === 0}
                        sizes="(max-width: 1023px) 100vw, 40vw"
                        style={{ objectPosition: "50% 18%" }}
                      />
                    </div>
                    <span className="plr-n" aria-hidden>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                </figure>

                <div className="plr-detail">
                  <p className="plr-k" data-plr-rise>
                    <span>{p.eyebrow}</span>
                  </p>

                  {/* The masked lines are decorative geometry, so the
                      accessible name is stated once on the heading itself —
                      otherwise the two block spans concatenate without a
                      space. */}
                  <h2
                    className="plr-name"
                    id={`plr-h-${p.anchor}`}
                    aria-label={p.name}
                  >
                    {lines.map((l) => (
                      <span className="mq-line" data-plr-name key={l}>
                        <span>{l}</span>
                      </span>
                    ))}
                  </h2>

                  {p.meta && (
                    <p className="plr-meta" data-plr-rise>
                      {p.meta}
                    </p>
                  )}

                  {/* Only rendered where the brochure actually supplies them. */}
                  {p.stats && p.stats.length > 0 && (
                    <dl className="plr-stats" data-plr-rise>
                      {/* Keyed by position, not label: a player can
                          legitimately carry two stats with the same label,
                          and keying on the label collides. */}
                      {p.stats.map((s, si) => (
                        <div key={`${s.v}-${s.l}-${si}`}>
                          <dt>{s.v}</dt>
                          <dd>{s.l}</dd>
                        </div>
                      ))}
                    </dl>
                  )}

                  <div className="plr-body">
                    {p.paragraphs.map((para, pi) => (
                      <p
                        key={pi}
                        data-plr-rise
                        // Trusted, in-repo copy from data/players.ts — the
                        // only markup it carries is <strong> on
                        // brochure-verified figures. No user input reaches
                        // this.
                        dangerouslySetInnerHTML={{ __html: para }}
                      />
                    ))}
                  </div>

                  {p.sideCards && p.sideCards.length > 0 && (
                    <ul className="plr-moments">
                      {p.sideCards.map((c) => (
                        <li key={c.title} data-plr-rise>
                          <span
                            className="plr-moment-spine"
                            data-plr-spine
                            aria-hidden
                          />
                          <span className="plr-moment-k">{c.label}</span>
                          <span className="plr-moment-t">{c.title}</span>
                          <span className="plr-moment-s">{c.sub}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
