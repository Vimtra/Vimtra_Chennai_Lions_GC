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
  title: "The Pride · Vimtra Chennai Lions GC",
  description:
    "Chennai's roar on the world's newest stage — the emotional charter of the Vimtra Chennai Lions and the fifteen-event AM Green IGPL Season 2026.",
};

// This page carries the emotional/brand story. Every quantifiable claim on
// it is sourced from the Chennai Lions IGPL brochure (Season 2026). No
// membership counts, invented timeline dates, or academy-school figures
// appear — those were fabrications that have been removed in M1.

// Brochure p. 05 — "10 FRANCHISES · 15 EVENTS / SEASON · 2025 INAUGURAL SEASON"
// and p. 06 — "FOUNDED 2026 · Inaugural franchise season".
const NUMBERS = [
  { v: "2026", l: "Chennai Lions Inaugural Season", dark: true },
  { v: "10", l: "IGPL Franchises", dark: false },
  { v: "15", l: "Events per Season", dark: false },
  { v: "5", l: "International Events on the Calendar", dark: false },
];

export default function ThePridePage() {
  return (
    <>
      <PageHero
        variant="immersive"
        eyebrow="The Mark · Pride of Chennai"
        title={["THE PRIDE"]}
        lead={
          <>
            A franchise carries a city, not a company. The Lions belong to
            Chennai — a coastal capital with a deep amateur golf base and one
            of India&apos;s most consistent pipelines of touring professionals.
          </>
        }
      />

      <Section surface="ivory">
        <IndexLabel n="01">The City</IndexLabel>
        <div className="hp-split">
          <div>
            <SectionTitle lines={["CHENNAI’S ROAR", "ON THE WORLD’S", "NEWEST STAGE."]} />
          </div>
          <div>
            <p className="hp-lead" data-rise>
              A team built for the long game.
            </p>
            <p className="hp-body" data-rise>
              The Bay of Bengal at our back, a deep amateur golf base at our
              feet, and one of the country&apos;s most consistent pipelines of
              touring professionals in front of us. The Lions are the sporting
              expression of that city — carried into a fifteen-event season
              that stretches from Chennai to a global calendar.
            </p>
            <Link href="/the-club" className="hp-btn hp-btn-text" data-rise>
              The story of the club
              <span className="hp-arrow" aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </Section>

      <Section surface="ink" size="tight">
        <IndexLabel n="02" tone="dark">The season in numbers</IndexLabel>
        <Figures items={NUMBERS.map((n) => ({ v: n.v, l: n.l }))} />
      </Section>

      <Section surface="paper">
        <div className="hp-media">
          <div className="hp-media-figure" data-rise>
            <Image
              src="/assets/fac-main-web.jpg"
              alt="TNGF Cosmo — the Lions&apos; home practice venue in Chennai"
              fill
              sizes="(max-width: 900px) 100vw, 620px"
            />
          </div>
          <div>
            <IndexLabel n="03">Home Ground</IndexLabel>
            <SectionTitle lines={["TNGF COSMO,", "CHENNAI."]} />
            <p className="hp-body" data-rise style={{ marginTop: 24 }}>
              The franchise&apos;s home practice venue — where the season is
              prepared before it travels.
            </p>
          </div>
        </div>
      </Section>

      <Section surface="ivory" size="tight">
        <div className="hp-cta-row">
          <div><SectionTitle lines={["ONE CITY.", "ONE PRIDE."]} /></div>
          <div className="hp-cta-actions" data-rise>
            <Link href="/players" className="hp-btn hp-btn-primary">
              MEET THE PLAYERS
              <span className="hp-arrow" aria-hidden>→</span>
            </Link>
            <Link href="/fixtures" className="hp-btn hp-btn-ghost">See the season</Link>
          </div>
        </div>
      </Section>
    </>
  );
}
