import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import AeText from "@/components/AeText";

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
      <section
        className="relative overflow-hidden px-8 pt-[96px] pb-[100px]"
        style={{ background: "radial-gradient(125% 105% at 50% -5%,#C9242E 0%,#A8181F 58%,#871119 100%)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 84% 16%,rgba(233,203,142,0.16),transparent 42%),radial-gradient(circle at 12% 88%,rgba(233,203,142,0.10),transparent 45%)" }}
        />
        <div className="relative max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-[60px] items-center">
          <div>
            <div className="font-manrope font-bold text-[12px] tracking-[0.32em] text-[#E9CB8E] uppercase">
              The Mark · Pride of Chennai
            </div>
            <AeText
              text="THE PRIDE"
              mode="words"
              as="h1"
              className="mt-[14px] font-sora font-extrabold text-white"
              style={{ fontSize: "clamp(56px,9.4vw,142px)", lineHeight: 0.9, letterSpacing: "-0.035em" }}
            />
            <Reveal variant="fade-up" delay={120} as="p" className="max-w-[560px] mt-[22px] font-manrope text-[17px] leading-[1.6] text-white/85">
              A franchise carries a city, not a company. The Lions belong to
              Chennai — a coastal capital with a deep amateur golf base and one
              of India&apos;s most consistent pipelines of touring professionals.
              This is the pride behind the team sheet.
            </Reveal>
          </div>
          <Reveal variant="zoom-in" delay={160} className="relative">
            <Image
              src="/assets/Mascot.png"
              alt="Chennai Lions mascot"
              width={420}
              height={420}
              className="w-full max-w-[420px] block mx-auto"
              style={{ filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.45))" }}
            />
          </Reveal>
        </div>
      </section>

      {/* Chennai — Home City */}
      <section className="bg-cream-100 px-8 py-24">
        <div className="max-w-[1100px] mx-auto">
          <Reveal variant="fade-up" className="text-center mb-[52px]">
            <div className="font-manrope font-bold tracking-[0.22em] text-[11.5px] text-crimson-600 uppercase">
              Home City
            </div>
            <h2 className="mt-[14px] mb-4 font-sora font-extrabold text-[46px] leading-none tracking-[-0.025em] text-ink">
              The long-game city.
            </h2>
            <p className="max-w-[660px] mx-auto font-manrope text-[15.5px] leading-[1.66] text-muted">
              Chennai has always played the long game — now it has a team to
              prove it.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Reveal variant="fade-up" className="bg-cream-50 border border-black/[0.07] rounded-[20px] p-7">
              <div className="font-manrope font-bold text-[10.5px] tracking-[0.28em] text-crimson-600 uppercase">
                Coastline
              </div>
              <h3 className="mt-3 mb-2 font-sora font-bold text-[22px] text-ink tracking-[-0.005em]">
                Bay of Bengal
              </h3>
              <p className="m-0 font-manrope text-[13.5px] leading-[1.6] text-muted">
                A coastal capital that shapes how the ball flies and how the
                gallery gathers.
              </p>
            </Reveal>
            <Reveal variant="fade-up" delay={80} className="bg-cream-50 border border-black/[0.07] rounded-[20px] p-7">
              <div className="font-manrope font-bold text-[10.5px] tracking-[0.28em] text-crimson-600 uppercase">
                Home Practice Venue
              </div>
              <h3 className="mt-3 mb-2 font-sora font-bold text-[22px] text-ink tracking-[-0.005em]">
                TNGF Cosmo
              </h3>
              <p className="m-0 font-manrope text-[13.5px] leading-[1.6] text-muted">
                The city&apos;s home practice venue — grounding a team built
                for the fifteen-event international calendar.
              </p>
            </Reveal>
            <Reveal variant="fade-up" delay={160} className="bg-cream-50 border border-black/[0.07] rounded-[20px] p-7">
              <div className="font-manrope font-bold text-[10.5px] tracking-[0.28em] text-crimson-600 uppercase">
                Regional Anchor
              </div>
              <h3 className="mt-3 mb-2 font-sora font-bold text-[22px] text-ink tracking-[-0.005em]">
                South India
              </h3>
              <p className="m-0 font-manrope text-[13.5px] leading-[1.6] text-muted">
                A regional base with a deep amateur-golf tradition — and a
                consistent pipeline of touring professionals.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Mission / Vision — the two brand halves. */}
      <section className="bg-cream-50 px-8 py-24 border-y border-black/[0.06]">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-[60px] items-start">
          <Reveal variant="fade-up">
            <div className="font-manrope font-bold tracking-[0.22em] text-[11.5px] text-crimson-600 uppercase">
              What We Are
            </div>
            <h2 className="mt-[14px] mb-[22px] font-sora font-extrabold text-[42px] leading-none tracking-[-0.025em] text-ink">
              A franchise built for the long game.
            </h2>
            <p className="font-manrope text-[15.5px] leading-[1.66] text-muted">
              The Chennai Lions pair a proven international marquee with a
              rising domestic core. Every roster decision was made against the
              same test: can this team compete on day one, and can it grow
              through the international leg of the season?
            </p>
          </Reveal>
          <Reveal variant="fade-up" delay={120}>
            <div className="font-manrope font-bold tracking-[0.22em] text-[11.5px] text-crimson-600 uppercase">
              What We&apos;re For
            </div>
            <h2 className="mt-[14px] mb-[22px] font-sora font-extrabold text-[42px] leading-none tracking-[-0.025em] text-ink">
              Chennai&apos;s roar on the world&apos;s newest stage.
            </h2>
            <p className="font-manrope text-[15.5px] leading-[1.66] text-muted">
              Ten franchises. Fifteen events. Two legs. The AM Green IGPL turns
              professional golf into a season-long, team-first, city-owned
              competition for the first time in the sport&apos;s history — and
              the Lions carry Chennai onto that stage.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Verified numbers — brochure p. 05 / p. 06 / p. 12. */}
      <section className="bg-cream-100 px-8 py-24">
        <div className="max-w-[1200px] mx-auto">
          <Reveal variant="fade-up" className="text-center mb-[46px]">
            <div className="font-manrope font-bold tracking-[0.22em] text-[11.5px] text-crimson-600 uppercase">
              The Season · By the Numbers
            </div>
            <h2 className="mt-[14px] font-sora font-extrabold text-[46px] leading-none tracking-[-0.025em] text-ink">
              Where the Lions play.
            </h2>
          </Reveal>
          <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
            {NUMBERS.map((n, i) => (
              <Reveal
                key={n.l}
                variant="fade-up"
                delay={i * 80}
                className="rounded-[22px] p-[30px] text-center"
                style={
                  n.dark
                    ? { background: "linear-gradient(160deg,#C9242E,#871119)", color: "#fff" }
                    : { background: "#FBF9F4", border: "1px solid rgba(26,21,19,0.08)" }
                }
              >
                <div
                  className="font-sora font-extrabold text-[54px] leading-none tracking-[-0.03em]"
                  style={{ color: n.dark ? "#E9CB8E" : "#C4202A" }}
                >
                  {n.v}
                </div>
                <div
                  className="font-manrope text-[13px] mt-[10px]"
                  style={{ color: n.dark ? "rgba(255,255,255,0.85)" : "#6B635C" }}
                >
                  {n.l}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Rally close — verbatim brochure close, p. 20. */}
      <section
        className="px-8 py-[100px] text-white"
        style={{ background: "linear-gradient(180deg,#1A1513,#241B17)" }}
      >
        <div className="max-w-[1100px] mx-auto text-center">
          <Reveal
            variant="fade-up"
            className="font-manrope font-bold tracking-[0.32em] text-[12px] text-[#E9CB8E] uppercase"
          >
            The Close
          </Reveal>
          <Reveal
            variant="fade-up"
            as="h2"
            className="my-[18px] font-sora font-extrabold leading-none tracking-[-0.025em]"
            style={{ fontSize: "clamp(38px,5.4vw,72px)" }}
          >
            One city. One roster. Fifteen events.
          </Reveal>
          <Reveal variant="fade-up" delay={120} as="p" className="max-w-[560px] mx-auto mb-8 font-manrope text-[15px] leading-[1.66] text-white/75">
            A franchise built for the long game.
          </Reveal>
          <Reveal variant="fade-up" delay={200}>
            <Link href="/players" className="cta-gold press" style={{ padding: "14px 28px", fontSize: 14 }}>
              MEET THE ROSTER
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
