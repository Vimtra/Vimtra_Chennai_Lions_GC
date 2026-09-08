import type { Metadata } from "next";
import Link from "next/link";
import StoryHero from "@/components/site/StoryHero";
import FullBleedStatement from "@/components/site/FullBleedStatement";
import { Section, IndexLabel, SectionTitle } from "@/components/site/Section";

export const metadata: Metadata = {
  alternates: { canonical: "/invest" },
  title: "Invest",
  description:
    "The Vimtra Chennai Lions GC franchise opportunity — owned outright by Vimtra Ventures, entered at the formation of Indian franchise golf.",
};

/* ---------------------------------------------------------------------------
   CONTENT SOURCES
   Every claim on this page is sourced from the Chennai Lions IGPL brochure
   (pp. 03, 17–19) or the Vimtra Ventures profile. No returns, valuations,
   tickets, ROI, projections, testimonials, or invented market figures.

   DE-DUPLICATION
     /invest   — the capital case: thesis, franchise structure, who the
                 firm welcomes, the owner. This page.
     /partners — confirmed partners and the four commercial tiers.
     /vimtra-ventures — the firm in full. Linked, not restated.

   PHOTOGRAPHY: licensed frames already in public/assets/photo/. Alt text
   describes the scene only — none of these is a Lions venue.
--------------------------------------------------------------------------- */

/* The market case — Chennai Lions IGPL brochure p. 17, verbatim. Three
   top-line figures about the MARKET, and nothing about this franchise's own
   performance.

   The franchise-commitment and real-estate-premium figures briefly lived
   here too. They were moved into "The three pillars" below, where each sits
   with the pillar it actually measures: a figure repeated in two places on
   one page is duplication, not emphasis. */
const MARKET = [
  { v: "$1B+", l: "India Golf Market Today" },
  { v: "17.1%", l: "Sports Tourism CAGR" },
  { v: "10", l: "IGPL Franchises · Chennai is one" },
];

/* ---------------------------------------------------------------------------
   THE THREE PILLARS — Vimtra x PGA of America brochure, pp. 05, 06 and 08
   ("BUSINESS PILLAR 1/2/3 OF 3"). Statements and figures are verbatim.

   Every figure is labelled with the thing it measures. None is a projection,
   a target, a yield or a return, and nothing here says or implies what an
   investor would receive — the sources make no such statement and neither
   does this page.
--------------------------------------------------------------------------- */
const PILLARS = [
  {
    n: "01",
    t: "Sports Tourism",
    d: "Golf tourists spend more per capita and stay longer than any other visitor segment — making golf resorts and destination tournaments highly profitable anchors for India's growing travel economy.",
    /* No figure group. The pillar's own number — 17.1% sports-tourism CAGR —
       is already the second figure in the market rail above, and the source
       for both is the same statistic. It is stated once on this page, in the
       rail, and the pillar carries the argument instead. */
    figures: [],
    // p. 05 — the three destination circuits, with the source's own labels.
    set: [
      { k: "Coastal", v: "Goa", d: "Resort golf paired with a mature beach-leisure circuit." },
      { k: "Backwaters", v: "Kerala", d: "Wellness-forward golf tourism through the year." },
      { k: "Heritage", v: "Rajasthan", d: "Palace-resort golf that anchors premium international tours." },
    ],
  },
  {
    n: "02",
    t: "Franchise Leagues",
    d: "The Indian Golf Premier League (IGPL), launched in 2025, has attracted $100M in franchise commitments — the largest private investment in Indian golf history. Compact 8–10-acre courses in Tier 2/3 cities expand accessibility and anchor integrated golf communities.",
    figures: [
      // "10 city franchises" is in the market rail above — not repeated here.
      { v: "$100M", l: "Franchise commitments" },
      { v: "8–10 ac", l: "Compact course footprint" },
    ],
  },
  {
    n: "03",
    t: "Real Estate Integration",
    d: "Golf-facing homes command 5–12% price premiums — up to 25% in metros like Gurugram. Mixed-use sports townships combining residential, academies, and leisure are more resilient than single-purpose mega projects.",
    figures: [
      { v: "5–12%", l: "Golf-facing home premium" },
      { v: "25%", l: "Up to, in metros" },
    ],
  },
];

