import type { Metadata } from "next";
import Image from "next/image";
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
  title: "Vimtra Ventures · Vimtra Chennai Lions GC",
  description:
    "The San Francisco & Chennai-based PE, VC, and investment firm behind the Chennai Lions — founded 1995, 60+ tech acquisitions, six core verticals, owner of the Chennai Lions GC and Dallas Sidekicks.",
};

// Every claim on this page is sourced from the Chennai Lions IGPL brochure
// (pp. 13, 14, 15, 16) or the Vimtra Ventures profile. No numbers, dates,
// or people appear that are not in one of those two documents.

// Brochure p. 15 — headline stats verbatim.
const FIRM_STATS = [
  { v: "1995", l: "Founded" },
  { v: "60+", l: "Technology Acquisitions" },
  { v: "55+", l: "North America Real-Estate Assets" },
  { v: "6", l: "Core Verticals" },
];

// Brochure p. 15 — the six verticals, verbatim descriptions.
const VERTICALS = [
  {
    n: "01",
    name: "Mergers & Acquisitions",
    body:
      "Identifying, acquiring, restructuring, and revitalising businesses with significant growth potential.",
  },
  {
    n: "02",
    name: "Startups",
    body:
      "Founded, incubated, and scaled multiple technology ventures — several spun off into successful independent businesses.",
  },
  {
    n: "03",
    name: "Sports Franchises",
    body:
      "Ownership positions in professional sport — IGPL Vimtra Chennai Lions GC and the Dallas Sidekicks.",
  },
  {
    n: "04",
    name: "Real Estate",
    body:
      "High-value residential and mixed-use developments integrated with lifestyle and hospitality anchors.",
  },
  {
    n: "05",
    name: "Golf Communities & Academies",
    body:
      "Luxury golf-integrated communities and player-development academies across North America and India.",
  },
  {
    n: "06",
    name: "AI Infrastructure",
    body:
      "Hyperscale data-centre ownership and operations serving cloud, enterprise, and AI-workload demand.",
  },
];

// Brochure p. 14 — verbatim leadership bios. Photographs are supplied by
// the franchise (public/assets/subash-yammada.png and
// public/assets/thimmaji-rao-yammada.jpg). `objectPosition` on each entry
// keeps the face inside the crop at every card size.
const FOUNDERS = [
  {
    init: "SY",
    name: "Subash Yammada",
    role: "Founder & CEO",
    image: "/assets/subash-yammada-web.jpg",
    imagePosition: "50% 12%",
    imageAlt: "Subash Yammada — Founder & CEO, Vimtra Ventures",
    body:
      "Serial entrepreneur and CEO of Vimtra Ventures — a San Francisco-based diversified global enterprise. Three decades of leadership cultivating an expansive portfolio across sports franchises, private equity, venture capital, real estate (with a focus on AI infrastructure), golf communities and academies, technology, healthcare, and hospitality.",
    accent: "#C4202A",
  },
  {
    init: "TY",
    name: "Thimmaji Rao Yammada",
    role: "Founder & Managing Director",
    image: "/assets/thimmaji-rao-yammada-web.jpg",
    imagePosition: "50% 30%",
    imageAlt: "Thimmaji Rao Yammada — Founder & Managing Director, Vimtra Ventures",
    body:
      "Managing Director of Vimtra Ventures with 31 years of leadership across private equity, sports franchises, infrastructure, real estate, and industrial development in North America and India. Full-cycle real-estate expertise spanning commercial, residential, retail, and mixed-use assets, with a track record in mid- to large-scale project execution and asset restructuring.",
    accent: "#C39A52",
  },
];

// Brochure p. 16 — verbatim.
const BOARD_MEMBER = {
  init: "RB",
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
    detail:
      "Ownership position in professional sport in North America.",
    href: undefined,
  },
];

