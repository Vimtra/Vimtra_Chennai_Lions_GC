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
 * Player photography is deliberately absent here — the homepage speaks for
 * the club, the city and the season; portraits belong to /players. Fixture
 * and press rows are real records passed down from the server component, so
 * nothing on this page is invented.
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
          parallax(fig, el, 4);
        });
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
  const root = useSectionMotion();
  return (
    <section ref={root} className="sec sec-ivory" aria-labelledby="st-h">
      <div className="hp-wrap">
        <p className="rubric" data-rise>
          <span>01</span> The Franchise
        </p>
        <h2 id="st-h" className="statement-h">
          <span className="mq-line" data-line><span>A TEAM BUILT</span></span>
          <span className="mq-line" data-line><span>FOR THE</span></span>
          <span className="mq-line" data-line><span>LONG GAME.</span></span>
        </h2>
        <div className="statement-tail">
          <p className="statement-body" data-rise>
            Chennai&rsquo;s franchise in the AM Green Indian Golf Premier
            League — owned outright by Vimtra Ventures, a San Francisco &amp;
            Chennai investment firm founded in 1995. The commitment is not to
            a single season. It is to the decade of Indian franchise golf that
            begins now.
          </p>
          <Link href="/the-club" className="link-arrow" data-rise>
            The story of the club
            <span className="hp-arrow" aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── 02 · THE CLUB ───────────────────────────────────────── */
export function Club() {
  const root = useSectionMotion(true);
  return (
    <section ref={root} className="sec sec-ink" aria-labelledby="cl-h">
      <div className="hp-wrap club-grid">
        <div className="club-type">
          <p className="rubric rubric-dark" data-rise>
            <span>02</span> The Club
          </p>
          <p className="club-year" data-rise>
            <span data-count="2026">2026</span>
          </p>
          <h2 id="cl-h" className="club-h">
            <span className="mq-line" data-line><span>THE INAUGURAL</span></span>
            <span className="mq-line" data-line><span>SEASON.</span></span>
          </h2>
          <p className="club-body" data-rise>
            Ten franchises. Fifteen events across a single season — ten in
            India, five international. Chennai is one of them, and the Lions
            play their first ball in 2026.
          </p>
          <Link href="/the-pride" className="link-arrow link-arrow-dark" data-rise>
            The mark &amp; the city
            <span className="hp-arrow" aria-hidden>→</span>
          </Link>
        </div>

        <div className="club-fig" data-fig>
          <Image
            src="/assets/car-1-web.jpg"
            alt="Tournament golf — reading the line on the closing green"
            fill
            sizes="(max-width: 900px) 100vw, 46vw"
            className="club-img"
          />
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
    <section ref={root} className="sec sec-ivory" aria-labelledby="se-h">
      <div className="hp-wrap">
        <div className="sec-head">
          <div>
            <p className="rubric" data-rise>
              <span>03</span> The Season
            </p>
            <h2 id="se-h" className="sec-h">
              <span className="mq-line" data-line><span>THE 2026</span></span>
              <span className="mq-line" data-line><span>CALENDAR.</span></span>
            </h2>
          </div>
          <Link href="/fixtures" className="link-arrow" data-rise>
            All fixtures
            <span className="hp-arrow" aria-hidden>→</span>
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
    <section ref={root} className="sec-dev" aria-labelledby="dv-h">
      <div className="dev-media" data-fig>
        <Image
          src="/assets/fac-range-web.jpg"
          alt="A floodlit practice facility with launch-monitor bays at dusk"
          fill
          // fac-range-web.jpg is a 1024px source — see Hero.
          sizes="(max-width: 1080px) 100vw, 1080px"
          className="dev-img"
        />
        <span className="dev-scrim" aria-hidden />
      </div>

      <div className="hp-wrap dev-inner">
        <p className="rubric rubric-dark" data-rise>
          <span>04</span> Golf Development
        </p>
        <h2 id="dv-h" className="dev-h">
          <span className="mq-line" data-line><span>A PLATFORM,</span></span>
          <span className="mq-line" data-line><span>NOT A BET.</span></span>
        </h2>
        <p className="dev-body" data-rise>
          Coaching, academies, event standards and course operations to
          international championship level — built as an institution, not a
          single season.
        </p>

        <ol className="dev-list">
          {PILLARS.map((p, i) => (
            <li key={p.t} data-rise>
              <span className="dev-n">{String(i + 1).padStart(2, "0")}</span>
              <span className="dev-item">
                <span className="dev-k">{p.k}</span>
                <span className="dev-t">{p.t}</span>
                <span className="dev-d">{p.d}</span>
              </span>
            </li>
          ))}
        </ol>

        <Link href="/golf-development" className="link-arrow link-arrow-dark" data-rise>
          Explore the platform
          <span className="hp-arrow" aria-hidden>→</span>
        </Link>
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
    <section ref={root} className="sec sec-paper" aria-labelledby="md-h">
      <div className="hp-wrap">
        <div className="sec-head">
          <div>
            <p className="rubric" data-rise>
              <span>05</span> Media
            </p>
            <h2 id="md-h" className="sec-h">
              <span className="mq-line" data-line><span>FROM</span></span>
              <span className="mq-line" data-line><span>THE DEN.</span></span>
            </h2>
          </div>
          <Link href="/news" className="link-arrow" data-rise>
            All coverage
            <span className="hp-arrow" aria-hidden>→</span>
          </Link>
        </div>

        <div className="media-grid">
          <a
            className="story story-lead"
            href={lead.href}
            target="_blank"
            rel="noreferrer"
            data-rise
          >
            {lead.cover && (
              <span className="story-fig story-fig-lead" data-fig>
                <Image
                  src={lead.cover}
                  alt=""
                  fill
                  sizes="(max-width: 900px) 100vw, 56vw"
                  className="story-img"
                />
              </span>
            )}
            <span className="story-meta">
              <span className="story-src">{lead.source}</span>
              {lead.date && <span className="story-date">{lead.date}</span>}
            </span>
            <span className="story-title story-title-lead">{lead.title}</span>
            <span className="story-sum">{lead.summary}</span>
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
      </div>
    </section>
  );
}

/* ── 06 · SHOP ───────────────────────────────────────────── */
export function Shop() {
  const root = useSectionMotion(true);
  return (
    <section ref={root} className="sec sec-ivory" aria-labelledby="sh-h">
      <div className="hp-wrap shop-grid">
        <div className="shop-fig" data-fig>
          <Image
            src="/assets/Golf_polo_shirt_and_cap_202608220321-web.jpg"
            alt="Official Chennai Lions apparel — polo and cap"
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
            className="shop-img"
          />
        </div>
        <div className="shop-type">
          <p className="rubric" data-rise>
            <span>06</span> The Store
          </p>
          <h2 id="sh-h" className="sec-h">
            <span className="mq-line" data-line><span>WEAR</span></span>
            <span className="mq-line" data-line><span>THE PRIDE.</span></span>
          </h2>
          <p className="statement-body" data-rise>
            Match-day kit, performance apparel and tour-tested accessories —
            fan-priced, shipped across India.
          </p>
          <Link href="/shop" className="btn-gold" data-rise>
            EXPLORE THE SHOP
            <span className="hp-arrow" aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── 07 · CLOSING ────────────────────────────────────────── */
export function Closing() {
  const root = useSectionMotion();
  return (
    <section ref={root} className="sec-close" aria-labelledby="cs-h">
      <div className="close-atmos" aria-hidden />
      <div className="hp-wrap close-inner">
        <h2 id="cs-h" className="close-h">
          <span className="mq-line" data-line><span>ONE CITY.</span></span>
          <span className="mq-line" data-line><span>ONE PRIDE.</span></span>
        </h2>
        <p className="close-body" data-rise>
          Chennai&rsquo;s roar — on the world&rsquo;s newest stage.
        </p>
        <div className="close-actions" data-rise>
          <Link href="/contact" className="btn-gold">
            TALK TO THE FRANCHISE
            <span className="hp-arrow" aria-hidden>→</span>
          </Link>
          <Link href="/partners" className="btn-ghost-dark">
            Partner with the Lions
          </Link>
        </div>
      </div>
    </section>
  );
}
