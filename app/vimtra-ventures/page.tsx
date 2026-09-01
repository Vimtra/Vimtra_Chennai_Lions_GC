import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import StoryHero from "@/components/site/StoryHero";
import { Section, IndexLabel, SectionTitle } from "@/components/site/Section";

export const metadata: Metadata = {
  title: "Vimtra Ventures · Vimtra Chennai Lions GC",
  description:
    "The San Francisco & Chennai-based PE, VC, and investment firm behind the Chennai Lions — founded 1995, 60+ tech acquisitions, six core verticals, owner of the Chennai Lions GC and Dallas Sidekicks.",
};

/* ---------------------------------------------------------------------------
   CONTENT SOURCES
   Every claim on this page is sourced from the Chennai Lions IGPL brochure
   (pp. 13, 14, 15, 16) or the Vimtra Ventures profile. No numbers, dates or
   people appear that are not in one of those two documents.

   SIX VERTICALS: the six identical cards are gone. The section is now an
   asymmetric editorial index — a sticky statement rail on the left, six
   numbered ruled rows on the right, each carrying its documented title and
   its documented description. The hover response is TYPOGRAPHIC (numeral
   and title shift to crimson, a gold rule sweeps the row) rather than an
   image swap: there is no honest photograph of "mergers & acquisitions" or
   "AI infrastructure", and generic business stock would be exactly the
   filler this redesign exists to remove.

   "BY THE NUMBERS" is not deleted — it was never on the removal list, and
   founding year, acquisitions, assets and vertical count are the
   credentials a strategic reader actually wants. It is folded into the
   opening section as a ruled credential field instead of standing alone as
   a band of figures.

   PHOTOGRAPHY: one licensed frame in the hero, plus the two real
   franchise-supplied founder portraits. Nothing else — a firm cannot be
   honestly photographed, and stock offices would cheapen the page.
--------------------------------------------------------------------------- */

// Brochure p. 15 — headline stats verbatim.
const CREDENTIALS = [
  { v: "1995", l: "Founded" },
  { v: "60+", l: "Technology Acquisitions" },
  { v: "55+", l: "North America Real-Estate Assets" },
  { v: "6", l: "Core Verticals" },
];

// Brochure p. 15 — the six verticals, verbatim descriptions.
const VERTICALS = [
  {
    name: "Mergers & Acquisitions",
    body:
      "Identifying, acquiring, restructuring, and revitalising businesses with significant growth potential.",
  },
  {
    name: "Startups",
    body:
      "Founded, incubated, and scaled multiple technology ventures — several spun off into successful independent businesses.",
  },
  {
    name: "Sports Franchises",
    body:
      "Ownership positions in professional sport — IGPL Vimtra Chennai Lions GC and the Dallas Sidekicks.",
  },
  {
    name: "Real Estate",
    body:
      "High-value residential and mixed-use developments integrated with lifestyle and hospitality anchors.",
  },
  {
    name: "Golf Communities & Academies",
    body:
      "Luxury golf-integrated communities and player-development academies across North America and India.",
  },
  {
    name: "AI Infrastructure",
    body:
      "Hyperscale data-centre ownership and operations serving cloud, enterprise, and AI-workload demand.",
  },
];