export default function VimtraVenturesPage() {
  return (
    <>
      <PageHero
        variant="immersive"
        eyebrow="Ownership · The Firm"
        title={["VIMTRA", "VENTURES"]}
        lead={
          <>
            The brain behind the team. A San Francisco &amp; Chennai-based
            private equity, venture capital, and investment firm focused on
            unlocking growth through strategic investments, corporate-finance
            expertise, operational insight, and value-driven partnerships.
          </>
        }
      />

      {/* 01 — THE FIRM */}
      <Section surface="ivory">
        <IndexLabel n="01">The Firm</IndexLabel>
        <div className="hp-split">
          <div>
            <SectionTitle lines={["A FIRM BUILT", "TO CREATE", "IMPACT."]} />
          </div>
          <div>
            <p className="hp-body" data-rise>
              Vimtra Ventures is a US-based venture capital and investment firm
              founded in 1995, with a track record that includes more than{" "}
              <strong>60 technology acquisitions</strong>. The firm operates as
              principal, not intermediary, across six verticals — mergers &amp;
              acquisitions, startups, sports franchises, real estate, golf
              communities and academies, and AI infrastructure — with an
              operating footprint spanning North America and India and{" "}
              <strong>55+ premium real-estate assets</strong> across the United
              States.
            </p>
            <p className="hp-body" data-rise>
              By combining capital, strategic vision, and hands-on execution,
              Vimtra partners with businesses and communities to build scalable
              enterprises, develop transformative assets, and create
              sustainable, long-term value.
            </p>
          </div>
        </div>
      </Section>

      {/* 02 — BY THE NUMBERS */}
      <Section surface="ink" size="tight">
        <IndexLabel n="02" tone="dark">
          By the numbers
        </IndexLabel>
        <Figures items={FIRM_STATS} />
      </Section>

      {/* 03 — SIX VERTICALS */}
      <Section surface="ivory">
        <IndexLabel n="03">Six Verticals</IndexLabel>
        <div className="hp-split">
          <div>
            <SectionTitle lines={["ONE FIRM,", "SIX", "VERTICALS."]} />
            <p className="hp-body" data-rise style={{ marginTop: 26 }}>
              Every area the firm operates in, on a single canvas — as
              principal, not intermediary.
            </p>
          </div>
          <NumberedList
            items={VERTICALS.map((v) => ({ t: v.name, d: v.body }))}
          />
        </div>
      </Section>

      {/* 04 — LEADERSHIP */}
      <Section surface="paper">
        <IndexLabel n="04">Leadership</IndexLabel>
        <SectionTitle lines={["THE PEOPLE", "BEHIND IT."]} />
        <div className="hp-people">
          {FOUNDERS.map((f) => (
            <article className="hp-person" key={f.name} data-rise>
              <div className="hp-person-figure">
                <Image
                  src={f.image}
                  alt={f.imageAlt}
                  fill
                  sizes="(max-width: 900px) 100vw, 420px"
                  style={{ objectPosition: f.imagePosition }}
                />
              </div>
              <div className="hp-person-body">
                <p className="hp-person-role">{f.role}</p>
                <h3 className="hp-person-name">{f.name}</h3>
                <p className="hp-person-text">{f.body}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* 05 — BOARD + ADVISORY */}
      <Section surface="ivory">
        <IndexLabel n="05">Governance</IndexLabel>
        <div className="hp-split">
          <div>
            <SectionTitle lines={["BOARD &", "ADVISORY."]} />
          </div>
          <div>
            <div className="hp-quote" data-rise>
              <p className="hp-person-role">{BOARD_MEMBER.role}</p>
              <h3 className="hp-person-name">{BOARD_MEMBER.name}</h3>
              <p className="hp-person-text">{BOARD_MEMBER.body}</p>
            </div>
            <p className="hp-index" data-rise style={{ marginTop: 48 }}>
              <span>Advisory disciplines</span>
            </p>
            <ul className="hp-tags" data-rise>
              {ADVISORY_DISCIPLINES.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* 06 — SPORTS FRANCHISES */}
      <Section surface="ink">
        <IndexLabel n="06" tone="dark">
          Sports Franchises
        </IndexLabel>
        <SectionTitle lines={["OWNERSHIP", "IN SPORT."]} />
        <ul className="hp-franchises">
          {FRANCHISES.map((f) => {
            const inner = (
              <>
                <span className="hp-franchise-tag">{f.tag}</span>
                <span className="hp-franchise-body">
                  <span className="hp-franchise-name">{f.name}</span>
                  <span className="hp-franchise-detail">{f.detail}</span>
                </span>
                {f.href && (
                  <span className="hp-arrow" aria-hidden>
                    →
                  </span>
                )}
              </>
            );
            return (
              <li key={f.name} data-rise>
                {f.href ? (
                  <Link href={f.href} className="hp-franchise is-link">
                    {inner}
                  </Link>
                ) : (
                  <div className="hp-franchise">{inner}</div>
                )}
              </li>
            );
          })}
        </ul>
      </Section>

      {/* CLOSING */}
      <Section surface="paper" size="tight">
        <div className="hp-cta-row">
          <div>
            <SectionTitle lines={["BUILT FOR", "THE LONG GAME."]} />
          </div>
          <div className="hp-cta-actions" data-rise>
            <Link href="/the-club" className="hp-btn hp-btn-primary">
              MEET THE FRANCHISE
              <span className="hp-arrow" aria-hidden>
                →
              </span>
            </Link>
            <Link href="/invest" className="hp-btn hp-btn-ghost">
              Investment enquiries
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
