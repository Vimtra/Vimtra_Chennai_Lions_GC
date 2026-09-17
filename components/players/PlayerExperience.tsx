"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import {
  gsap,
  registerGsap,
  revealImageOnScroll,
  revealLinesOnScroll,
} from "@/components/motion/gsap";
import type { PlayerFeature } from "@/data/players";

/**
 * THE TEAM SHEET — one marquee, three supporting profiles.
 *
 * Read end to end. No selector, no active player, no tabs, no accordion,
 * no hash selection: every profile is rendered and the page is read by
 * scrolling it. Section ids are kept so /players#sethie still scrolls to
 * that player — plain anchor navigation, selecting nothing.
 *
 * WHY IT LOOKS LIKE THIS
 * The previous composition ran four profiles of identical weight,
 * alternating the portrait left / right / left / right on an alternating
 * ground tone. Equal weight is the wrong statement for a team sheet — one
 * of these four is the marquee, and the page should say so before a word
 * is read. Side-alternation is also the most template-like device
 * available: it varies position while holding scale, shape and density
 * constant, which is the opposite of art direction.
 *
 * So the roster is composed as a decrescendo. Each profile differs in
 * SHAPE, SCALE and DENSITY, not merely in which edge the portrait sits on:
 *
 *   01  Bhullar   ink   · the lead spread. A 3:4 plate bled to the top edge
 *                         of the section, the name at display scale beside
 *                         it, and a full-width figure register whose rule is
 *                         the same line as the plate's lower edge — the one
 *                         alignment that binds image and type into a single
 *                         composition rather than two columns.
 *   02  Sethie    ivory · second lead. A wider 4:5 plate on the left, full
 *                         copy, full register, both signature moments.
 *   03  Dwivedi   ivory · the name runs the full measure as a masthead, and
 *                         below it three columns of three different kinds of
 *                         thing: a small plate, the prose, and the figures
 *                         set vertically instead of as a rail.
 *   04  Yashas    ivory · the closing entry. Type-led, the portrait reduced
 *                         to a narrow vertical band on the right, figures on
 *                         one line, tightest rhythm on the page.
 *
 * The portraits land on 8 / 5 / 4 / 3 columns and the sides run R / L / L / R,
 * so no two consecutive profiles share a shape and the sequence never reads
 * as a mirror.
 *
 * SURFACES. Two, not four. The marquee is the page's single dark field —
 * these are studio portraits on pale travertine, so on ink they read as lit
 * plates — and the three supporting profiles share one continuous ivory
 * ground. `bg`, `reverse` and `topBorder` on the data are deliberately not
 * read any more; the data file itself is untouched.
 *
 * RULES. Four on the whole page: one hairline opening each profile's figure
 * register. Profiles are separated by scale, whitespace and the single
 * ink-to-ivory transition — never by a divider.
 *
 * TYPE. Sora carries the names (the marquee uppercase as a wordmark, the
 * supporting three in sentence case, because not every heading should
 * shout). Manrope carries body, metadata and labels. Fraunces is given two
 * structural jobs and no decorative ones: every figure and ranking numeral,
 * and the title of each signature moment. It is set roman throughout —
 * never as a repeated italic flourish.
 *
 * MOTION. Two signature moments — the marquee plate wipes open, the marquee
 * name rises in masked lines — plus one quiet plate wipe per supporting
 * profile. Nothing else animates: no parallax, no per-paragraph stagger, no
 * drawn rules. Both primitives come from components/motion/gsap and are
 * no-ops under prefers-reduced-motion; neither hides content via CSS, so
 * with JS off the whole roster is still fully readable.
 *
 * Everything rendered comes from data/players.ts. A player without `meta`,
 * `stats` or `sideCards` renders without them; nothing is padded out.
 */

/** The three supporting compositions, in order. */
const SUPPORTING_VARIANTS = ["a", "b", "c"] as const;

/** Given name on the first line, everything else on the second — splitting
 *  on the last word instead would orphan the trailing initial of
 *  "Yashas Chandra M S" onto a line of its own. */
function nameLines(name: string): string[] {
  const [given, ...rest] = name.split(" ");
  return rest.length ? [given, rest.join(" ")] : [given];
}

function Figures({
  stats,
  className,
}: {
  stats: PlayerFeature["stats"];
  className: string;
}) {
  if (!stats || stats.length === 0) return null;
  return (
    <dl className={className}>
      {/* Keyed by position, not label: a player can legitimately carry two
          figures with the same label, and keying on the label collides. */}
      {stats.map((s, i) => (
        <div key={`${s.v}-${s.l}-${i}`}>
          <dt>{s.v}</dt>
          <dd>{s.l}</dd>
        </div>
      ))}
    </dl>
  );
}

function Moments({
  cards,
  className,
}: {
  cards: PlayerFeature["sideCards"];
  className: string;
}) {
  if (!cards || cards.length === 0) return null;
  return (
    <ul className={className}>
      {cards.map((c) => (
        <li key={c.title}>
          <span className="plr-moment-k">{c.label}</span>
          <span className="plr-moment-t">{c.title}</span>
          <span className="plr-moment-s">{c.sub}</span>
        </li>
      ))}
    </ul>
  );
}

