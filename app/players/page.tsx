import type { Metadata } from "next";
import PlayerPortrait from "@/components/players/PlayerPortrait";
import PlayerFeature from "@/components/players/PlayerFeature";
import { ROSTER, FEATURES } from "@/data/players";
import PageHero from "@/components/site/PageHero";
import { Section, IndexLabel, SectionTitle, EmptyState } from "@/components/site/Section";

export const metadata: Metadata = {
  title: "Players · Vimtra Chennai Lions GC",
  description:
    "Season 2026 roster — Gaganjeet Bhullar (marquee), Harshjeet Singh Sethie, Samarth Dwivedi, and Yashas Chandra M S.",
};

export default function PlayersPage() {
  return (
    <>
      <PageHero
        variant="editorial"
        eyebrow="The Roster · 2026"
        title={["THE", "PLAYERS"]}
        lead={
    <>
      A marquee, a proven domestic winner, an internationally ranked pro, and an active IGPL competitor — balanced by design to compete week after week across the season.
    </>
  }
      />

      {/* Roster grid */}
      <Section surface="ivory">
        <IndexLabel n="01">Season 2026 Roster</IndexLabel>
        <div className="hp-grid hp-grid-4">
          {ROSTER.map((p, i) => (
            <div key={p.anchor} data-rise>
              <a href={`#${p.anchor}`} className="no-underline text-inherit block">
                <PlayerPortrait
                  init={p.init}
                  image={p.image}
                  badgeName={p.badgeName}
                  badgeSub={p.badgeSub}
                  alt={`${p.fullName} — Vimtra Chennai Lions GC`}
                />
                <div className="mt-[14px] font-sora font-bold text-[18px] text-ink">
                  {p.fullName}
                </div>
                <div className="font-manrope text-[13px] text-muted mt-1">{p.blurb}</div>
              </a>
            </div>
          ))}
        </div>
      </Section>

      {FEATURES.map((f) => (
        <PlayerFeature key={f.anchor} f={f} />
      ))}
    </>
  );
}
