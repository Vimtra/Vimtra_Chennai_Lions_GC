import type { Metadata } from "next";
import AeText from "@/components/AeText";
import LeaderboardTabs from "@/components/leaderboards/LeaderboardTabs";

export const metadata: Metadata = {
  title: "Leaderboards · Vimtra Chennai Lions GC",
  description: "IGPL 2026 season standings — franchise table, Player of the Season race, and Order of Merit.",
};

export default function LeaderboardsPage() {
  return (
    <>
      <section
        className="relative overflow-hidden px-8 pt-[88px] pb-[70px]"
        style={{ background: "radial-gradient(125% 105% at 50% -5%,#C9242E 0%,#A8181F 58%,#871119 100%)" }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 84% 16%,rgba(233,203,142,0.16),transparent 42%)" }} />
        <div className="relative max-w-[1200px] mx-auto">
          <div className="font-manrope font-bold text-[12px] tracking-[0.32em] text-[#E9CB8E] uppercase">
            2026 Season Standings
          </div>
          <AeText
            text="LEADERBOARDS"
            mode="words"
            as="h1"
            className="mt-[14px] font-sora font-extrabold text-white"
            style={{ fontSize: "clamp(52px,8vw,128px)", lineHeight: 0.92, letterSpacing: "-0.035em" }}
          />
        </div>
      </section>

      <section className="bg-cream-100 px-8 pt-12 pb-24">
        <LeaderboardTabs />
      </section>
    </>
  );
}
