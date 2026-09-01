import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import StoryHero from "@/components/site/StoryHero";
import FullBleedStatement from "@/components/site/FullBleedStatement";
import { Section, IndexLabel, SectionTitle } from "@/components/site/Section";

export const metadata: Metadata = {
  title: "Golf Development · Vimtra Chennai Lions GC",
  description:
    "Vimtra's Indian golf platform — coaching, academies, event standards, and course operations to international championship level, alongside Golf on Wheels and a Chennai course + academy under development.",
};

/* ---------------------------------------------------------------------------
   CONTENT SOURCES
   Every claim on this page is sourced from the Chennai Lions IGPL brochure
   (pp. 02–03, 15, 16) or the Vimtra Ventures profile. Current vs planned
   initiatives are marked explicitly so nothing "under development" reads as
   if it has shipped. Nothing here is written to fill a composition.

   The three `NumberedList` card stacks are gone. Each section now has one
   dominant idea: The Framework is a statement beside a figure with a ruled
   index beneath; the Signature Thesis is a full-bleed typographic moment
   with minimal support; High Performance is a filling figure beside a ruled
   field. No cards anywhere.

   ADDED SECTION — INITIATIVES (04): "Golf on Wheels" and the Chennai
   "Course & Academy" are promised by this page's own <meta description> and
   are approved copy already live on the home page, but the page itself never
   rendered them. That gap is now closed with the existing wording and its
   existing status tags. This is the one section that is an addition rather
   than a redesign — it is trivially removable if it is not wanted.

   NO ACADEMY PHOTOGRAPHY: golf-coaching stock is almost entirely
   photographs of children being taught. Identifiable minors do not belong
   on a commercial franchise page, so the academy and grassroots initiatives
   are set typographically rather than given stand-in imagery.
--------------------------------------------------------------------------- */

// Brochure p. 03 — the operating framework.
const FRAMEWORK = [
  {
    tag: "Operating Framework",
    name: "Vimtra Golf Ventures",
    body:
      "The dedicated Indian golf operating entity — coaching curriculum, coach certification, event standards, and course-operating standards under a single institutional authority.",
  },
  {
    tag: "Franchise",
    name: "Chennai Lions GC · IGPL Season 2026",
    body:
      "Vimtra's Indian golf platform expressed as a competitive team — anchored by a proven marquee, built around a rising domestic core.",
  },
];

// Brochure p. 15 — signature thesis and three anchors, verbatim.
const ANCHORS = [
  {
    tag: "Anchor · 01",
    name: "Premium Golf",
    body: "World-class facilities to international championship standards.",
  },
  {
    tag: "Anchor · 02",
    name: "Luxury Residential",
    body: "HNI communities integrated with the course itself.",
  },
  {
    tag: "Anchor · 03",
    name: "Lifestyle & Investment",
    body: "Amenities, hospitality and long-cycle asset value.",
  },
];

// Vimtra Ventures profile — the profile's own framing of the Chennai
// Lions build.
const HIGH_PERFORMANCE = [
  { label: "Talent", body: "Identifying and nurturing elite golfing talent." },
  {
    label: "Pathways",
    body: "Strengthening professional pathways for Indian golfers.",
  },
  {
    label: "Ecosystem",
    body: "Building a strong leadership and advisory ecosystem.",
  },
  {
    label: "Platform",
    body:
      "Creating a globally competitive platform for Indian professional golf.",
  },
];

// Wording and status tags exactly as already published on the home page.
const INITIATIVES = [
  {
    tag: "Grassroots · with IGPL",
    name: "Golf on Wheels",
    body:
      "A schools-and-colleges outreach initiative bringing golf directly to campuses through mobile simulators.",
  },
  {
    tag: "Coming soon · Chennai",
    name: "Course & Academy",
    body:
      "A world-class course and academy under development in Chennai — professional training, youth development and community engagement.",
  },
];

