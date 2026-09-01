"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  countUp,
  gsap,
  parallax,
  registerGsap,
  revealImageOnScroll,
  revealLinesOnScroll,
  riseOnScroll,
} from "@/components/motion/gsap";

/**
 * Home page chapters.
 *
 * Recomposed onto the module's 4 / 8 / 12 track (`.cm-track`) so the home
 * page reads in the same editorial language as /the-club and /the-pride,
 * and so every column earns its width. The previous `roar-*` / `club-*` /
 * `shop-*` shapes left large unused fields — a headline in the left half of
 * a 900px section, a closing band with 400px of empty right column, and
 * 60–150px of dead air beneath most sections.
 *
 * Player photography is deliberately absent — the homepage speaks for the
 * club, the city and the season; portraits belong to /players. Fixture and
 * press rows are real records passed down from the server component, so
 * nothing here is invented. Photography is licensed and self-hosted; see
 * public/assets/photo/CREDITS.md.
 */

/** Shared scroll choreography. Sections opt in via data attributes. */
function useSectionMotion(withImage = false) {
  const root = useRef<HTMLElement | null>(null);
  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      if (el.querySelector("[data-line] > span")) {
        revealLinesOnScroll("[data-line] > span", el);
      }
      if (el.querySelector("[data-rise]")) {
        riseOnScroll("[data-rise]", el, { y: 22, stagger: 0.08 });
      }
      if (withImage) {
        el.querySelectorAll<HTMLElement>("[data-fig]").forEach((fig) => {
          revealImageOnScroll(fig, el, { start: "top 82%" });
        });
        const bleed = el.querySelector("[data-bleed]");
        if (bleed) parallax(bleed, el, 5);
      }
      el.querySelectorAll<HTMLElement>("[data-count]").forEach((n) => {
        countUp(n, Number(n.dataset.count || "0"));
      });
    }, el);
    return () => ctx.revert();
  }, [withImage]);
  return root;
}