function Prose({
  paragraphs,
  className,
}: {
  paragraphs: string[];
  className: string;
}) {
  return (
    <div className={className}>
      {paragraphs.map((para, i) => (
        <p
          key={i}
          // Trusted, in-repo copy from data/players.ts — the only markup it
          // carries is <strong> on verified figures. No user input reaches
          // this.
          dangerouslySetInnerHTML={{ __html: para }}
        />
      ))}
    </div>
  );
}

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
      // 1 — the marquee plate, and 2 — the marquee name. The page's two
      // signature moments, fired together off the marquee itself.
      const marquee = el.querySelector<HTMLElement>("[data-plr-marquee]");
      if (marquee) {
        const plate = marquee.querySelector("[data-plr-plate]");
        if (plate) revealImageOnScroll(plate, marquee, { start: "top 88%" });
        const name = marquee.querySelectorAll("[data-plr-name] > span");
        if (name.length)
          revealLinesOnScroll(name, marquee, { stagger: 0.09, start: "top 84%" });
      }

      // 3 — one quiet plate wipe as each supporting profile arrives. No
      // other element on the page moves.
      el.querySelectorAll<HTMLElement>("[data-plr-profile]").forEach((p) => {
        const plate = p.querySelector("[data-plr-plate]");
        if (plate) revealImageOnScroll(plate, p);
      });
    }, el);
    return () => ctx.revert();
  }, [players]);

  const [marquee, ...supporting] = players;
  if (!marquee) return null;

  const marqueeLines = nameLines(marquee.name);

  return (
    <div className="plr-roster" ref={root}>
      {/* ── 01 · THE MARQUEE ─────────────────────────────────────────
          The page's one dark field. It runs straight on from the ink
          hero above it, so the reader meets the lead portrait inside a
          single continuous opening rather than across a banded seam. */}
      <section
        className="plr-marquee"
        id={marquee.anchor}
        aria-labelledby={`plr-h-${marquee.anchor}`}
        data-plr-marquee
      >
        <div className="hp-wrap">
          <div className="plr-mq">
            <div className="plr-mq-head">
              <p className="plr-mq-season">Season 2026 · The Team Sheet</p>
              <p className="plr-mq-note">Four players, in squad order.</p>
            </div>

            <div className="plr-mq-id">
              <p className="plr-eyebrow">{marquee.eyebrow}</p>
              {/* The masked lines are decorative geometry, so the accessible
                  name is stated once on the heading itself — otherwise the
                  block spans concatenate without a space. */}
              <h2
                className="plr-mq-name"
                id={`plr-h-${marquee.anchor}`}
                aria-label={marquee.name}
              >
                {marqueeLines.map((l) => (
                  <span className="mq-line" data-plr-name key={l}>
                    <span>{l}</span>
                  </span>
                ))}
              </h2>
              {marquee.meta && <p className="plr-meta">{marquee.meta}</p>}
            </div>

            <figure className="plr-mq-fig">
              <div className="plr-plate" data-plr-plate>
                <Image
                  src={marquee.image}
                  alt={`${marquee.name} — Vimtra Chennai Lions GC`}
                  fill
                  priority
                  sizes="(max-width: 767px) 100vw, (max-width: 1023px) 64vw, 40vw"
                  style={{ objectPosition: "50% 16%" }}
                />
              </div>
            </figure>

            <Prose paragraphs={marquee.paragraphs} className="plr-mq-body" />
            <Figures stats={marquee.stats} className="plr-mq-figures" />
            <Moments cards={marquee.sideCards} className="plr-mq-moments" />
          </div>
        </div>
      </section>

      {/* ── 02–04 · THE ROSTER ───────────────────────────────────────
          One continuous ivory field. Each profile is a different shape;
          nothing divides them but scale and air. */}
      <section className="plr-roll">
        <div className="hp-wrap">
          {supporting.map((p, i) => {
            const variant = SUPPORTING_VARIANTS[i % SUPPORTING_VARIANTS.length];
            const lines = nameLines(p.name);
            return (
              <article
                key={p.anchor}
                id={p.anchor}
                className={`plr-p plr-p-${variant}`}
                aria-labelledby={`plr-h-${p.anchor}`}
                data-plr-profile
              >
                <div className="plr-p-id">
                  <p className="plr-eyebrow">{p.eyebrow}</p>
                  {/* Same reason as the marquee: the hand-broken lines are
                      block spans, so the name is stated once on the heading
                      rather than left to concatenate. */}
                  <h2
                    className="plr-p-name"
                    id={`plr-h-${p.anchor}`}
                    aria-label={p.name}
                  >
                    {lines.map((l) => (
                      <span key={l}>{l}</span>
                    ))}
                  </h2>
                  {p.meta && <p className="plr-meta">{p.meta}</p>}
                </div>

                <figure className="plr-p-fig">
                  <div className="plr-plate" data-plr-plate>
                    <Image
                      src={p.image}
                      alt={`${p.name} — Vimtra Chennai Lions GC`}
                      fill
                      sizes="(max-width: 767px) 86vw, (max-width: 1023px) 56vw, 34vw"
                      style={{ objectPosition: "50% 16%" }}
                    />
                  </div>
                </figure>

                <Prose paragraphs={p.paragraphs} className="plr-p-body" />
                <Figures stats={p.stats} className="plr-p-figures" />
                <Moments cards={p.sideCards} className="plr-p-moments" />
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