// Brochure p. 14 — verbatim leadership bios. Photographs are supplied by
// the franchise. `imagePosition` keeps the face inside the crop.
const FOUNDERS = [
  {
    name: "Subash Yammada",
    role: "Founder & CEO",
    image: "/assets/subash-yammada-web.jpg",
    imagePosition: "50% 14%",
    imageAlt: "Subash Yammada — Founder & CEO, Vimtra Ventures",
    body:
      "Serial entrepreneur and CEO of Vimtra Ventures — a San Francisco-based diversified global enterprise. Three decades of leadership cultivating an expansive portfolio across sports franchises, private equity, venture capital, real estate (with a focus on AI infrastructure), golf communities and academies, technology, healthcare, and hospitality.",
  },
  {
    name: "Thimmaji Rao Yammada",
    role: "Founder & Managing Director",
    image: "/assets/thimmaji-rao-yammada-web.jpg",
    imagePosition: "50% 26%",
    imageAlt:
      "Thimmaji Rao Yammada — Founder & Managing Director, Vimtra Ventures",
    body:
      "Managing Director of Vimtra Ventures with 31 years of leadership across private equity, sports franchises, infrastructure, real estate, and industrial development in North America and India. Full-cycle real-estate expertise spanning commercial, residential, retail, and mixed-use assets, with a track record in mid- to large-scale project execution and asset restructuring.",
  },
];

// Brochure p. 16 — verbatim.
const BOARD_MEMBER = {
  name: "Ravi Babu Mannam",
  role: "Board of Directors",
  body:
    "Since joining the Vimtra Ventures Board of Directors, Mr. Ravi Babu Mannam has strengthened the firm's leadership and advisory ecosystem and the expansion of its golf and community-development initiatives — an important part of Vimtra's journey toward a globally connected investment and golf-development platform.",
};

// Brochure p. 16 — Advisory Board disciplines.
const ADVISORY_DISCIPLINES = [
  "Business",
  "Investments",
  "Golf",
  "Real Estate",
  "Infrastructure",
  "Community Development",
  "Branding",
  "Sports Management",
];

// Brochure p. 15 — the two sports-franchise ownership positions, verbatim.
const FRANCHISES = [
  {
    tag: "IGPL",
    name: "Vimtra Chennai Lions GC",
    detail:
      "The franchise operating in the AM Green Indian Golf Premier League — Season 2026.",
    href: "/the-club" as const,
  },
  {
    tag: "MASL",
    name: "Dallas Sidekicks",
    detail: "Ownership position in professional sport in North America.",
    href: undefined,
  },
];