export default function GolfDevelopmentPage() {
  return (
    <>
      <StoryHero
        eyebrow="The Platform"
        title={["GOLF", "DEVELOPMENT"]}
        line="Coaching, academies, event standards and course operations — to international championship level."
        image="/assets/photo/gd-hero-clubhouse-lake.jpg"
        imageAlt="A clubhouse seen across a lake from the fairway"
        imagePosition="50% 44%"
      />

      {/* 01 — THE FRAMEWORK */}
      <Section surface="ivory">
        <div className="cm-track gd-framework">
          <IndexLabel n="01">The Framework</IndexLabel>

          <div className="gd-framework-h">
            <h2 className="cm-display" data-rise>
              A PLATFORM, NOT A <em>portfolio bet</em>.
            </h2>
          </div>

          <div className="gd-framework-f" data-rise>
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
            {FRAMEWORK.map((f, i) => (
              <li key={f.name} data-rise>
                <span className="gd-index-n">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="gd-index-k">{f.tag}</span>
                  <span className="gd-index-t">{f.name}</span>
                </span>
                <p className="gd-index-d">{f.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* 02 — SIGNATURE THESIS.
          The major typographic moment: one approved statement, edge to
          edge, over the one photograph that actually depicts it. */}
      <FullBleedStatement
        eyebrow="02 · Signature Thesis"
        line={["GOLF-LED", "HNI", "COMMUNITIES."]}
        image="/assets/photo/gd-thesis-villas-aerial.jpg"
        imageAlt="Villas laid out through a golf course, photographed straight down"
        imagePosition="50% 50%"
      />

      {/* The thesis, stated. Minimal supporting text, then the three
          brochure anchors as a ruled index — not three cards. */}
      <Section surface="ink">
        <div className="cm-track gd-thesis">
          <div className="gd-thesis-lede" data-rise>
            <p>
              Premium golf facilities integrated with luxury residential
              communities, lifestyle amenities, and investment opportunities —
              an ecosystem connecting sport, real estate, and long-term value.
            </p>
          </div>

          <ol className="gd-index">
            {ANCHORS.map((a, i) => (
              <li key={a.name} data-rise>
                <span className="gd-index-n">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="gd-index-k">{a.tag}</span>
                  <span className="gd-index-t">{a.name}</span>
                </span>
                <p className="gd-index-d">{a.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* 03 — HIGH PERFORMANCE */}
      <Section surface="paper">
        <div className="cm-track gd-perf">
          <div className="gd-perf-f" data-rise>
            <div className="gd-fig">
              <Image
                src="/assets/photo/gd-perf-putt-hole.jpg"
                alt="A putter and ball beside the hole on a cut green"
                fill
                sizes="(max-width: 1023px) 100vw, 40vw"
                style={{ objectPosition: "56% 50%" }}
              />
            </div>
          </div>

          <div className="gd-perf-t">
            <IndexLabel n="03">High Performance</IndexLabel>
            <SectionTitle lines={["TALENT,", "PATHWAYS,", "ECOSYSTEM."]} />
            <ul className="gd-pillars">
              {HIGH_PERFORMANCE.map((h) => (
                <li key={h.label} data-rise>
                  <span className="gd-pillar-t">{h.label}</span>
                  <span className="gd-pillar-d">{h.body}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* 04 — INITIATIVES. See the note at the top of this file. */}
      <Section surface="ivory">
        <div className="cm-track gd-framework">
          <IndexLabel n="04">Initiatives</IndexLabel>

          <div className="gd-framework-h">
            <h2 className="cm-display" data-rise>
              CURRENT, AND <em>under way</em>.
            </h2>
            <p className="gd-lede" data-rise>
              What the platform is running today, and what is being built next
              in Chennai.
            </p>
          </div>

          <ol className="gd-index">
            {INITIATIVES.map((n, i) => (
              <li key={n.name} data-rise>
                <span className="gd-index-n">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="gd-index-k">{n.tag}</span>
                  <span className="gd-index-t">{n.name}</span>
                </span>
                <p className="gd-index-d">{n.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* CLOSING */}
      <Section surface="ink" size="tight" className="hp-sec-atmos">
        <div className="cm-track cm-close">
          <div className="cm-close-title">
            <SectionTitle lines={["BUILD IT", "WITH US."]} />
          </div>
          <div className="cm-close-actions" data-rise>
            <Link href="/invest" className="hp-btn hp-btn-primary">
              PARTNER WITH THE LIONS
              <span className="hp-arrow" aria-hidden>
                →
              </span>
            </Link>
            <Link
              href="/vimtra-ventures"
              className="hp-btn hp-btn-ghost hp-on-dark"
            >
              About Vimtra Ventures
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