// Brochure p. 03 + Vimtra Ventures profile — the documented chain of
// ownership and operation. No invented org chart, no financial mechanics.
const STRUCTURE = [
  {
    tag: "Parent",
    name: "Vimtra Ventures",
    // Deliberately short. The firm's full description — founding, the six
    // verticals, "principal, not intermediary", the credential figures —
    // belongs to /vimtra-ventures and is not restated here; this card only
    // needs to establish who sits at the top of the chain.
    body: "The San Francisco and Chennai investment firm that owns the franchise outright, operating as principal since 1995. Sports is one of its six verticals.",
  },
  {
    tag: "Operating Framework",
    name: "Vimtra Golf Ventures",
    body: "The dedicated Indian golf operating entity — coaching curriculum, coach certification, event standards, and course-operating standards under a single institutional authority.",
  },
  {
    tag: "Franchise",
    name: "Vimtra Chennai Lions GC",
    body: "Chennai's franchise in the AM Green Indian Golf Premier League — Season 2026. Vimtra's Indian golf platform expressed as a competitive team.",
  },
];

// Brochure p. 17 framing + ownership facts already on this route.
const REASONS = [
  {
    k: "01",
    t: "At formation.",
    d: "Entered at formation rather than after the fact — ten franchises, a fifteen-event calendar, Chennai among them.",
  },
  {
    k: "02",
    t: "Owned outright.",
    // Deliberately no firm profile here — the ownership chain is the
    // structure diagram above, and the firm itself is /vimtra-ventures.
    // This reason has to say why sole ownership matters, not repeat who
    // the owner is for the third time on one page.
    d: "A single owner, not a syndicate. Decisions on the squad, the academy and the course sit with one principal, on one timeline.",
  },
  {
    k: "03",
    t: "Golf-led communities.",
    d: "Premium golf facilities integrated with luxury residential communities, lifestyle amenities, and investment opportunities — an ecosystem connecting sport, real estate, and long-term value.",
  },
];

// Vimtra Ventures profile — canonical partner categories the firm welcomes.
const WELCOME = [
  {
    label: "Individuals",
    body: "High-net-worth individuals who share a passion for golf.",
  },
  {
    label: "Family Offices",
    body: "Long-horizon capital aligned with the golf-led-community thesis.",
  },
  {
    label: "Institutions",
    body: "Strategic institutional partners bringing capital and relationships.",
  },
  {
    label: "Corporate Partners",
    body: "Brand partners bringing category expertise and audience reach.",
  },
  {
    label: "Strategic Investors",
    body: "Investors bringing capital, expertise, industry knowledge, and a shared commitment.",
  },
];

