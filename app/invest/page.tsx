import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/site/PageHero";
import {
  Section,
  IndexLabel,
  SectionTitle,
  NumberedList,
  Figures,
} from "@/components/site/Section";

export const metadata: Metadata = {
  title: "Invest & Partner · Vimtra Chennai Lions GC",
  description:
    "Join a franchise on day one of a decade. The Chennai Lions investment thesis, the first-mover window in franchise golf, and the four commercial tiers open to new partners.",
};

// Every claim on this page is sourced from the Chennai Lions IGPL brochure
// (pp. 17–19) and the Vimtra Ventures profile. No fictional partners,
// deal terms, minimum tickets, or valuation figures appear here — those
// belong in a private commercial conversation, not the public site.

// Brochure p. 17 — the market case, verbatim numbers.
const MARKET = [
  { v: "$1B+", l: "India Golf Market Today" },
  { v: "17.1%", l: "Sports Tourism CAGR" },
  { v: "10", l: "IGPL Franchises · Chennai is one" },
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
    body:
      "Strategic institutional partners bringing capital and relationships.",
  },
  {
    label: "Corporate Partners",
    body:
      "Brand partners bringing category expertise and audience reach.",
  },
  {
    label: "Strategic Investors",
    body:
      "Investors bringing capital, expertise, industry knowledge, and a shared commitment.",
  },
];

// Brochure p. 19 — four commercial tiers, verbatim structure.
interface Tier {
  code: string;
  name: string;
  headline: string;
  bullets: string[];
  badgeStyle: React.CSSProperties;
}

const TIERS: Tier[] = [
  {
    code: "TIER 01",
    name: "Principal Partner",
    headline: "Front-of-jersey positioning with the team mark.",
    bullets: [
      "Front-of-jersey positioning",
      "Event lockup with the team mark",
      "Hospitality across all Chennai home rounds",
      "Co-branded press moments",
    ],
    badgeStyle: { background: "#1A1513", color: "#E9CB8E" },
  },
  {
    code: "TIER 02",
    name: "Associate Partner",
    headline: "Secondary kit branding, digital-first storytelling.",
    bullets: [
      "Secondary kit branding",
      "Event backdrops",
      "Digital-first team storytelling package",
      "Curated home-round hospitality",
    ],
    badgeStyle: {
      background: "linear-gradient(180deg,#E6C57E,#C39A52)",
      color: "#3A1A06",
    },
  },
  {
    code: "TIER 03",
    name: "Season Partner",
    headline: "Season-long content stack + curated tournament hospitality.",
    bullets: [
      "Season-long visibility across a defined content and event stack",
      "Curated hospitality at selected tournaments",
    ],
    badgeStyle: { background: "rgba(196,32,42,0.10)", color: "#C4202A" },
  },
  {
    code: "TIER 04",
    name: "Community Partner",
    headline: "Grassroots and junior-development co-programmes.",
    bullets: [
      "Grassroots and junior-development co-programmes with the franchise",
      "Anchored around Chennai’s home fixtures",
    ],
    badgeStyle: { background: "rgba(26,21,19,0.08)", color: "#1A1513" },
  },
];

export default function InvestPage() {
  return (
    <>
      <PageHero
        variant="immersive"
        eyebrow="Invest & Partner"
        title={["INVEST"]}
        lead={
          <>
            Join a franchise on day one of a decade. The Chennai Lions
            investment thesis, the first-mover window in franchise golf, and
            the commercial tiers open to new partners.
          </>
        }
      />

      <Section surface="ink" size="tight">
        <IndexLabel n="01" tone="dark">The Market</IndexLabel>
        <Figures items={MARKET.map((m) => ({ v: m.v, l: m.l }))} />
      </Section>

      <Section surface="ivory">
        <IndexLabel n="02">Why Now</IndexLabel>
        <div className="hp-split">
          <div>
            <SectionTitle lines={["A FIRST-MOVER", "WINDOW."]} />
          </div>
          <div>
            <p className="hp-body" data-rise>
              Indian franchise golf begins now. Ten franchises, a fifteen-event
              calendar, and a domestic golf market already past $1B — entered
              at formation rather than after the fact.
            </p>
            <p className="hp-body" data-rise>
              The Chennai Lions are owned outright by Vimtra Ventures, a firm
              operating as principal across six verticals since 1995.
            </p>
          </div>
        </div>
      </Section>

      <Section surface="paper">
        <IndexLabel n="03">Who We Welcome</IndexLabel>
        <div className="hp-split">
          <div><SectionTitle lines={["ALIGNED", "CAPITAL."]} /></div>
          <NumberedList items={WELCOME.map((w) => ({ t: w.label, d: w.body }))} />
        </div>
      </Section>

      <Section surface="ivory">
        <IndexLabel n="04">Commercial Tiers</IndexLabel>
        <SectionTitle lines={["FOUR WAYS IN."]} />
        <ol className="hp-tiers">
          {TIERS.map((t) => (
            <li className="hp-tier" key={t.code} data-rise>
              <div className="hp-tier-head">
                <span className="hp-tier-code">{t.code}</span>
                <h3 className="hp-tier-name">{t.name}</h3>
                <p className="hp-tier-headline">{t.headline}</p>
              </div>
              <ul className="hp-tier-list">
                {t.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </Section>

      <Section surface="ink" size="tight">
        <div className="hp-cta-row">
          <div><SectionTitle lines={["LET’S TALK."]} /></div>
          <div className="hp-cta-actions" data-rise>
            <Link href="/contact" className="hp-btn hp-btn-primary">
              CONTACT THE FRANCHISE
              <span className="hp-arrow" aria-hidden>→</span>
            </Link>
            <Link href="/partners" className="hp-btn hp-btn-ghost">See current partners</Link>
          </div>
        </div>
      </Section>
    </>
  );
}
