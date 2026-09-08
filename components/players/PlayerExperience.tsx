"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  gsap,
  registerGsap,
  revealLines,
  rise,
} from "@/components/motion/gsap";
import type { PlayerFeature } from "@/data/players";

/**
 * The roster, then the dossier.
 *
 * WHAT CHANGED AND WHY. The previous version put a text-only selector across
 * the top and one player below it, so three of the four portraits were not on
 * the page until you clicked for them — a four-player franchise reading as a
 * one-player page. Every player is now on screen from the first paint: the
 * team sheet is a rank of four portrait plates, all four rendered in the same
 * 4:5 frame, at the same object-position, from four source files that are
 * themselves identical 1333×2000 originals. Nothing about the framing varies
 * player to player, so the rank reads as one photographed collection.
 *
 * Selecting a plate opens that player's dossier BENEATH the rank rather than
 * replacing it — the portrait stays visible while you read, and a crimson
 * notch under the selected plate points into the panel it opened. The dossier
 * itself is typographic: the portrait is already directly above it, so
 * repeating it there would put the same photograph on the page twice.
 *
 * Everything rendered comes from data/players.ts, sourced entirely from the
 * Season 2026 brochure. A player with no `meta`, no `stats` or no `sideCards`
 * renders without them; nothing is padded out and no player is added.
 *
 * The rank is a set of buttons rather than an ARIA tablist: a tablist
 * contracts to implement roving tabindex and arrow-key navigation, and
 * claiming the role without that behaviour is worse for screen-reader users
 * than not claiming it. `aria-pressed` states the selection, each button
 * points at the panel with `aria-controls`, and the panel is a polite live
 * region, so a change is announced.
 *
 * Deep links keep working: /players#sethie selects that player on mount, and
 * choosing a player rewrites the hash with replaceState so the URL stays
 * shareable without filling the back button.
 */
export default function PlayerExperience({
  players,
}: {
  players: PlayerFeature[];
}) {
  const [active, setActive] = useState(0);
  const panel = useRef<HTMLDivElement | null>(null);

  // Deep link → selection. Runs after mount so the server and client render
  // the same first player and hydration stays clean.
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    const i = players.findIndex((p) => p.anchor === hash);
    if (i > 0) setActive(i);
  }, [players]);

  // The dossier's entrance, replayed on every change. The rank above it is
  // never animated out — it is the part that must always be there.
  useEffect(() => {
    registerGsap();
    const el = panel.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      const name = revealLines("[data-plr-name] > span", { stagger: 0.08 });
      if (name) tl.add(name, 0);
      const tail = rise("[data-plr-rise]", { y: 16, stagger: 0.06 });
      if (tail) tl.add(tail, 0.18);
    }, el);
    return () => ctx.revert();
  }, [active]);

  const select = useCallback(
    (i: number) => {
      setActive(i);
      const a = players[i]?.anchor;
      // `select` only ever runs from a click, so every call is a real choice
      // by the visitor and the URL should follow it. replaceState keeps the
      // link shareable without filling the back button.
      if (a) window.history.replaceState(null, "", `#${a}`);
    },
    [players]
  );

  const p = players[active];
  if (!p) return null;

  return (
    <section className="hp-sec hp-sec-ivory plr-sec" id="roster">
      <div className="hp-wrap">
        <div className="plr-head">
          <p className="plr-head-k">Season 2026 · The Team Sheet</p>
          <p className="plr-head-note">
            Select a player to read the dossier.
          </p>
        </div>

        {/* THE RANK — every player, always. */}
        <ol className="plr-rank">
          {players.map((pl, i) => (
            <li key={pl.anchor}>
              <button
                type="button"
                className={`plr-plate${i === active ? " is-on" : ""}`}
                aria-pressed={i === active}
                aria-controls="plr-dossier"
                onClick={() => select(i)}
              >
                <span className="plr-frame">
                  <Image
                    src={pl.image}
                    alt={`${pl.name} — Vimtra Chennai Lions GC`}
                    fill
                    priority={i === 0}
                    sizes="(max-width: 639px) 50vw, (max-width: 1023px) 50vw, 24vw"
                    style={{ objectPosition: "50% 18%" }}
                  />
                  <span className="plr-n" aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </span>
                <span className="plr-id">
                  <span className="plr-name">{pl.name}</span>
                  <span className="plr-role">{pl.badgeSub}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>

        {/* THE DOSSIER — keyed so React remounts it and the timeline replays. */}
        <div
          className="cm-track plr-dossier"
          id="plr-dossier"
          ref={panel}
          key={p.anchor}
          aria-live="polite"
        >
          <div className="plr-dossier-rail">
            <p className="plr-dossier-k" data-plr-rise>
              {p.eyebrow}
            </p>

            {/* Given name on the first line, everything else on the second.
                Splitting on the LAST word instead would orphan the trailing
                initial of "Yashas Chandra M S" onto its own line. The masked
                lines are decorative geometry, so the accessible name is
                stated once on the heading itself — otherwise the two block
                spans concatenate without a space. */}
            <h2 className="plr-dossier-name" aria-label={p.name}>
              {(() => {
                const [given, ...rest] = p.name.split(" ");
                const lines = rest.length ? [given, rest.join(" ")] : [given];
                return lines.map((l) => (
                  <span className="mq-line" data-plr-name key={l}>
                    <span>{l}</span>
                  </span>
                ));
              })()}
            </h2>

            {p.meta && (
              <p className="plr-dossier-meta" data-plr-rise>
                {p.meta}
              </p>
            )}

            {/* Only rendered where the brochure actually supplies them. */}
            {p.stats && p.stats.length > 0 && (
              <dl className="plr-stats" data-plr-rise>
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

          <div className="plr-dossier-body">
            {p.paragraphs.map((para, i) => (
              <p
                key={i}
                data-plr-rise
                // Trusted, in-repo copy from data/players.ts — the only
                // markup it carries is <strong> on brochure-verified
                // figures. No user input reaches this.
                dangerouslySetInnerHTML={{ __html: para }}
              />
            ))}

            {p.sideCards && p.sideCards.length > 0 && (
              <ul className="plr-moments" data-plr-rise>
                {p.sideCards.map((c) => (
                  <li key={c.title}>
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
    </section>
  );
}
