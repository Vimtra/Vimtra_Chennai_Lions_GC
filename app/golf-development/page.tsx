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
  title: "Golf Development · Vimtra Chennai Lions GC",
  description:
    "Vimtra's Indian golf platform — coaching, academies, event standards, and course operations to international championship level, alongside Golf on Wheels and a Chennai course + academy under development.",
};

// Every claim on this page is sourced from the Chennai Lions IGPL brochure
// (pp. 02–03, 15, 16) or the Vimtra Ventures profile. Current vs planned
// initiatives are marked explicitly so nothing "under development" reads
// as if it has shipped.

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
    label: "Anchor · 01",
    title: "Premium Golf",
    body:
      "World-class facilities to international championship standards.",
  },
  {
    label: "Anchor · 02",
    title: "Luxury Residential",
    body: "HNI communities integrated with the course itself.",
  },
  {
    label: "Anchor · 03",
    title: "Lifestyle & Investment",
    body:
      "Amenities, hospitality and long-cycle asset value.",
  },
];

// Vimtra Ventures profile — the profile's own framing of the Chennai
// Lions build.
const HIGH_PERFORMANCE = [
  {
    label: "Talent",
    body: "Identifying and nurturing elite golfing talent.",
  },
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

export default function GolfDevelopmentPage() {
  return (
    <>
      <PageHero
        variant="immersive"
        eyebrow="The Platform"
        title={["GOLF", "DEVELOPMENT"]}
        lead={
          <>
            Vimtra&apos;s Indian golf platform — coaching, academies, event
            standards, and course operations to international championship
            level.
          </>
        }
      />

      <Section surface="ivory">
        <div className="hp-split">
          <div className="hp-rail">
            <IndexLabel n="01">The Framework</IndexLabel>
            <SectionTitle lines={["A PLATFORM,", "NOT A", "PORTFOLIO BET."]} />
          </div>
          <NumberedList items={FRAMEWORK.map((f) => ({ k: f.tag, t: f.name, d: f.body }))} />
        </div>
      </Section>

      <Section surface="ink">
        <div className="hp-split">
          <div className="hp-rail">
            <IndexLabel n="02" tone="dark">Signature Thesis</IndexLabel>
            <SectionTitle lines={["GOLF-LED HNI", "COMMUNITIES."]} />
            <p className="hp-body hp-mt-sm" data-rise>
              Premium golf facilities integrated with luxury residential
              communities, lifestyle amenities, and investment opportunities —
              an ecosystem connecting sport, real estate, and long-term value.
            </p>
          </div>
          <NumberedList items={ANCHORS.map((a) => ({ k: a.label, t: a.title, d: a.body }))} />
        </div>
      </Section>

      <Section surface="paper">
        <div className="hp-split">
          <div className="hp-rail">
            <IndexLabel n="03">High Performance</IndexLabel>
            <SectionTitle lines={["TALENT,", "PATHWAYS,", "ECOSYSTEM."]} />
          </div>
          <NumberedList items={HIGH_PERFORMANCE.map((h) => ({ t: h.label, d: h.body }))} />
        </div>
      </Section>

      <Section surface="ivory" size="tight">
        <div className="hp-cta-row">
          <div><SectionTitle lines={["BUILD IT", "WITH US."]} /></div>
          <div className="hp-cta-actions" data-rise>
            <Link href="/invest" className="hp-btn hp-btn-primary">
              PARTNER WITH THE LIONS
              <span className="hp-arrow" aria-hidden>→</span>
            </Link>
            <Link href="/vimtra-ventures" className="hp-btn hp-btn-ghost">About Vimtra Ventures</Link>
          </div>
        </div>
      </Section>
    </>
  );
}
