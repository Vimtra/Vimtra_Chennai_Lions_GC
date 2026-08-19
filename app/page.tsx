import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import AeText from "@/components/AeText";
import HeroCarousel from "@/components/home/HeroCarousel";

const PLAYERS = [
  { no: "01", name: "Gaganjeet Bhullar", align: "left" as const, left: "46px" },
  { no: "02", name: "Harshjeet Sethie", align: "left" as const, left: "30%" },
  { no: "03", name: "Samarth Dwivedi", align: "right" as const, right: "46px" },
];

export default function HomePage() {
  return (
    <div className="font-manrope text-ink bg-cream-100">
      {/* ================= HERO ================= */}
      <section
        id="top"
        className="relative overflow-hidden"
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

        <div className="relative max-w-[1280px] mx-auto h-[778px]">
          <AeText
            text="SWING FASTER"
            mode="words"
            as="h1"
            className="absolute top-[64px] left-0 right-0 text-center m-0 font-sora font-extrabold text-white z-[1]"
            style={{
              fontSize: "clamp(64px,11.6vw,178px)",
              lineHeight: 0.9,
              letterSpacing: "-0.035em",
              justifyContent: "center",
            }}
          />

          {PLAYERS.map((p, idx) => (
            <Reveal
              key={p.no}
              variant="fade-up"
              delay={120 + idx * 60}
              className="absolute top-[232px] z-[2]"
              style={{
                left: p.left,
                right: p.right,
                textAlign: p.align,
              }}
            >
              <div className="font-sora font-bold text-[12px] text-[#E9CB8E] tracking-[0.12em]">
                {p.no}
              </div>
              <div className="font-manrope font-semibold text-[14px] text-white/90">
                {p.name}
              </div>
            </Reveal>
          ))}

          <div
            className="absolute top-[150px] left-1/2 z-[3] w-[474px] max-w-[90vw]"
            style={{ transform: "translateX(-50%)" }}
          >
            <Reveal variant="zoom-in" delay={120} className="lift">
              <Image
                src="/assets/hero-golfer.png"
                alt="Hero golfer"
                width={474}
                height={560}
                priority
                className="block w-full h-[560px] object-cover"
              />
            </Reveal>
          </div>

          <Reveal
            variant="fade-left"
            delay={220}
            className="absolute top-[312px] right-[40px] w-[300px] z-[4]"
          >
            <Link
              href="/shop"
              className="lift flex gap-[13px] items-center no-underline rounded-[18px] p-[13px] border border-white/[0.16]"
              style={{
                background: "rgba(24,12,12,0.5)",
                backdropFilter: "blur(12px)",
              }}
            >
              <Image
                src="/assets/gear-thumb.png"
                alt="Gear"
                width={60}
                height={60}
                className="w-[60px] h-[60px] rounded-[12px] shrink-0 object-cover bg-[#1a1513]"
              />
              <div className="min-w-0">
                <div className="font-sora font-bold text-[13px] text-white tracking-[0.01em]">
                  VIMTRA X LIONS PRO GEAR
                </div>
                <div className="font-manrope font-medium text-[11.5px] text-[#E9CB8E] mt-1">
                  Official IGPL Merchandise. Shop Collections →
                </div>
              </div>
            </Link>
          </Reveal>

          <Reveal
            variant="fade-up"
            delay={280}
            className="absolute bottom-[46px] right-[40px] w-[288px] z-[4]"
          >
            <Link
              href="/the-pride"
              className="lift flex items-center justify-between gap-[14px] no-underline rounded-[18px] p-[18px] border border-white/[0.16]"
              style={{
                background: "rgba(24,12,12,0.5)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div>
                <div className="font-sora font-extrabold text-[38px] leading-none text-white tracking-[-0.02em]">
                  10K+
                </div>
                <div className="font-manrope font-semibold text-[12.5px] text-white mt-[7px]">
                  Fans
                </div>
                <div className="font-manrope font-medium text-[11px] text-[#E9CB8E] mt-[3px]">
                  Official IGPL Franchise
                </div>
              </div>
              <Image
                src="/assets/fan-thumb.png"
                alt="Fans"
                width={78}
                height={92}
                className="w-[78px] h-[92px] rounded-[13px] shrink-0 object-cover bg-[#1a1513]"
              />
            </Link>
          </Reveal>

          <Reveal
            variant="fade-up"
            delay={140}
            className="absolute bottom-[54px] left-[46px] z-[4]"
          >
            <AeText
              text="TEE OFF, PLAY PRO"
              mode="mask"
              as="h2"
              className="m-0 font-sora font-extrabold text-white"
              style={{
                fontSize: "clamp(34px,4.7vw,60px)",
                lineHeight: 0.95,
                letterSpacing: "-0.025em",
              }}
            />
            <div
              className="mt-4 rounded-[4px]"
              style={{
                width: 72,
                height: 4,
                background: "linear-gradient(90deg,#E6C57E,#C39A52)",
              }}
            />
          </Reveal>
        </div>
      </section>

      {/* ================= TEAM + CAROUSEL ================= */}
      <section id="team" className="bg-cream-100 px-8 pt-[112px] pb-[92px]">
        <div className="max-w-[1200px] mx-auto flex justify-between items-start gap-10 flex-wrap">
          <Reveal
            variant="fade-up"
            className="tilt w-[214px] h-[214px] rounded-full bg-cream-50 border border-black/[0.08] flex flex-col items-center justify-center text-center p-[26px] shrink-0"
            style={{ boxShadow: "0 26px 60px -34px rgba(26,21,19,0.45)" }}
          >
            <div className="font-sora font-extrabold text-[48px] text-crimson-600 tracking-[-0.025em] leading-none">
              100%
            </div>
            <div className="font-manrope font-medium text-[12.5px] leading-[1.45] text-muted mt-[9px]">
              Driven by Excellence to Conquer the Greens
            </div>
          </Reveal>

          <Reveal
            variant="fade-up"
            delay={100}
            className="flex-1 min-w-[360px] max-w-[660px] bg-cream-50 rounded-[24px] p-[32px_36px] flex gap-[26px] items-start border border-black/[0.06]"
            style={{ boxShadow: "0 26px 60px -38px rgba(26,21,19,0.45)" }}
          >
            <div className="font-sora font-extrabold text-[38px] text-ink bg-white border border-black/[0.08] rounded-[16px] p-[16px_18px] leading-none shrink-0">
              #01
            </div>
            <div>
              <h3 className="m-0 mb-[11px] font-sora font-bold text-[23px] text-ink tracking-[-0.01em]">
                Backed by Vimtra Ventures
              </h3>
              <p className="m-0 font-manrope text-[14.5px] leading-[1.62] text-muted">
                Join Thousands Who Support Chennai&apos;s Premier Golf
                Franchise—Built with Passion, Backed by Long-Term Commitment, and
                Ready for the IGPL.
              </p>
            </div>
          </Reveal>
        </div>

        <div className="relative max-w-[1200px] mx-auto mt-[96px] min-h-[600px]">
          <div
            aria-hidden
            className="absolute inset-0 flex flex-col items-center justify-center text-center z-0 pointer-events-none"
          >
            <span
              className="ae-shimmer font-sora font-extrabold whitespace-nowrap"
              style={{
                fontSize: "clamp(46px,9vw,138px)",
                lineHeight: 0.88,
                letterSpacing: "-0.035em",
                opacity: 0.18,
              }}
            >
              Precision · Strategy
            </span>
            <span
              className="font-sora font-extrabold whitespace-nowrap"
              style={{
                fontSize: "clamp(46px,9vw,138px)",
                lineHeight: 0.88,
                letterSpacing: "-0.035em",
                color: "rgba(196,32,42,0.11)",
              }}
            >
              Elite · Golfers
            </span>
          </div>

          <HeroCarousel />
        </div>
      </section>

      {/* ================= SPONSORS / HOME TURF ================= */}
      <section id="sponsors" className="bg-cream-50 px-8 pt-[100px] pb-[112px]">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex justify-between items-end gap-8 flex-wrap mb-12">
            <Reveal variant="fade-up">
              <div className="flex items-center gap-[13px] mb-[18px]">
                <div
                  className="w-12 h-12 rounded-[13px] bg-crimson-600 flex items-center justify-center"
                  style={{ boxShadow: "0 12px 26px -14px rgba(196,32,42,0.8)" }}
                >
                  <Image
                    src="/assets/logo-lion.png"
                    alt=""
                    width={34}
                    height={34}
                    className="w-[34px] h-[34px] object-contain"
                  />
                </div>
                <span className="font-manrope font-bold tracking-[0.22em] text-[11.5px] text-crimson-600 uppercase">
                  Home Turf
                </span>
              </div>
              <AeText
                text="Explore Our Home Greens"
                mode="words"
                as="h2"
                className="m-0 font-sora font-extrabold text-ink"
                style={{
                  fontSize: "clamp(34px,5vw,56px)",
                  lineHeight: 1,
                  letterSpacing: "-0.025em",
                }}
              />
            </Reveal>
            <Reveal
              variant="fade-up"
              delay={100}
              as="p"
              className="max-w-[430px] m-0 font-manrope text-[15px] leading-[1.62] text-muted"
            >
              Experience championship-level greens, premium clubhouses, and
              world-class driving ranges to elevate your game and watch the
              Chennai Lions roar.
            </Reveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1.62fr_1fr] gap-6">
            <Reveal variant="fade-up">
              <Link
                href="/the-club"
                className="lift relative block h-[486px] rounded-[26px] overflow-hidden no-underline"
                style={{ boxShadow: "0 30px 70px -44px rgba(26,21,19,0.5)" }}
              >
                <Image
                  src="/assets/fac-main.png"
                  alt="Championship Course"
                  fill
                  sizes="(max-width:768px) 100vw, 60vw"
                  className="object-cover"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(180deg,transparent 45%,rgba(20,8,8,0.78) 100%)",
                  }}
                />
                <div className="absolute left-[28px] right-[28px] bottom-[26px] flex justify-between items-end gap-[18px]">
                  <div>
                    <h3 className="m-0 mb-2 font-sora font-bold text-[24px] text-white tracking-[-0.01em]">
                      Lions Championship Course
                    </h3>
                    <p className="m-0 font-manrope text-[13.5px] leading-[1.55] text-white/80 max-w-[440px]">
                      An 18-hole modern championship layout built for high-stakes
                      IGPL competition and unforgettable matchplay.
                    </p>
                  </div>
                  <div className="w-[46px] h-[46px] rounded-full bg-white/[0.14] border border-white/[0.35] backdrop-blur-[6px] text-white flex items-center justify-center text-[18px] shrink-0">
                    →
                  </div>
                </div>
              </Link>
            </Reveal>

            <Reveal variant="fade-up" delay={120}>
              <Link
                href="/fixtures"
                className="lift relative block h-[486px] rounded-[26px] overflow-hidden no-underline"
                style={{ boxShadow: "0 30px 70px -44px rgba(26,21,19,0.5)" }}
              >
                <Image
                  src="/assets/fac-range.png"
                  alt="Driving Range"
                  fill
                  sizes="(max-width:768px) 100vw, 40vw"
                  className="object-cover"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(180deg,transparent 45%,rgba(20,8,8,0.78) 100%)",
                  }}
                />
                <div className="absolute left-[24px] right-[24px] bottom-[26px]">
                  <h3 className="m-0 mb-2 font-sora font-bold text-[22px] text-white tracking-[-0.01em]">
                    Vimtra Driving Range
                  </h3>
                  <p className="m-0 font-manrope text-[13.5px] leading-[1.55] text-white/80">
                    A state-of-the-art practice facility designed for mastering
                    your swing in every condition.
                  </p>
                </div>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
