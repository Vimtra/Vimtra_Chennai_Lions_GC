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
}

/**
 * 05 — Media.
 *
 * A press wall, not a heading over an empty band. The chapter reads the
 * real MediaCoverage rows: the first is given a cover and its summary, the
 * rest run as ruled rows carrying source and headline. Only the featured
 * story shows an image — four of the five rows currently point at the same
 * portrait, so repeating it would read as a template rather than a page.
 *
 * With no coverage the wall is simply absent and the chapter falls back to
 * the route into the news desk. Nothing is padded out.
 */
export function Media({ stories }: { stories: StoryRow[] }) {
  const root = useSectionMotion();
  const [lead, ...rest] = stories;

  return (
    <section
      ref={root}
      className="hp-sec hp-sec-paper hm-sec"
      aria-labelledby="md-h"
    >
      <div className="hp-wrap">
        {/* Head and the route out share one baseline — the right half of
            this row was empty in the previous layout. */}
        <div className="hm-press-head">
          <div>
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
          <Link href="/news" className="hp-btn hp-btn-text" data-rise>
            Visit the news desk
            <span className="hp-arrow" aria-hidden>
              →
            </span>
          </Link>
        </div>

        {lead ? (
          <div className="hm-press">
            <a
              className="hm-press-lead"
              href={lead.href}
              target="_blank"
              rel="noreferrer noopener"
              data-rise
            >
              {lead.cover && (
                <span className="hm-press-fig">
                  <Image
                    src={lead.cover}
                    alt=""
                    fill
                    sizes="(max-width: 767px) 100vw, 42vw"
                  />
                </span>
              )}
              <span className="hm-press-lead-b">
                <span className="hm-press-src">{lead.source}</span>
                <span className="hm-press-t">{lead.title}</span>
                <span className="hm-press-sum">{lead.summary}</span>
                <span className="hm-press-go" aria-hidden>
                  Read at {lead.source} →
                </span>
              </span>
            </a>

            {rest.length > 0 && (
              <ul className="hm-press-rows">
                {rest.map((m) => (
                  <li key={m.id} data-rise>
                    <a
                      href={m.href}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      <span className="hm-press-src">{m.source}</span>
                      <span className="hm-press-rt">{m.title}</span>
                      <span className="hp-arrow" aria-hidden>
                        →
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <p className="hm-body hp-mt-lg" data-rise>
            News, press coverage and updates from the Chennai Lions — all in
            one place, kept current by the team.
          </p>
        )}
      </div>
    </section>
  );
}

export interface StoreFacts {
  items: number;
  categories: number;
}

/**
 * 06 — The Store.
 *
 * Two earlier attempts are worth recording, because the fix is a reaction
 * to both. A 50/50 figure-left/type-right split left a tall empty column
 * whenever the copy ran short. Replacing it with a full-width photograph
 * and the type stacked beneath solved the empty column but produced a
 * product banner — a 558px merchandise slab with the chapter's type
 * orphaned below it, and 1,092px of section for one headline, one line and
 * three counted facts.
 *
 * The chapter is now a mounted case. A single deep-ink panel holds the
 * photograph and the type side by side, so the image is a component of the
 * chapter rather than a banner above it. The panel's height is set by the
 * type column and the photograph covers whatever that comes to, which is
 * what makes the empty-column failure structurally impossible this time
 * rather than merely absent: there is no free-standing image box left to
 * run short of.
 *
 * The counted rail moved inside the type column. It was the full-width
 * strip under the old banner, and it is the element that gives the column
 * enough to hold — the reason the original split ran out of content.
 *
 * The type still never sits on the photograph. The merchandise shot is a
 * bright near-neutral studio backdrop where the index label measured
 * 1.16:1, and any scrim heavy enough to fix that buried the product. On
 * ink the same type clears 14:1 and the photograph stays unobstructed —
 * the panel supplies the dark ground the type needed without touching the
 * image. Gold reads as an accent here for the same reason it cannot on
 * ivory (2.83:1), which is why the index and rail labels change colour
 * with the surface.
 *
 * The image stays the catalogue's own merchandise photography; a stock
 * golf-apparel frame would show kit that is not ours.
 */
export function Shop({ facts }: { facts: StoreFacts }) {
  const root = useSectionMotion(true);
  return (
    <section
      ref={root}
      className="hp-sec hp-sec-ivory hm-sec"
      aria-labelledby="sh-h"
    >
      <div className="hp-wrap">
        <div className="hm-store">
          <figure className="hm-store-fig" data-fig>
            <Image
              src="/assets/Golf_polo_shirt_and_cap_202608220321-web.jpg"
              alt="Official Chennai Lions apparel — polo and cap"
              fill
              sizes="(max-width: 767px) 100vw, (max-width: 1023px) 92vw, 56vw"
            />
          </figure>

          <div className="hm-store-body">
            <p className="hp-index hp-index-dark" data-rise>
              06 <span>The Store</span>
            </p>
            <h2 id="sh-h" className="hm-store-t">
              <span className="mq-line" data-line>
                <span>WEAR THE PRIDE.</span>
              </span>
            </h2>
            <p className="hm-store-note" data-rise>
              Match-day kit, performance apparel and tour-tested accessories
              — fan-priced, shipped across India.
            </p>

            {/* Counted from the catalogue in app/page.tsx — never typed in. */}
            <dl className="hm-store-rail">
              <div data-rise>
                <dt>Items</dt>
                <dd>{facts.items}</dd>
              </div>
              <div data-rise>
                <dt>Categories</dt>
                <dd>{facts.categories}</dd>
              </div>
              <div data-rise>
                <dt>Delivery</dt>
                <dd className="is-text">Across India</dd>
              </div>
            </dl>

            <Link
              href="/shop"
              className="hp-btn hp-btn-primary hm-store-cta"
              data-rise
            >
              EXPLORE THE SHOP
              <span className="hp-arrow" aria-hidden>
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

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
