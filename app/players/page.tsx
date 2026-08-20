import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import AeText from "@/components/AeText";
import PlayerPortrait from "@/components/players/PlayerPortrait";
import PlayerFeature from "@/components/players/PlayerFeature";
import { ROSTER, FEATURES } from "@/data/players";

export const metadata: Metadata = {
  title: "Players · Vimtra Chennai Lions GC",
  description:
    "Season 2026 roster — Gaganjeet Bhullar (marquee), Harshjeet Singh Sethie, Samarth Dwivedi, and Yashas Chandra M S.",
};

export default function PlayersPage() {
  return (
    <>
      <section
        className="relative overflow-hidden px-8 pt-[90px] pb-[84px]"
        style={{
          background:
            "radial-gradient(125% 105% at 50% -5%,#C9242E 0%,#A8181F 58%,#871119 100%)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 84% 16%,rgba(233,203,142,0.16),transparent 42%),radial-gradient(circle at 12% 88%,rgba(233,203,142,0.10),transparent 45%)",
          }}
        />
        <div className="relative max-w-[1200px] mx-auto">
          <div className="font-manrope font-bold text-[12px] tracking-[0.32em] text-[#E9CB8E] uppercase">
            The Roster · 2026
          </div>
          <AeText
            text="THE PLAYERS"
            mode="words"
            as="h1"
            className="mt-[14px] font-sora font-extrabold text-white"
            style={{
              fontSize: "clamp(56px,9.4vw,142px)",
              lineHeight: 0.9,
              letterSpacing: "-0.035em",
            }}
          />
          <Reveal
            variant="fade-up"
            delay={120}
            as="p"
            className="max-w-[620px] mt-[22px] font-manrope text-[17px] leading-[1.6] text-white/85"
          >
            A marquee, a proven domestic winner, an internationally ranked pro,
            and an active IGPL competitor — balanced by design to compete week
            after week across the season.
          </Reveal>
        </div>
      </section>

      {/* Roster grid */}
      <section className="bg-cream-100 px-8 py-[88px]">
        <div className="max-w-[1200px] mx-auto grid gap-[22px] [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          {ROSTER.map((p, i) => (
            <Reveal key={p.anchor} variant="fade-up" delay={i * 80}>
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
            </Reveal>
          ))}
        </div>
      </section>

      {FEATURES.map((f) => (
        <PlayerFeature key={f.anchor} f={f} />
      ))}
    </>
  );
}