export default function VimtraVenturesPage() {
  return (
    <>
      <StoryHero
        eyebrow="Ownership · The Firm"
        title={["VIMTRA", "VENTURES"]}
        // Existing approved lead, cut to its opening clause.
        line="The brain behind the team."
        image="/assets/photo/vv-hero-cliffside-community.jpg"
        imageAlt="Cliffside homes above a coastal green"
        imagePosition="50% 46%"
      />

      {/* 01 — THE FIRM, with the credentials folded in. */}
      <Section surface="ivory">
        <div className="cm-track vv-firm">
          <IndexLabel n="01">The Firm</IndexLabel>

          <div className="vv-firm-h">
            <h2 className="cm-display" data-rise>
              A FIRM BUILT TO CREATE <em>impact</em>.
            </h2>
          </div>

          <div className="vv-firm-b" data-rise>
            <p>
              Vimtra Ventures is a US-based venture capital and investment firm
              founded in 1995, with a track record that includes more than{" "}
              <strong>60 technology acquisitions</strong>. The firm operates as
              principal, not intermediary, across six verticals — with an
              operating footprint spanning North America and India and{" "}
              <strong>55+ premium real-estate assets</strong> across the United
              States.
            </p>
            <p>
              By combining capital, strategic vision, and hands-on execution,
              Vimtra partners with businesses and communities to build scalable
              enterprises, develop transformative assets, and create
              sustainable, long-term value.
            </p>
          </div>

          <dl className="vv-creds" data-rise>
            {CREDENTIALS.map((c) => (
              <div key={c.l}>
                <dt>{c.v}</dt>
                <dd>{c.l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      {/* 02 — SIX VERTICALS. Asymmetric index, typographic hover. */}
      <Section surface="paper">
        <div className="cm-track vv-verticals">
          <div className="vv-rail">
            <IndexLabel n="02">Six Verticals</IndexLabel>
            <SectionTitle lines={["ONE FIRM,", "SIX", "VERTICALS."]} />
            <p className="cm-lede" data-rise>
              Every area the firm operates in, on a single canvas — as
              principal, not intermediary.
            </p>
          </div>

          <ol className="vv-list">
            {VERTICALS.map((v, i) => (
              <li className="vv-item" key={v.name} data-rise>
                <span className="vv-n">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <span className="vv-t">{v.name}</span>
                  <span className="vv-d">{v.body}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* 03 — LEADERSHIP */}
      <Section surface="ivory">
        <div>
          <IndexLabel n="03">Leadership</IndexLabel>
          <SectionTitle lines={["THE PEOPLE", "BEHIND IT."]} />
        </div>

        <div className="vv-people hp-mt-lg">
          {FOUNDERS.map((f, i) => (
            <article
              className={`cm-track vv-person ${i % 2 === 1 ? "is-flipped" : ""}`.trim()}
              key={f.name}
            >
              <div className="vv-person-f" data-rise>
                <figure className="vv-portrait">
                  <Image
                    src={f.image}
                    alt={f.imageAlt}
                    fill
                    sizes="(max-width: 1023px) 100vw, 32vw"
                    style={{ objectPosition: f.imagePosition }}
                  />
                </figure>
              </div>
              <div className="vv-person-b">
                <span className="vv-role" data-rise>
                  {f.role}
                </span>
                <h3 className="vv-name" data-rise>
                  {f.name}
                </h3>
                <p className="vv-bio" data-rise>
                  {f.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* 04 — GOVERNANCE */}
      <Section surface="paper">
        <div className="cm-track vv-gov">
          <IndexLabel n="04">Governance</IndexLabel>

          <div className="vv-gov-h">
            <SectionTitle lines={["BOARD &", "ADVISORY."]} />
          </div>

          <div className="vv-gov-b">
            <div className="vv-board" data-rise>
              <span className="vv-role">{BOARD_MEMBER.role}</span>
              <h3 className="vv-name">{BOARD_MEMBER.name}</h3>
              <p className="vv-bio">{BOARD_MEMBER.body}</p>
            </div>

            <p className="hp-index hp-mt-lg" data-rise>
              <span>Advisory disciplines</span>
            </p>
            <ul className="vv-disciplines" data-rise>
              {ADVISORY_DISCIPLINES.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* 05 — SPORTS FRANCHISES */}
      <Section surface="ink">
        <div className="cm-track vv-firm">
          <IndexLabel n="05" tone="dark">
            Sports Franchises
          </IndexLabel>

          <div className="vv-firm-h">
            <h2 className="cm-display" data-rise>
              OWNERSHIP IN <em>sport</em>.
            </h2>
          </div>

          <ol className="gd-index">
            {FRANCHISES.map((f, i) => {
              const inner = (
                <>
                  <span className="gd-index-n">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="gd-index-k">{f.tag}</span>
                    <span className="gd-index-t">{f.name}</span>
                  </span>
                  <p className="gd-index-d">{f.detail}</p>
                </>
              );
              return (
                <li
                  key={f.name}
                  className={f.href ? "is-link" : undefined}
                  data-rise
                >
                  {f.href ? (
                    <Link href={f.href} className="vv-franchise-link">
                      {inner}
                    </Link>
                  ) : (
                    inner
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </Section>

      {/* CLOSING */}
      <Section surface="ink" size="tight" className="hp-sec-atmos">
        <div className="cm-track cm-close">
          <div className="cm-close-title">
            <SectionTitle lines={["BUILT FOR", "THE LONG GAME."]} />
          </div>
          <div className="cm-close-actions" data-rise>
            <Link href="/the-club" className="hp-btn hp-btn-primary">
              MEET THE FRANCHISE
              <span className="hp-arrow" aria-hidden>
                →
              </span>
            </Link>
            <Link href="/invest" className="hp-btn hp-btn-ghost hp-on-dark">
              Investment enquiries
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
