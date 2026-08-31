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
  title: "Partners · Vimtra Chennai Lions GC",
  description:
    "Verified partners of the Vimtra Chennai Lions GC — league title partner am green, kit manufacturer FIRSTCUT — and the four commercial tiers open to new partners.",
};

// Only two commercial partners are named on the current record: the league
// title partner and the kit manufacturer, both documented in the brochure
// (p. 13). No sponsor slots are pre-filled with fictional brands and no
// "Slot Available" tiles are presented as marketing filler — the tiered
// section below describes what a partnership actually includes.

const CONFIRMED_PARTNERS = [
  {
    tag: "League Title Partner · Kit Sponsor",
    name: "am green",
    scope: "AM Green Indian Golf Premier League",
    // Brochure p. 13 verbatim.
    detail:
      "League-wide title partner of the AM Green IGPL and kit sponsor across the Vimtra Chennai Lions Season 2026 match kit.",
  },
  {
    tag: "Kit Manufacturer",
    name: "FIRSTCUT",
    scope: "Season 2026 Match Kit",
    // Brochure p. 13 verbatim.
    detail: "Kit production partner for the Chennai Lions Season 2026.",
  },
];

// Brochure p. 19 — "Four commercial tiers, each structured around visibility
// on player kit, event branding, digital reach, and hospitality access at
// Chennai home rounds and international events."
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
    headline: "Season-long content + curated tournament hospitality.",
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
      "Anchored around Chennai&apos;s home fixtures",
    ],
    badgeStyle: { background: "rgba(26,21,19,0.08)", color: "#1A1513" },
  },
];

// Brochure p. 17 — "India's golf market has crossed the USD 1 billion mark.
// … 17.1% sports-tourism CAGR. … Ten franchises — Chennai is one."
const MARKET_CASE = [
  { v: "$1B+", l: "India Golf Market Today" },
  { v: "17.1%", l: "Sports Tourism CAGR" },
  { v: "10", l: "IGPL Franchises · Chennai is one" },
];

export default function PartnersPage() {
  return (
    <>
      <PageHero
        eyebrow="Partner With the Lions"
        title={["PARTNERS"]}
        lead={
          <>
            Join a franchise on day one of a decade. Four commercial tiers,
            each structured around visibility on player kit, event branding,
            digital reach, and hospitality.
          </>
        }
      />

      <Section surface="ivory">
        <IndexLabel n="01">Confirmed Partners</IndexLabel>
        <SectionTitle lines={["WHO’S", "ALREADY IN."]} />
        <ul className="hp-franchises">
          {CONFIRMED_PARTNERS.map((p) => (
            <li key={p.name} data-rise>
              <div className="hp-franchise">
                <span className="hp-franchise-tag">{p.scope}</span>
                <span className="hp-franchise-body">
                  <span className="hp-franchise-name">{p.name}</span>
                  <span className="hp-franchise-detail">{p.detail}</span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section surface="ink" size="tight">
        <IndexLabel n="02" tone="dark">The Market Case</IndexLabel>
        <Figures items={MARKET_CASE.map((m) => ({ v: m.v, l: m.l }))} />
      </Section>

      <Section surface="paper">
        <IndexLabel n="03">Commercial Tiers</IndexLabel>
        <SectionTitle lines={["FOUR WAYS", "TO PARTNER."]} />
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

      <Section surface="ivory" size="tight">
        <div className="hp-cta-row">
          <div><SectionTitle lines={["PARTNER WITH", "THE LIONS."]} /></div>
          <div className="hp-cta-actions" data-rise>
            <Link href="/contact" className="hp-btn hp-btn-primary">
              START A CONVERSATION
              <span className="hp-arrow" aria-hidden>→</span>
            </Link>
            <Link href="/invest" className="hp-btn hp-btn-ghost">Investment thesis</Link>
          </div>
        </div>
      </Section>
    </>
  );
}
