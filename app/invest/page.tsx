import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import StoryHero from "@/components/site/StoryHero";
import FullBleedStatement from "@/components/site/FullBleedStatement";
import { Section, IndexLabel, SectionTitle } from "@/components/site/Section";

export const metadata: Metadata = {
  title: "Invest · Vimtra Chennai Lions GC",
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

// Brochure p. 17 — the market case, verbatim numbers.
const MARKET = [
  { v: "$1B+", l: "India Golf Market Today" },
  { v: "17.1%", l: "Sports Tourism CAGR" },
  { v: "10", l: "IGPL Franchises · Chennai is one" },
];

// Brochure p. 03 + Vimtra Ventures profile — the documented chain of
// ownership and operation. No invented org chart, no financial mechanics.
const STRUCTURE = [
  {
    tag: "Parent",
    name: "Vimtra Ventures",
    body: "A US-based venture capital and investment firm founded in 1995. Operates as principal, not intermediary, across six verticals — San Francisco and Chennai.",
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
    d: "The Chennai Lions are owned outright by Vimtra Ventures, a firm operating as principal across six verticals since 1995.",
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

      {/* 02 — THE BUSINESS / FRANCHISE MODEL.
          Parent → operating entity → franchise. Documented names only. */}
      <Section surface="paper">
        <div className="cm-track iv-model">
          <IndexLabel n="02">The Franchise</IndexLabel>

          <div className="iv-model-h">
            <h2 className="cm-display" data-rise>
              PARENT. PLATFORM. <em>franchise</em>.
            </h2>
          </div>

          <div className="iv-model-f" data-rise>
            <div className="gd-fig">
              <Image
                src="/assets/photo/gd-framework-facility.jpg"
                alt="A clubhouse, practice range and course seen from the air"
                fill
                sizes="(max-width: 1023px) 100vw, 40vw"
                style={{ objectPosition: "46% 52%" }}
              />
            </div>
          </div>

          <ol className="gd-index">
            {STRUCTURE.map((s, i) => (
              <li key={s.name} data-rise>
                <span className="gd-index-n">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="gd-index-k">{s.tag}</span>
                  <span className="gd-index-t">{s.name}</span>
                </span>
                <p className="gd-index-d">{s.body}</p>
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
            <IndexLabel n="03" tone="dark">
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
          <IndexLabel n="04">Vimtra Ventures</IndexLabel>
          <h2 className="cm-display iv-owner-h" data-rise>
            THE FIRM BEHIND THE <em>franchise</em>.
          </h2>
          <div className="iv-owner-b" data-rise>
            <p>
              The Chennai Lions are owned outright by Vimtra Ventures — a San
              Francisco and Chennai investment firm founded in 1995. Sports
              franchises is one of six verticals: this team, and an ownership
              position in the Dallas Sidekicks.
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
          <IndexLabel n="05" tone="dark">
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
