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
  title: "The Club · Vimtra Chennai Lions GC",
  description:
    "Chennai's franchise in the AM Green IGPL — founded 2026, owned outright by Vimtra Ventures, built for the decade of franchise golf.",
};

// Every stat below is sourced from the Chennai Lions IGPL brochure (Season
// 2026) and the Vimtra Ventures profile. No membership counts, seat-of-pants
// numbers, or aspirational-as-fact stats are included.
const STATS = [
  // Brochure p. 06 — "FOUNDED · 2026 · Inaugural franchise season".
  { v: "2026", l: "Inaugural Season", dark: false },
  // Brochure p. 06 — "Season 2026 roster · Four names. One team sheet."
  { v: "04", l: "Season 2026 Roster", dark: false },
  // Brochure p. 05 — "15 EVENTS / SEASON · Ten in India, five international".
  { v: "15", l: "Events on the Calendar", dark: false },
  // Brochure p. 05 — "10 FRANCHISES · Ten Indian cities represented".
  { v: "IGPL", l: "AM Green · Franchise", dark: true },
];

// Brochure-verified positioning language used across the page. Nothing here
// is a claim of measurable performance — it's brand narrative sourced from
// the brochure's own headings ("A team built for the long game", "The
// long-game city", "Chennai's roar on the world's newest stage").
const CODE = [
  {
    n: "01",
    t: "Marquee",
    // Brochure p. 06 — "MARQUEE · A proven international marquee".
    d: "A proven international marquee at the front of the team sheet — a signal to the roster, the gallery, and the calendar.",
  },
  {
    n: "02",
    t: "Domestic Core",
    // Brochure p. 06 — "…a proven domestic winner, an internationally ranked pro,
    // and a rising IGPL competitor — balanced by design".
    d: "A proven domestic winner, an internationally ranked pro, and an active IGPL competitor — balanced by design.",
  },
  {
    n: "03",
    t: "Long Game",
    // Brochure p. 06 — "Our commitment is not to a single season. It is to the
    // decade of Indian franchise golf that begins now."
    d: "A commitment measured in decades, not seasons — every roster and infrastructure decision made against a ten-year horizon.",
  },
  {
    n: "04",
    t: "Home City",
    // Brochure p. 04 — "A coastal capital, a deep amateur golf base, and one of
    // the country's most consistent producers of touring professionals."
    d: "Chennai. A coastal capital, a deep amateur golf base, and one of the country's most consistent producers of touring pros.",
  },
];

// Named leadership — Vimtra Ventures Profile & brochure pp. 14, 16.
// Only individuals explicitly named in the source documents appear here.
const LEADERSHIP = [
  {
    init: "SY",
    name: "Subash Yammada",
    role: "Founder & CEO · Vimtra Ventures",
    // Brochure p. 14.
    d: "Serial entrepreneur and CEO of Vimtra Ventures — three decades of leadership across sports franchises, PE, VC, real estate, golf communities and academies, tech, healthcare, and hospitality.",
    bg: "linear-gradient(160deg,#C9242E,#871119)",
    color: "#fff",
  },
  {
    init: "TY",
    name: "Thimmaji Rao Yammada",
    role: "Founder & Managing Director · Vimtra Ventures",
    // Brochure p. 14.
    d: "Thirty-one years of leadership across PE, sports franchises, infrastructure, real estate, and industrial development across North America and India — with full-cycle real-estate expertise across commercial, residential, retail, and mixed-use assets.",
    bg: "linear-gradient(160deg,#E6C57E,#C39A52)",
    color: "#3A1A06",
  },
  {
    init: "RB",
    name: "Ravi Babu Mannam",
    role: "Board of Directors · Vimtra Ventures",
    // Brochure p. 16 (Vision & Advisory).
    d: "Strengthening the firm's leadership and advisory ecosystem and the expansion of its golf and community-development initiatives.",
    bg: "#1A1513",
    color: "#E9CB8E",
  },
  {
    init: "AB",
    name: "Advisory Board",
    role: "Building in Progress",
    // Brochure p. 16 — "A high-calibre Advisory Board is being assembled…".
    d: "A high-calibre Advisory Board is being assembled across business, investments, golf, real estate, infrastructure, community development, branding, and sports management.",
    bg: "#C4202A",
    color: "#fff",
  },
];

// Kit sponsors — brochure p. 13. Everything on this row is verified: title
// sponsor "am green" and kit manufacturer "FIRSTCUT". Palette also verified.
const KIT = [
  {
    tag: "Title Partner",
    name: "am green",
    // Brochure p. 13 verbatim.
    detail: "League-wide title partner and kit sponsor.",
  },
  {
    tag: "Kit Manufacturer",
    name: "FIRSTCUT",
    detail: "Kit production partner for the 2026 season.",
  },
];

// Brochure p. 13 — kit palette verbatim.
const PALETTE = [
  { label: "Pride Red", swatch: "#C4202A", ink: "#fff" },
  { label: "Highlight Gold", swatch: "#C39A52", ink: "#3A1A06" },
  { label: "Court Yellow", swatch: "#F2D66C", ink: "#3A1A06" },
  { label: "Stadium Cream", swatch: "#F4F0E8", ink: "#1A1513" },
  { label: "Jet Black", swatch: "#1A1513", ink: "#E9CB8E" },
];

