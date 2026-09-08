import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import VimtraHero from "@/components/site/VimtraHero";
import { Section, IndexLabel, SectionTitle } from "@/components/site/Section";

export const metadata: Metadata = {
  alternates: { canonical: "/vimtra-ventures" },
  title: "Vimtra Ventures",
  description:
    "The San Francisco & Chennai-based PE, VC, and investment firm behind the Chennai Lions — founded 1995 under the same principals, 60+ technology acquisitions, six core verticals, a $1.1B+ Frisco / PGA District cluster, a licensed PGA of America partnership, and ownership of the Chennai Lions GC and Dallas Sidekicks.",
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

/* Headline credentials.
   The first four are the Chennai Lions IGPL brochure p. 15, verbatim.
   The fifth was added in the September 2026 content audit from the
   Vimtra x PGA of America brochure p. 09, which carries a corporate
   figure the Lions brochure does not.

   UNRESOLVED SCOPE CONFLICT — deliberately not reconciled. The Lions
   brochure states "more than 60 technology acquisitions"; the PGA
   brochure states "60+ ACQUISITIONS ACROSS US, INDIA, UAE, AUSTRALIA".
   Those are the same number at two different scopes, and no source
   says whether they are the same 60, overlapping sets, or additive.
   The narrower, already-published claim is what stays on the figure;
   the four-country geography is carried in the prose below as the PGA
   brochure's own statement, attributed to it, without implying a
   second or larger total. Do not merge the two into one number. */
const CREDENTIALS = [
  { v: "1995", l: "Founded" },
  { v: "60+", l: "Technology Acquisitions" },
  { v: "55+", l: "North America Real-Estate Assets" },
  { v: "6", l: "Core Verticals" },
  // Vimtra x PGA of America brochure p. 09, verbatim.
  { v: "$1.1B+", l: "Frisco · PGA District Cluster · 30+ Assets" },
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

/* ---------------------------------------------------------------------------
   THE ROADMAP — verbatim from the "VIMTRA VENTURES LLC x PGA OF AMERICA"
   brochure (Company Profile 2026, p. 09, "BRINGING IT ALL TOGETHER").

   Status labels are the brochure's own — DONE / UNDERWAY — and are not
   softened or upgraded here. "Underway" means conversations in progress,
   which is exactly what that page says; nothing on this site presents an
   underway step as delivered.
--------------------------------------------------------------------------- */
const ROADMAP = [
  { n: "01", state: "Done", t: "PGA of America partnership" },
  { n: "02", state: "Done", t: "IGPL franchise: Chennai Lions GC" },
  { n: "03", state: "Underway", t: "Academy partnerships across India" },
  { n: "04", state: "Underway", t: "Premium resorts — three tourist destinations" },
  { n: "05", state: "Underway", t: "Real estate collaborations in metros" },
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
      <VimtraHero />

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
              The firm has been run by the{" "}
              <strong>same principals since day one</strong>, and the brochure
              published with the PGA of America partnership describes its
              acquisitions as spanning the <strong>United States, India, the
              UAE and Australia</strong>, alongside a{" "}
              <strong>$1.1B+ Frisco / PGA District cluster of 30+ assets</strong>.
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

      {/* 03 — LEADERSHIP.
          REDESIGNED. The previous version gave each principal a large
          alternating portrait with the name on a plate crossing the photo's
          inner edge — photograph-led, and close in kind to the player
          spreads on /players. A venture and investment firm should not read
          like a team roster.

          This is a LEDGER, and it is typography-led. The two principals are
          entries in one continuous ruled register: a thick crimson rule
          opens it, a hairline divides the entries, a rule closes it. Each
          entry carries a left rail with the ordinal and the seat, the name
          at display scale with an oversized ghosted numeral layered behind
          it, the biography set on a proper measure, and the portrait as a
          tall narrow column held to the right edge of the entry — present
          and dignified, but not the dominant element.

          The asymmetry is in the register, not in the people: both
          portraits are framed identically at the same ratio, and the first
          entry is larger only because it is first in the firm's own listing.
          Nothing here implies a seniority the source does not state.

          Both principals, both photographs, both verbatim biographies and
          both seats are preserved exactly as FOUNDERS holds them. No person
          was added or removed, and no title, biography or achievement was
          invented or borrowed from another page. */}
      <Section surface="ivory" className="vv-lead-sec">
        <div className="cm-track vv-lead-head">
          <div className="vv-lead-head-a">
            <IndexLabel n="03">Leadership</IndexLabel>
            <SectionTitle lines={["THE PEOPLE", "BEHIND IT."]} />
          </div>
        </div>

        <ol className="vv-ledger">
          {FOUNDERS.map((f, i) => (
            <li className="vv-entry" key={f.name} style={{ ["--rank" as string]: i }}>
              <div className="cm-track vv-entry-in">
                <div className="vv-entry-rail">
                  <span className="vv-entry-n" aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="vv-entry-seat">{f.role}</span>
                </div>

                <div className="vv-entry-main">
                  <span className="vv-entry-ghost" aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="vv-entry-name" data-rise>
                    {f.name}
                  </h3>
                  <p className="vv-entry-bio" data-rise>
                    {f.body}
                  </p>
                </div>

                <figure className="vv-entry-f" data-rise>
                  <Image
                    src={f.image}
                    alt={f.imageAlt}
                    fill
                    sizes="(max-width: 767px) 100vw, (max-width: 1023px) 40vw, 22vw"
                    style={{ objectPosition: f.imagePosition }}
                  />
                </figure>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* 04 — GOVERNANCE.
          Two objects, deliberately unlike each other and unlike every ruled
          index on this site.

          The board seat is a MINUTE: a single bordered statement panel with
          a gold rule down its leading edge, the seat named above the person
          and the brochure's sentence set as the statement itself.

          The advisory board is a TYPE FIELD, not a list. The eight
          disciplines are set as large display words that wrap as one
          continuous field with gold lozenges between them, so the section
          shows the breadth being assembled instead of enumerating it in
          eight rows. The heading above it is the brochure's own wording
          ("Being assembled across…"), so the field is that sentence,
          typeset — nothing has been added to it. */}
      <Section surface="paper" className="vv-gov-sec">
        <div className="cm-track vv-gov2">
          <IndexLabel n="04">Governance</IndexLabel>

          <div className="vv-gov2-h">
            <SectionTitle lines={["BOARD &", "ADVISORY."]} />
          </div>

          <article className="vv-minute" data-rise>
            <p className="vv-minute-k">{BOARD_MEMBER.role}</p>
            <h3 className="vv-minute-name">{BOARD_MEMBER.name}</h3>
            <p className="vv-minute-body">{BOARD_MEMBER.body}</p>
          </article>

          <div className="vv-wall">
            <p className="vv-wall-k" data-rise>
              Advisory Board · being assembled across
            </p>
            <p className="vv-wall-set" data-rise>
              {ADVISORY_DISCIPLINES.map((d) => (
                <span className="vv-wall-w" key={d}>
                  {d}
                </span>
              ))}
            </p>
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

      {/* 06 — THE ROADMAP.
          Added in the September 2026 content audit. The firm's own sequence,
          from the PGA brochure p. 09 — and the one place on this site that
          states the order in which the platform is being built.

          It is deliberately NOT a second telling of the PGA partnership:
          /golf-development carries the licence itself and the six roles the
          PGA plays. This is status and sequence only, which is what a parent
          company page owes a reader that a platform page does not.

          The status chips are the brochure's own words. Two steps are marked
          done; three are marked underway, and are not dressed up as more
          than that. */}
      <Section surface="paper" className="vv-road-sec">
        <div className="cm-track vv-road">
          <IndexLabel n="06">The Roadmap</IndexLabel>

          <div className="vv-road-h">
            <SectionTitle lines={["BRINGING IT", "ALL TOGETHER."]} />
            <p className="cm-lede" data-rise>
              The first step was the partnership with the PGA. The second,
              ownership of a franchise in India&rsquo;s first professional golf
              league. What follows is the bridge itself — academies, resorts,
              and real estate — conversations already underway to make the
              plan real.
            </p>
          </div>

          <ol className="vv-road-set">
            {ROADMAP.map((r) => (
              <li
                key={r.n}
                className={r.state === "Done" ? "is-done" : "is-open"}
                data-rise
              >
                <span className="vv-road-n" aria-hidden>
                  {r.n}
                </span>
                <span className="vv-road-s">{r.state}</span>
                <span className="vv-road-t">{r.t}</span>
              </li>
            ))}
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
