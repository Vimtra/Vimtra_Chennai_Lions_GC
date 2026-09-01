"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  gsap,
  registerGsap,
  revealImage,
  revealLines,
  rise,
} from "@/components/motion/gsap";
import type { PlayerFeature } from "@/data/players";

/**
 * The players page, as one experience.
 *
 * Replaces the previous grid of four equal portrait cards followed by four
 * stacked feature sections, which said the same thing twice. Here a single
 * editorial selector runs across the top and one player is featured at a
 * time: large portrait, name, verified metadata, the approved biography,
 * and — only where the data actually carries them — statistics and
 * signature moments.
 *
 * Everything rendered comes from data/players.ts, which is sourced entirely
 * from the Season 2026 brochure. A player with no `meta`, no `stats` or no
 * `sideCards` simply renders without them; nothing is padded out.
 *
 * The selector is a set of buttons rather than an ARIA tablist: a tablist
 * contracts to implement roving tabindex and arrow-key navigation, and
 * claiming the role without that behaviour is worse for screen-reader users
 * than not claiming it. `aria-pressed` states the selection and the panel
 * is a polite live region, so a change is announced.
 *
 * Deep links keep working: /players#sethie selects that player on mount,
 * and choosing a player rewrites the hash with replaceState so the URL
 * stays shareable without filling the back button.
 */
export default function PlayerExperience({
  players,
}: {
  players: PlayerFeature[];
}) {
  const [active, setActive] = useState(0);
  const root = useRef<HTMLElement | null>(null);
  const panel = useRef<HTMLDivElement | null>(null);

  // Deep link → selection. Runs after mount so the server and client render
  // the same first player and hydration stays clean.
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    const i = players.findIndex((p) => p.anchor === hash);
    if (i > 0) setActive(i);
  }, [players]);

  // Entrance, and the transition between players.
  useEffect(() => {
    registerGsap();
    const el = panel.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      const img = revealImage("[data-plx-fig]", { from: "bottom", duration: 0.9 });
      if (img) tl.add(img, 0);
      const name = revealLines("[data-plx-name] > span", { stagger: 0.08 });
      if (name) tl.add(name, 0.12);
      const tail = rise("[data-plx-rise]", { y: 16, stagger: 0.06 });
      if (tail) tl.add(tail, 0.3);
    }, el);
    return () => ctx.revert();
  }, [active]);

  const select = useCallback(
    (i: number) => {
      setActive(i);
      const a = players[i]?.anchor;
      // `select` only ever runs from a click, so every call is a real
      // choice by the visitor and the URL should follow it. replaceState
      // keeps the link shareable without filling the back button.
      if (a) window.history.replaceState(null, "", `#${a}`);
    },
    [players]
  );

  const p = players[active];
  if (!p) return null;

  return (
    <section ref={root} className="hp-sec hp-sec-ivory hm-sec" id="roster">
      <div className="hp-wrap">
        {/* Editorial selector — a contents strip, not a control panel. */}
        <div className="plx-nav" role="group" aria-label="Select a player">
          {players.map((pl, i) => (
            <button
              key={pl.anchor}
              type="button"
              className={`plx-nav-btn ${i === active ? "is-active" : ""}`.trim()}
              aria-pressed={i === active}
              onClick={() => select(i)}
            >
              <span className="plx-nav-n">{String(i + 1).padStart(2, "0")}</span>
              <span className="plx-nav-body">
                <span className="plx-nav-name">{pl.name}</span>
                <span className="plx-nav-role">{pl.badgeSub}</span>
              </span>
            </button>
          ))}
        </div>

        {/* Featured player. Keyed so React remounts it and the timeline
            above plays on every change. */}
        <div
          className="cm-track plx-feature"
          ref={panel}
          key={p.anchor}
          aria-live="polite"
        >
          <div className="plx-portrait-col">
            <figure className="plx-portrait" data-plx-fig>
              <Image
                src={p.image}
                alt={`${p.name} — Vimtra Chennai Lions GC`}
                fill
                priority={active === 0}
                sizes="(max-width: 1023px) 100vw, 42vw"
                style={{ objectPosition: "50% 16%" }}
              />
            </figure>
          </div>

          <div className="plx-info">
            <p className="cm-eyebrow" data-plx-rise>
              {p.eyebrow}
            </p>

            {/* Given name on the first line, everything else on the
                second. Splitting on the LAST word instead would orphan the
                trailing initial of "Yashas Chandra M S" onto its own line.
                The masked lines are decorative geometry, so the accessible
                name is stated once on the heading itself — otherwise the
                two block spans concatenate without a space. */}
            <h2 className="plx-name" aria-label={p.name}>
              {(() => {
                const [given, ...rest] = p.name.split(" ");
                const lines = rest.length ? [given, rest.join(" ")] : [given];
                return lines.map((l) => (
                  <span className="mq-line" data-plx-name key={l}>
                    <span>{l}</span>
                  </span>
                ));
              })()}
            </h2>

            {p.meta && (
              <p className="plx-meta" data-plx-rise>
                {p.meta}
              </p>
            )}

            <div className="plx-bio">
              {p.paragraphs.map((para, i) => (
                <p
                  key={i}
                  data-plx-rise
                  // Trusted, in-repo copy from data/players.ts — the only
                  // markup it carries is <strong> on brochure-verified
                  // figures. No user input reaches this.
                  dangerouslySetInnerHTML={{ __html: para }}
                />
              ))}
            </div>

            {/* Only rendered where the brochure actually supplies them. */}
            {p.sideCards && p.sideCards.length > 0 && (
              <ul className="plx-moments" data-plx-rise>
                {p.sideCards.map((c) => (
                  <li key={c.title}>
                    <span className="plx-moment-k">{c.label}</span>
                    <span className="plx-moment-t">{c.title}</span>
                    <span className="plx-moment-s">{c.sub}</span>
                  </li>
                ))}
              </ul>
            )}

            {p.stats && p.stats.length > 0 && (
              <dl className="plx-stats" data-plx-rise>
                {/* Keyed by position, not label: a player can legitimately
                    carry two stats with the same label (Dwivedi has "Active
                    Circuit" twice, for PGTI and IGPL), and keying on the
                    label collides. */}
                {p.stats.map((s, i) => (
                  <div key={`${s.v}-${s.l}-${i}`}>
                    <dt>{s.v}</dt>
                    <dd>{s.l}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
