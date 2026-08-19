import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import AeText from "@/components/AeText";

export const metadata: Metadata = {
  title: "The Club · Vimtra Chennai Lions GC",
  description:
    "A modern golf institution carrying Chennai's hunger and Vimtra Ventures' long-term commitment into the IGPL.",
};

const STATS = [
  { v: "2024", l: "Franchise Inception", dark: false },
  { v: "04", l: "Player Roster Strength", dark: false },
  { v: "10K+", l: "Active Pride Members", dark: false },
  { v: "IGPL", l: "Official Franchise", dark: true },
];

const CODE = [
  { n: "01", t: "Pride", d: "We represent a city that doesn't flinch. Every shot is an entry in a longer ledger." },
  { n: "02", t: "Precision", d: "We back data, repetition, and quiet confidence over hype. Wins are built in the off-week." },
  { n: "03", t: "Patience", d: "The franchise window is long. We invest in players, fans, and infrastructure that compound." },
  { n: "04", t: "Pack", d: "The roster, the gallery, the volunteers, the families — one travelling pride." },
];

const OFFICE = [
  { init: "VV", name: "Vimtra Ventures", role: "Franchise Owner", d: "Multi-year operational commitment, infrastructure-first investment philosophy.", bg: "linear-gradient(160deg,#C9242E,#871119)", color: "#fff" },
  { init: "HC", name: "Head Coach", role: "Performance", d: "Sets the practice plan, owns the scoring model, manages the bench.", bg: "linear-gradient(160deg,#E6C57E,#C39A52)", color: "#3A1A06" },
  { init: "TM", name: "Team Manager", role: "Operations", d: "Travel, fixtures, accreditation, and the day-to-day rhythm on tour.", bg: "#1A1513", color: "#E9CB8E" },
  { init: "FB", name: "Fan Engagement", role: "The Pride", d: "Memberships, fan walks, watch parties, school golf days across Tamil Nadu.", bg: "#C4202A", color: "#fff" },
];