/* ── 01 · BRAND STATEMENT ────────────────────────────────── */
export function Statement() {
  const root = useSectionMotion(true);
  return (
    /* One dominant element — the headline — with the supporting copy
       offset into the columns the headline does not use, so the section
       fills its frame instead of leaving the right half empty.
       "CHENNAI'S ROAR" is the franchise's own line; the paragraph is the
       verified Vimtra Ventures ownership fact. Nothing is invented. */
    <section
      ref={root}
      className="hp-sec hp-sec-ivory hm-sec"
      aria-labelledby="st-h"
    >
      <div className="hp-wrap">
        <div className="cm-track hm-statement">
          <p className="hp-index" data-rise>
            01 <span>The Franchise</span>
          </p>
          <h2 id="st-h" className="cm-display hm-statement-h" data-rise>
            CHENNAI&rsquo;S <em>roar</em>.
          </h2>
          <div className="hm-statement-s" data-rise>
            <p>
              Chennai&rsquo;s franchise in the AM Green Indian Golf Premier
              League — owned outright by Vimtra Ventures, a San Francisco
              &amp; Chennai investment firm founded in 1995. The commitment is
              not to a single season. It is to the decade of Indian franchise
              golf that begins now.
            </p>
            <Link href="/the-club" className="hp-btn hp-btn-text">
              The story of the club
              <span className="hp-arrow" aria-hidden>
                →
              </span>
            </Link>
          </div>
          <div className="hm-statement-band">
            <div className="hm-band" data-fig>
              <Image
                src="/assets/photo/home-01-links-twilight.jpg"
                alt="A links fairway at twilight, a lone figure far down the hole"
                fill
                sizes="100vw"
                style={{ objectPosition: "50% 62%" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 02 · THE CLUB ───────────────────────────────────────── */
export function Club() {
  const root = useSectionMotion(true);
  return (
    <section
      ref={root}
      className="hp-sec hp-sec-ink hm-sec"
      aria-labelledby="cl-h"
    >
      <div className="hp-wrap">
        <div className="cm-track hm-split">
          <div className="hm-split-t">
            <p className="hp-index hp-index-dark" data-rise>
              02 <span>The Club</span>
            </p>
            <p className="hm-year" data-rise>
              <span data-count="2026">2026</span>
            </p>
            <h2 id="cl-h" className="cm-ch-t" style={{ marginTop: 0 }}>
              <span className="mq-line" data-line>
                <span>THE INAUGURAL</span>
              </span>
              <span className="mq-line" data-line>
                <span>SEASON.</span>
              </span>
            </h2>
            <p className="hm-body" data-rise>
              Ten franchises. Fifteen events across a single season — ten in
              India, five international. Chennai is one of them, and the Lions
              play their first ball in 2026.
            </p>
            <Link href="/the-pride" className="hp-btn hp-btn-text" data-rise>
              The mark &amp; the city
              <span className="hp-arrow" aria-hidden>
                →
              </span>
            </Link>
          </div>

          <div className="hm-split-f">
            <div className="hm-fig" data-fig>
              <Image
                src="/assets/photo/home-club-aerial-golden.jpg"
                alt="A championship course from the air at golden hour, the sea on the horizon"
                fill
                sizes="(max-width: 1023px) 100vw, 48vw"
                style={{ objectPosition: "56% 46%" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 03 · THE SEASON ─────────────────────────────────────── */
export interface SeasonRow {
  slug: string;
  name: string;
  city: string;
  country: string;
  courseName: string | null;
  dates: string;
  upcoming: boolean;
}

export function Season({ rows }: { rows: SeasonRow[] }) {
  const root = useSectionMotion();
  if (!rows.length) return null;
  return (
    <section
      ref={root}
      className="hp-sec hp-sec-ivory hm-sec"
      aria-labelledby="se-h"
    >
      <div className="hp-wrap">
        <div className="cm-track hm-head">
          <div className="hm-head-t">
            <p className="hp-index" data-rise>
              03 <span>The Season</span>
            </p>
            <h2 id="se-h" className="hp-section-title">
              <span className="mq-line" data-line>
                <span>THE 2026</span>
              </span>
              <span className="mq-line" data-line>
                <span>CALENDAR.</span>
              </span>
            </h2>
          </div>
          <Link href="/fixtures" className="hp-btn hp-btn-text hm-head-a" data-rise>
            All fixtures
            <span className="hp-arrow" aria-hidden>
              →
            </span>
          </Link>
        </div>

        <ol className="cal">
          {rows.map((f, i) => (
            <li key={f.slug} data-rise>
              <Link href="/fixtures" className="cal-row">
                <span className="cal-n">{String(i + 1).padStart(2, "0")}</span>
                <span className="cal-body">
                  <span className="cal-name">{f.name}</span>
                  <span className="cal-where">
                    {[f.courseName, f.city, f.country].filter(Boolean).join(" · ")}
                  </span>
                </span>
                <span className="cal-date">{f.dates}</span>
                <span className={`cal-tag ${f.upcoming ? "is-next" : ""}`}>
                  {f.upcoming ? "Upcoming" : "Completed"}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ── 04 · GOLF DEVELOPMENT ───────────────────────────────── */
const PILLARS = [
  {
    k: "Grassroots · with IGPL",
    t: "Golf on Wheels",
    d: "A schools-and-colleges outreach initiative bringing golf directly to campuses through mobile simulators.",
  },
  {
    k: "Coming soon · Chennai",
    t: "Course & Academy",
    d: "A world-class course and academy under development in Chennai — professional training, youth development and community engagement.",
  },
  {
    k: "Signature thesis",
    t: "Golf-led communities",
    d: "Premium golf facilities integrated with residential communities, lifestyle amenities and long-cycle investment.",
  },
];

export function Development() {
  const root = useSectionMotion(true);
  return (
    <section ref={root} className="hm-dev" aria-labelledby="dv-h">
      <div className="hm-dev-media" data-bleed>
        <Image
          src="/assets/photo/home-dev-range-silhouette.jpg"
          alt="A backlit golfer at the top of the backswing on a practice range"
          fill
          sizes="100vw"
          style={{ objectPosition: "40% 50%" }}
        />
      </div>
      <div className="hm-dev-veil" aria-hidden />
      <div className="v-grain" aria-hidden />

      <div className="hp-wrap cm-track hm-dev-inner">
        <div className="hm-dev-head">
          <p className="hp-index hp-index-dark" data-rise>
            04 <span>Golf Development</span>
          </p>
          <h2 id="dv-h" className="hm-dev-h">
            <span className="mq-line" data-line>
              <span>A PLATFORM,</span>
            </span>
            <span className="mq-line" data-line>
              <span>NOT A BET.</span>
            </span>
          </h2>
          <p className="hm-body" data-rise>
            Coaching, academies, event standards and course operations to
            international championship level — built as an institution, not a
            single season.
          </p>
          <Link href="/golf-development" className="hp-btn hp-btn-text" data-rise>
            Explore the platform
            <span className="hp-arrow" aria-hidden>
              →
            </span>
          </Link>
        </div>

        <div className="hm-dev-list">
          <ol>
            {PILLARS.map((p, i) => (
              <li key={p.t} data-rise>
                <span className="hm-dev-n">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <span className="hm-dev-k">{p.k}</span>
                  <span className="hm-dev-t">{p.t}</span>
                  <span className="hm-dev-d">{p.d}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ── 05 · MEDIA ──────────────────────────────────────────── */
export interface StoryRow {
  id: string;
  source: string;
  title: string;
  summary: string;
  href: string;
  cover: string | null;
  date: string | null;
}

export function Media({ stories }: { stories: StoryRow[] }) {
  const root = useSectionMotion(true);
  if (!stories.length) return null;
  const [lead, ...rest] = stories;

  return (
    <section
      ref={root}
      className="hp-sec hp-sec-paper hm-sec"
      aria-labelledby="md-h"
    >
      <div className="hp-wrap">
        <div className="cm-track hm-head">
          <div className="hm-head-t">
            <p className="hp-index" data-rise>
              05 <span>Media</span>
            </p>
            <h2 id="md-h" className="hp-section-title">
              <span className="mq-line" data-line>
                <span>FROM</span>
              </span>
              <span className="mq-line" data-line>
                <span>THE DEN.</span>
              </span>
            </h2>
          </div>
          <Link href="/news" className="hp-btn hp-btn-text hm-head-a" data-rise>
            All coverage
            <span className="hp-arrow" aria-hidden>
              →
            </span>
          </Link>
        </div>

        {/* The lead used to sit in a two-column grid beside the secondary
            list. The list is a grid item, so it stretched to the height of
            the tall cover image and distributed its three rows across it —
            producing the large vertical gaps between 02, 03 and 04.

            The lead is now its own split (figure beside its own type, the
            figure taking exactly the height of the column next to it), and
            the secondary coverage runs full width beneath as a ruled list
            at its natural row height. Nothing stretches. */}
        <a
          className="cm-track hm-split is-flipped hm-lead hp-mt-lg"
          href={lead.href}
          target="_blank"
          rel="noreferrer"
          data-rise
        >
          {lead.cover && (
            <span className="hm-split-f">
              <span className="hm-fig" data-fig>
                <Image
                  src={lead.cover}
                  alt=""
                  fill
                  sizes="(max-width: 1023px) 100vw, 48vw"
                  className="story-img"
                />
              </span>
            </span>
          )}
          <span className="hm-split-t">
            <span className="story-meta">
              <span className="story-src">{lead.source}</span>
              {lead.date && <span className="story-date">{lead.date}</span>}
            </span>
            <span className="story-title story-title-lead">{lead.title}</span>
            <span className="story-sum">{lead.summary}</span>
          </span>
        </a>

        {/* Secondary coverage is typographic, not thumbnailed.
            Several of these stories share one subject, so repeating the
            same portrait four times would read as a template error. A
            numbered masthead list is how a newsroom actually sets
            "more coverage" — and it keeps every cover honest. */}
        <ol className="story-rest">
          {rest.slice(0, 3).map((s, i) => (
            <li key={s.id}>
              <a
                className="story story-row"
                href={s.href}
                target="_blank"
                rel="noreferrer"
                data-rise
              >
                <span className="story-n">
                  {String(i + 2).padStart(2, "0")}
                </span>
                <span className="story-col">
                  <span className="story-meta">
                    <span className="story-src">{s.source}</span>
                    {s.date && <span className="story-date">{s.date}</span>}
                  </span>
                  <span className="story-title">{s.title}</span>
                </span>
                <span className="story-go" aria-hidden>
                  &#8599;
                </span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ── 06 · SHOP ───────────────────────────────────────────── */
export function Shop() {
  const root = useSectionMotion(true);
  return (
    <section
      ref={root}
      className="hp-sec hp-sec-ivory hm-sec"
      aria-labelledby="sh-h"
    >
      <div className="hp-wrap">
        {/* Flipped so the figure takes the left edge — the store is the
            only chapter that leads with the product rather than the type.
            The image stays the catalogue's own merchandise photography;
            a stock golf-apparel frame would show kit that is not ours. */}
        <div className="cm-track hm-split is-flipped">
          <div className="hm-split-t">
            <p className="hp-index" data-rise>
              06 <span>The Store</span>
            </p>
            <h2 id="sh-h" className="cm-ch-t" style={{ marginTop: 0 }}>
              <span className="mq-line" data-line>
                <span>WEAR</span>
              </span>
              <span className="mq-line" data-line>
                <span>THE PRIDE.</span>
              </span>
            </h2>
            <p className="hm-body" data-rise>
              Match-day kit, performance apparel and tour-tested accessories —
              fan-priced, shipped across India.
            </p>
            <Link href="/shop" className="hp-btn hp-btn-primary hp-mt-md" data-rise>
              EXPLORE THE SHOP
              <span className="hp-arrow" aria-hidden>
                →
              </span>
            </Link>
          </div>

          <div className="hm-split-f">
            <div className="hm-fig" data-fig>
              <Image
                src="/assets/Golf_polo_shirt_and_cap_202608220321-web.jpg"
                alt="Official Chennai Lions apparel — polo and cap"
                fill
                sizes="(max-width: 1023px) 100vw, 48vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 07 · CLOSING ────────────────────────────────────────── */
export function Closing() {
  const root = useSectionMotion();
  return (
    <section
      ref={root}
      className="hp-sec hp-sec-ink hm-sec hm-sec-tight hp-sec-atmos"
      aria-labelledby="cs-h"
    >
      <div className="hp-wrap">
        <div className="cm-track cm-close">
          <div className="cm-close-title">
            <h2 id="cs-h" className="hp-section-title">
              <span className="mq-line" data-line>
                <span>ONE CITY.</span>
              </span>
              <span className="mq-line" data-line>
                <span>ONE PRIDE.</span>
              </span>
            </h2>
            <p className="cm-pull hp-mt-sm" data-rise>
              Chennai&rsquo;s roar — on the world&rsquo;s newest stage.
            </p>
          </div>
          <div className="cm-close-actions" data-rise>
            <Link href="/contact" className="hp-btn hp-btn-primary">
              TALK TO THE FRANCHISE
              <span className="hp-arrow" aria-hidden>
                →
              </span>
            </Link>
            <Link href="/partners" className="hp-btn hp-btn-ghost hp-on-dark">
              Partner with the Lions
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