export default function InvestPage() {
  return (
    <>
      <StoryHero
        eyebrow="Franchise Opportunity · AM Green IGPL"
        title={["INVEST"]}
        line="Join a franchise on day one of a decade."
        image="/assets/photo/home-club-aerial-golden.jpg"
        imageAlt="A golf course photographed from the air at golden hour, the sea on the horizon"
        imagePosition="50% 42%"
        cta={{
          href: "/contact?topic=Partnerships",
          label: "ENQUIRE",
          variant: "primary",
        }}
      />

      {/* 01 — INVESTMENT THESIS.
          One display line, the brochure's market case as supporting copy,
          the three documented figures as a ruled field — not a card row. */}
      <Section surface="ivory">
        <div className="cm-track iv-thesis">
          <IndexLabel n="01">The Thesis</IndexLabel>
          <h2 className="cm-display iv-thesis-h" data-rise>
            A FIRST-MOVER <em>window</em>.
          </h2>
          <div className="iv-thesis-b" data-rise>
            <p>
              Indian franchise golf begins now. Ten franchises, a fifteen-event
              calendar, and a domestic golf market already past $1B — entered
              at formation rather than after the fact.
            </p>
          </div>
          <dl className="iv-market" data-rise>
            {MARKET.map((m) => (
              <div key={m.l}>
                <dt>{m.v}</dt>
                <dd>{m.l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      <FullBleedStatement
        eyebrow="Owned by the firm"
        line={["OWNED", "OUTRIGHT."]}
        image="/assets/photo/club-hero-fairway-dusk.jpg"
        imageAlt="A championship fairway and treeline under a dusk sky"
        imagePosition="50% 48%"
      />

      {/* 02 — THE FRANCHISE.
          REBUILT to remove a duplication. This section used to render the
          `gd-index` component with `gd-framework-facility.jpg` beside it —
          the exact pattern and the exact photograph that /golf-development
          used for its own "The Framework" section, so a reader moving
          between the two pages met the same layout with the same picture
          twice. Both are gone from here: no shared photograph, no numbered
          index, no two-column split.

          What replaces it is a containment diagram, which is what the
          documented structure actually is. Vimtra Ventures holds the
          operating framework; the operating framework holds the franchise.
          So each level is drawn INSIDE the one above it, stepping in and
          intensifying from a hairline outline to the crimson plate at the
          centre — the franchise being invested in. The nesting is generated
          from STRUCTURE, so it follows however many levels that array
          holds, and it carries no number, valuation or mechanic of any kind
          because the brochure states none.

          The list is a nested <ol> so the containment is real in the
          document, not just drawn. */}
      <Section surface="paper" className="iv-chain-sec">
        <div className="cm-track iv-chain">
          <IndexLabel n="02">The Franchise</IndexLabel>

          <div className="iv-chain-h">
            <h2 className="cm-display" data-rise>
              PARENT. PLATFORM. <em>franchise</em>.
            </h2>
            <p className="iv-chain-lede" data-rise>
              Each holds the next. Read it from the outside in.
            </p>
          </div>

          <div className="iv-chain-d" data-rise>
            {(function nest(level: number): React.ReactNode {
              const s = STRUCTURE[level];
              if (!s) return null;
              const inner = nest(level + 1);
              return (
                <ol className={`iv-ring iv-ring-${level}`}>
                  <li>
                    <p className="iv-ring-k">
                      <span className="iv-ring-n" aria-hidden>
                        {String(level + 1).padStart(2, "0")}
                      </span>
                      {s.tag}
                    </p>
                    <h3 className="iv-ring-t">{s.name}</h3>
                    <p className="iv-ring-d">{s.body}</p>
                    {inner}
                  </li>
                </ol>
              );
            })(0)}
          </div>
        </div>
      </Section>

      {/* THE THREE PILLARS.
          The business case, from the Vimtra x PGA brochure pp. 05, 06 and
          08. It sits between the franchise structure and the reasons because
          it is the bridge: structure explains what the thing IS, the pillars
          explain where the value is said to come from, and the reasons argue
          the timing.

          Composition is a ledger, not three cards and not another numbered
          index: each pillar is a full-width  ruled row carrying its
          statement on the left and its own figures as a data group on the
          right, with the destination circuits set as an inline register
          under the first. Distinct from the nested rings above it and the
          numbered reasons below it.

          No figure here is a projection or a return. Each is labelled with
          the metric it measures and is stated exactly as the source states
          it. */}
      <Section surface="ivory" className="iv-pillar-sec">
        <div className="cm-track iv-pillars">
          <IndexLabel n="03">The Three Pillars</IndexLabel>

          <div className="iv-pillars-h">
            <h2 className="cm-display" data-rise>
              WHERE THE VALUE IS <em>said to sit</em>.
            </h2>
          </div>

          <ol className="iv-pillar-set">
            {PILLARS.map((p) => (
              <li
                key={p.n}
                data-rise
                className={p.figures.length ? undefined : "is-solo"}
              >
                <div className="iv-pillar-a">
                  <p className="iv-pillar-k">
                    <span className="iv-pillar-n" aria-hidden>
                      {p.n}
                    </span>
                    Pillar {p.n} of 03
                  </p>
                  <h3 className="iv-pillar-t">{p.t}</h3>
                  <p className="iv-pillar-d">{p.d}</p>

                  {p.set && (
                    <ul className="iv-pillar-circuit">
                      {p.set.map((c) => (
                        <li key={c.v}>
                          <span className="iv-circuit-k">{c.k}</span>
                          <span className="iv-circuit-v">{c.v}</span>
                          <span className="iv-circuit-d">{c.d}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {p.figures.length > 0 && (
                  <dl className="iv-pillar-f">
                    {p.figures.map((f) => (
                      <div key={f.l}>
                        <dt>{f.v}</dt>
                        <dd>{f.l}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* 03 — WHY THIS OPPORTUNITY.
          Three sourced statements, then who the firm actually welcomes.
          No manufactured benefits. Commercial tiers live on /partners. */}
      <Section surface="ink">
        <div className="cm-track iv-why">
          <div className="iv-why-rail">
            <IndexLabel n="04" tone="dark">
              Why This Opportunity
            </IndexLabel>
            <SectionTitle lines={["THE CASE,", "AS WRITTEN."]} />
          </div>

          <ol className="iv-reasons">
            {REASONS.map((r) => (
              <li key={r.k} data-rise>
                <span className="iv-reason-n">{r.k}</span>
                <h3 className="iv-reason-t">{r.t}</h3>
                <p className="iv-reason-d">{r.d}</p>
              </li>
            ))}
          </ol>

          <p className="iv-welcome-k" data-rise>
            Who we welcome
          </p>
          <ul className="iv-welcome">
            {WELCOME.map((w) => (
              <li key={w.label} data-rise>
                <h3>{w.label}</h3>
                <p>{w.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* 04 — VIMTRA VENTURES.
          Ownership fact and the second sports position — then out to
          the firm page. No founder bios, no six-vertical index. */}
      <Section surface="ivory">
        <div className="cm-track iv-owner">
          <IndexLabel n="05">Vimtra Ventures</IndexLabel>
          <h2 className="cm-display iv-owner-h" data-rise>
            THE FIRM BEHIND THE <em>franchise</em>.
          </h2>
          <div className="iv-owner-b" data-rise>
            <p>
              Alongside the Chennai Lions, Vimtra holds an ownership position
              in the <strong>Dallas Sidekicks</strong> — the second franchise
              in its sports vertical. The firm&rsquo;s full profile, its
              verticals and its credentials are set out on its own page.
            </p>
            <Link href="/vimtra-ventures" className="hp-btn hp-btn-text">
              The firm
              <span className="hp-arrow" aria-hidden>
                →
              </span>
            </Link>
          </div>
        </div>
      </Section>

      {/* 05 — ENQUIRY.
          Existing contact route and the partnerships mailbox already
          published on /contact. No embedded lead form. */}
      <Section surface="ink" size="tight" className="hp-sec-atmos">
        <div className="cm-track iv-enquire">
          <IndexLabel n="06" tone="dark">
            Enquiries
          </IndexLabel>
          <div className="iv-enquire-h">
            <SectionTitle lines={["OPEN THE", "CONVERSATION."]} />
          </div>
          <div className="iv-enquire-b" data-rise>
            <p>
              Partnerships, sponsorship, and golf-development enquiries go
              through the franchise desk.
            </p>
            <a
              className="iv-enquire-mail"
              href="mailto:golfventures@vimtra.com"
            >
              golfventures@vimtra.com
            </a>
            <div className="iv-enquire-actions">
              <Link
                href="/contact?topic=Partnerships"
                className="hp-btn hp-btn-primary"
              >
                CONTACT THE FRANCHISE
                <span className="hp-arrow" aria-hidden>
                  →
                </span>
              </Link>
              <Link href="/partners" className="hp-btn hp-btn-ghost hp-on-dark">
                Commercial partnerships
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