export default function TheClubPage() {
  return (
    <>
      <section
        className="relative overflow-hidden px-8 pt-[96px] pb-[88px]"
        style={{ background: "radial-gradient(125% 105% at 50% -5%,#C9242E 0%,#A8181F 58%,#871119 100%)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 84% 16%,rgba(233,203,142,0.16),transparent 42%),radial-gradient(circle at 12% 88%,rgba(233,203,142,0.10),transparent 45%)" }}
        />
        <div className="relative max-w-[1200px] mx-auto">
          <div className="font-manrope font-bold text-[12px] tracking-[0.32em] text-[#E9CB8E] uppercase">
            Inside the Den
          </div>
          <AeText
            text="THE CLUB"
            mode="words"
            as="h1"
            className="mt-[14px] font-sora font-extrabold text-white"
            style={{ fontSize: "clamp(56px,9.4vw,142px)", lineHeight: 0.9, letterSpacing: "-0.035em" }}
          />
          <Reveal variant="fade-up" delay={120} as="p" className="max-w-[620px] mt-[22px] font-manrope text-[17px] leading-[1.6] text-white/85">
            A modern golf institution carrying Chennai&apos;s hunger and Vimtra
            Ventures&apos; long-term commitment into the Indian Golf Premier League
            — built around championship pedigree, world-class training, and a
            fanbase that travels.
          </Reveal>
        </div>
      </section>

      {/* Identity */}
      <section className="bg-cream-100 px-8 pt-[104px] pb-[92px]">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-[60px] items-start">
          <Reveal variant="fade-up">
            <div className="font-manrope font-bold tracking-[0.22em] text-[11.5px] text-crimson-600 uppercase">
              Identity
            </div>
            <h2 className="mt-[14px] mb-[22px] font-sora font-extrabold text-[46px] leading-none tracking-[-0.025em] text-ink">
              A franchise built
              <br />
              to roar.
            </h2>
            <p className="font-manrope text-[15.5px] leading-[1.66] text-muted">
              Vimtra Chennai Lions Golf Club represents Tamil Nadu in the IGPL — a
              city-based franchise league reshaping professional golf in India. We
              carry the southern fortress: aggressive on the tee, surgical on the
              green, generous with the gallery.
            </p>
            <p className="font-manrope text-[15.5px] leading-[1.66] text-muted mt-[14px]">
              The Lions are owned and operated by Vimtra Ventures with a multi-year
              commitment that spans the playing roster, academy programmes, and a
              permanent home-turf footprint in Chennai.
            </p>
          </Reveal>
          <Reveal variant="fade-up" delay={120} className="grid grid-cols-2 gap-[18px]">
            {STATS.map((s) => (
              <div
                key={s.l}
                className="rounded-[20px] p-6"
                style={
                  s.dark
                    ? { background: "linear-gradient(160deg,#C9242E,#871119)", color: "#fff", boxShadow: "0 26px 60px -38px rgba(196,32,42,0.6)" }
                    : { background: "#FBF9F4", border: "1px solid rgba(26,21,19,0.08)", boxShadow: "0 26px 60px -38px rgba(26,21,19,0.45)" }
                }
              >
                <div
                  className="font-sora font-extrabold text-[42px] tracking-[-0.025em] leading-none"
                  style={{ color: s.dark ? "#E9CB8E" : "#C4202A" }}
                >
                  {s.v}
                </div>
                <div
                  className="font-manrope text-[13px] mt-2"
                  style={{ color: s.dark ? "rgba(255,255,255,0.85)" : "#6B635C" }}
                >
                  {s.l}
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Lions Code */}
      <section className="bg-cream-50 px-8 py-24 border-y border-black/[0.06]">
        <div className="max-w-[1200px] mx-auto">
          <Reveal variant="fade-up" className="text-center mb-[54px]">
            <div className="font-manrope font-bold tracking-[0.22em] text-[11.5px] text-crimson-600 uppercase">
              What We Stand For
            </div>
            <h2 className="mt-[14px] font-sora font-extrabold text-[46px] leading-none tracking-[-0.025em] text-ink">
              The Lions Code
            </h2>
          </Reveal>
          <div className="grid gap-[22px] [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
            {CODE.map((c, i) => (
              <Reveal key={c.n} variant="fade-up" delay={i * 80} className="bg-white border border-black/[0.07] rounded-[22px] p-7">
                <div className="w-12 h-12 rounded-[13px] bg-crimson-600 text-white font-sora font-extrabold text-[20px] flex items-center justify-center">
                  {c.n}
                </div>
                <h3 className="mt-[18px] mb-2 font-sora font-bold text-[20px] text-ink">{c.t}</h3>
                <p className="m-0 font-manrope text-[14px] leading-[1.6] text-muted">{c.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Front Office */}
      <section className="bg-cream-100 px-8 py-[104px]">
        <div className="max-w-[1200px] mx-auto">
          <Reveal variant="fade-up" className="flex justify-between items-end gap-8 flex-wrap mb-[46px]">
            <div>
              <div className="font-manrope font-bold tracking-[0.22em] text-[11.5px] text-crimson-600 uppercase">
                Leadership
              </div>
              <h2 className="mt-[14px] font-sora font-extrabold text-[46px] leading-none tracking-[-0.025em] text-ink">
                The Front Office
              </h2>
            </div>
            <p className="max-w-[430px] m-0 font-manrope text-[15px] leading-[1.62] text-muted">
              A lean leadership group with a long horizon. Operating cadence:
              pro-roster decisions on data, fan-facing decisions on instinct.
            </p>
          </Reveal>
          <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
            {OFFICE.map((o, i) => (
              <Reveal key={o.init} variant="fade-up" delay={i * 100} className="bg-cream-50 border border-black/[0.07] rounded-[22px] p-6">
                <div
                  className="w-[74px] h-[74px] rounded-full font-sora font-extrabold text-[28px] flex items-center justify-center"
                  style={{ background: o.bg, color: o.color }}
                >
                  {o.init}
                </div>
                <div className="mt-[18px] font-sora font-bold text-[18px] text-ink">{o.name}</div>
                <div className="font-manrope text-[12.5px] text-crimson-600 mt-1 tracking-[0.06em] uppercase">
                  {o.role}
                </div>
                <p className="mt-[14px] font-manrope text-[13.5px] leading-[1.6] text-muted">{o.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Membership CTA */}
      <section className="px-8 py-24 text-white" style={{ background: "linear-gradient(180deg,#1A1513,#241B17)" }}>
        <div className="max-w-[1100px] mx-auto text-center">
          <Reveal variant="fade-up" className="font-manrope font-bold tracking-[0.32em] text-[12px] text-[#E9CB8E] uppercase">
            Join the Pride
          </Reveal>
          <Reveal variant="fade-up" as="h2" className="my-[18px] font-sora font-extrabold leading-none tracking-[-0.025em]" style={{ fontSize: "clamp(38px,5vw,64px)" }}>
            Become a member. Travel with the Lions.
          </Reveal>
          <Reveal variant="fade-up" delay={120} as="p" className="max-w-[560px] mx-auto mb-8 font-manrope text-[15px] leading-[1.66] text-white/70">
            Early access to fixtures, members-only watch parties, exclusive
            merchandise drops, and the chance to walk a practice round with the squad.
          </Reveal>
          <Reveal variant="fade-up" delay={200}>
            <Link href="/contact" className="cta-gold press" style={{ padding: "14px 28px", fontSize: 14 }}>
              REQUEST MEMBERSHIP
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
