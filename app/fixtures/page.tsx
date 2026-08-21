import type { Metadata } from "next";
import AeText from "@/components/AeText";
import Reveal from "@/components/Reveal";
import FixturesList from "@/components/fixtures/FixturesList";
import { listFixtures } from "@/lib/fixtures";

export const metadata: Metadata = {
  title: "Fixtures · Vimtra Chennai Lions GC",
  description:
    "The Season 2026 calendar — Am Green IGPL Invitationals, completed African swing, and the Chennai Lions season opener at Al Hamra.",
};

// Always resolve against the current DB row set so admin edits are reflected
// immediately. Fixtures are low-volume so the extra request cost is trivial.
export const dynamic = "force-dynamic";

export default async function FixturesPage() {
  const fixtures = await listFixtures();

  return (
    <>
      <section
        className="relative overflow-hidden px-8 pt-[90px] pb-[70px]"
        style={{
          background:
            "radial-gradient(125% 105% at 50% -5%,#C9242E 0%,#A8181F 58%,#871119 100%)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 84% 16%,rgba(233,203,142,0.16),transparent 42%)",
          }}
        />
        <div className="relative max-w-[1200px] mx-auto">
          <div className="font-manrope font-bold text-[12px] tracking-[0.32em] text-[#E9CB8E] uppercase">
            AM Green IGPL · Season 2026
          </div>
          <AeText
            text="FIXTURES"
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
            delay={100}
            as="p"
            className="max-w-[620px] mt-[22px] font-manrope text-[16px] leading-[1.6] text-white/85"
          >
            The Season 2026 calendar as published in the Chennai Lions IGPL
            brochure. Further events populate this page as the AM Green IGPL
            announces them.
          </Reveal>
        </div>
      </section>

      <section className="bg-cream-100 px-8 pt-12 pb-24">
        <FixturesList fixtures={fixtures} />

        <Reveal
          variant="fade-up"
          className="max-w-[1100px] mx-auto mt-14 rounded-[18px] border border-black/[0.06] bg-cream-50 p-6 font-manrope text-[13px] leading-[1.65] text-muted"
        >
          Season 2026 spans <strong>15 events</strong> across{" "}
          <strong>10 franchises</strong> — ten in India and five international.
          The calendar shown here is the subset the Chennai Lions IGPL brochure
          publishes today. Live scoring and franchise standings unlock as each
          tournament week begins — see{" "}
          <a href="/scores" className="text-crimson-600 no-underline">
            /scores
          </a>{" "}
          and{" "}
          <a href="/leaderboards" className="text-crimson-600 no-underline">
            /leaderboards
          </a>
          .
        </Reveal>
      </section>
    </>
  );
}
