import type { Metadata } from "next";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import AeText from "@/components/AeText";

export const metadata: Metadata = {
  title: "The Pride · Vimtra Chennai Lions GC",
  description:
    "A pride is more than a logo — the families, caddies and schools behind Chennai's golf story, carried forward by the Lions.",
};

const TIMELINE_LEFT = [
  { y: "2022 · The Thesis", d: "Vimtra Ventures begins evaluating professional golf as a long-horizon sport-investment category in India." },
  { y: "2023 · The City", d: "Chennai is chosen — equal parts golf history, civic culture, and a fanbase that supports its own." },
  { y: "2024 · The Lions", d: "The franchise launches. Roster announced. Home greens identified. The Pride opens membership.", last: true },
];
const TIMELINE_RIGHT = [
  { y: "2025 · The Build", d: "Practice infrastructure expanded. Academy programmes begin in five Tamil Nadu schools." },
  { y: "2026 · The Roar", d: "First full IGPL campaign. Pride membership crosses 10,000. Signature event held in Chennai." },
  { y: "Beyond", d: "A homegrown junior to the senior roster within five seasons. That's the real scoreboard.", last: true, gold: true },
];

const NUMBERS = [
  { v: "10K+", l: "Members of the Pride", dark: true },
  { v: "25", l: "Combined Pro Wins on Roster", dark: false },
  { v: "5", l: "Tamil Nadu Academy Schools", dark: false },
  { v: "∞", l: "Years on the Long Game", dark: false },
];

function TimelineCol({ items }: { items: typeof TIMELINE_LEFT }) {
  return (
    <div>
      {items.map((t) => (
        <div key={t.y} className={`timeline-item ${t.last ? "last" : ""}`}>
          <div
            className="font-sora font-extrabold text-[22px] tracking-[-0.01em]"
            style={{ color: (t as { gold?: boolean }).gold ? "#E9CB8E" : "#C4202A" }}
          >
            {t.y}
          </div>
          <div className="font-manrope text-[14.5px] leading-[1.62] text-muted mt-2">{t.d}</div>
        </div>
      ))}
    </div>
  );
}

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
              About · Heritage
            </div>
            <AeText
              text="THE PRIDE"
              mode="words"
              as="h1"
              className="mt-[14px] font-sora font-extrabold text-white"
              style={{ fontSize: "clamp(56px,9.4vw,142px)", lineHeight: 0.9, letterSpacing: "-0.035em" }}
            />
            <Reveal variant="fade-up" delay={120} as="p" className="max-w-[560px] mt-[22px] font-manrope text-[17px] leading-[1.6] text-white/85">
              A pride is more than a logo. It&apos;s the city behind the city — the
              families who travelled to junior tournaments, the caddies who stayed
              late, the schools that put a club in a kid&apos;s hands. Chennai&apos;s
              golf story is older than the franchise, and the Lions exist to carry
              it forward.
            </Reveal>
          </div>
          <Reveal variant="zoom-in" delay={160} className="relative">
            <Image
              src="/assets/Mascot.png"
              alt="Lions Mascot"
              width={420}
              height={420}
              className="w-full max-w-[420px] block mx-auto"
              style={{ filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.45))" }}
            />
          </Reveal>
        </div>
      </section>

      {/* Our Story */}
      <section className="bg-cream-100 px-8 py-24">
        <div className="max-w-[1100px] mx-auto">
          <Reveal variant="fade-up" className="text-center mb-[52px]">
            <div className="font-manrope font-bold tracking-[0.22em] text-[11.5px] text-crimson-600 uppercase">
              Our Story
            </div>
            <h2 className="mt-[14px] mb-4 font-sora font-extrabold text-[46px] leading-none tracking-[-0.025em] text-ink">
              From a thought to a franchise
            </h2>
            <p className="max-w-[660px] mx-auto font-manrope text-[15.5px] leading-[1.66] text-muted">
              The Vimtra Chennai Lions weren&apos;t built around a single signing or
              a launch party. They were built around a long-term thesis on Indian
              golf — and the people willing to be patient with it.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[60px] items-start">
            <Reveal variant="fade-up">
              <TimelineCol items={TIMELINE_LEFT} />
            </Reveal>
            <Reveal variant="fade-up" delay={120}>
              <TimelineCol items={TIMELINE_RIGHT} />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="bg-cream-50 px-8 py-24 border-y border-black/[0.06]">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-[60px] items-center">
          <Reveal variant="fade-up">
            <div className="font-manrope font-bold tracking-[0.22em] text-[11.5px] text-crimson-600 uppercase">
              Mission
            </div>
            <h2 className="mt-[14px] mb-[22px] font-sora font-extrabold text-[42px] leading-none tracking-[-0.025em] text-ink">
              Build a club Chennai can call its own.
            </h2>
            <p className="font-manrope text-[15.5px] leading-[1.66] text-muted">
              Win on tour. Develop juniors. Grow the gallery. Treat the green as a
              long-form story, not a transaction. We measure the franchise on
              five-year arcs, not single tournaments.
            </p>
          </Reveal>
          <Reveal variant="fade-up" delay={120}>
            <div className="font-manrope font-bold tracking-[0.22em] text-[11.5px] text-crimson-600 uppercase">
              Vision
            </div>
            <h2 className="mt-[14px] mb-[22px] font-sora font-extrabold text-[42px] leading-none tracking-[-0.025em] text-ink">
              A standing seat at the international table.
            </h2>
            <p className="font-manrope text-[15.5px] leading-[1.66] text-muted">
              An Indian franchise that travels with credibility — pros in major
              fields, juniors in college pipelines, fans who know the players by
              their walk-up. That&apos;s the pride we&apos;re building.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Numbers */}
      <section className="bg-cream-100 px-8 py-24">
        <div className="max-w-[1200px] mx-auto">
          <Reveal variant="fade-up" className="text-center mb-[46px]">
            <div className="font-manrope font-bold tracking-[0.22em] text-[11.5px] text-crimson-600 uppercase">
              The Pride in Numbers
            </div>
            <h2 className="mt-[14px] font-sora font-extrabold text-[46px] leading-none tracking-[-0.025em] text-ink">
              Where we are today
            </h2>
          </Reveal>
          <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
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
    </>
  );
}