export default function TheClubPage() {
  return (
    <>
      <PageHero
        eyebrow="The Franchise · Season 2026"
        title={["THE CLUB"]}
        lead={
          <>
            Vimtra Chennai Lions GC is Chennai&apos;s franchise in the AM Green
            Indian Golf Premier League — founded in 2026 and owned outright by
            Vimtra Ventures. A proven international marquee paired with a
            rising domestic core, built for the decade of franchise golf that
            begins now.
          </>
        }
      />

      {/* 01 — IDENTITY */}
      <Section surface="ivory">
        <IndexLabel n="01">Identity</IndexLabel>
        <div className="hp-split">
          <div>
            <SectionTitle lines={["A FRANCHISE", "BUILT FOR THE", "LONG GAME."]} />
          </div>
          <div>
            <p className="hp-body" data-rise>
              The Chennai Lions are Chennai&apos;s roar in a global league — a
              team built to compete on day one and grow through the
              international leg of a fifteen-event season. Every roster
              decision was made against the same test: can this team compete
              week to week, and can it grow through the season?
            </p>
            <p className="hp-body" data-rise>
              The commitment is not to a single season. It is to the decade of
              Indian franchise golf that begins now — anchored by Vimtra
              Ventures and a home city with a deep amateur base.
            </p>
          </div>
        </div>
      </Section>

      {/* 02 — BY THE NUMBERS */}
      <Section surface="ink" size="tight">
        <IndexLabel n="02" tone="dark">
          The franchise in numbers
        </IndexLabel>
        <Figures items={STATS.map((s) => ({ v: s.v, l: s.l }))} />
      </Section>

      {/* 03 — HOW THE TEAM WAS BUILT */}
      <Section surface="ivory">
        <IndexLabel n="03">How the team was built</IndexLabel>
        <div className="hp-split">
          <div>
            <SectionTitle lines={["FOUR NAMES.", "ONE TEAM", "SHEET."]} />
          </div>
          <NumberedList items={CODE.map((c) => ({ t: c.t, d: c.d }))} />
        </div>
      </Section>

      {/* 04 — THE KIT */}
      <Section surface="paper">
        <IndexLabel n="04">The Kit · Season 2026</IndexLabel>
        <div className="hp-split">
          <div>
            <SectionTitle lines={["A WHITE-TO-", "COURT-YELLOW", "GRADIENT."]} />
            <p className="hp-body" data-rise style={{ marginTop: 26 }}>
              Designed to travel from Chennai heat to floodlit international
              venues without losing the team&apos;s visual identity.
            </p>
          </div>
          <div>
            <ul className="hp-swatches" data-rise>
              {PALETTE.map((p) => (
                <li key={p.label}>
                  <span
                    className="hp-swatch"
                    style={{ background: p.swatch }}
                    aria-hidden
                  />
                  <span className="hp-swatch-label">{p.label}</span>
                  <span className="hp-swatch-hex">{p.swatch}</span>
                </li>
              ))}
            </ul>
            <ul className="hp-franchises" data-rise style={{ marginTop: 40 }}>
              {KIT.map((k) => (
                <li key={k.name}>
                  <div className="hp-franchise">
                    <span className="hp-franchise-tag">{k.tag}</span>
                    <span className="hp-franchise-body">
                      <span className="hp-franchise-name">{k.name}</span>
                      <span className="hp-franchise-detail">{k.detail}</span>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* 05 — LEADERSHIP */}
      <Section surface="ivory">
        <IndexLabel n="05">Leadership · Vimtra Ventures</IndexLabel>
        <div className="hp-split">
          <div>
            <SectionTitle lines={["THE BRAIN", "BEHIND", "THE TEAM."]} />
            <p className="hp-body" data-rise style={{ marginTop: 26 }}>
              Vimtra Ventures is a San Francisco &amp; Chennai-based PE, VC,
              and investment firm — founded 1995, operating as principal
              across six verticals.
            </p>
            <Link href="/vimtra-ventures" className="hp-btn hp-btn-text" data-rise>
              About the firm
              <span className="hp-arrow" aria-hidden>
                →
              </span>
            </Link>
          </div>
          <NumberedList
            items={LEADERSHIP.map((l) => ({ k: l.role, t: l.name, d: l.d }))}
          />
        </div>
      </Section>

      {/* CLOSING */}
      <Section surface="ink" size="tight">
        <div className="hp-cta-row">
          <div>
            <SectionTitle lines={["CHENNAI’S ROAR."]} />
          </div>
          <div className="hp-cta-actions" data-rise>
            <Link href="/players" className="hp-btn hp-btn-primary">
              MEET THE PRIDE
              <span className="hp-arrow" aria-hidden>
                →
              </span>
            </Link>
            <Link href="/partners" className="hp-btn hp-btn-ghost">
              Partner with the Lions
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
