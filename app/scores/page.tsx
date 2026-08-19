import type { Metadata } from "next";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Scores · Vimtra Chennai Lions GC",
  description: "Live IGPL Chennai Open scoring — Lions squad leaderboard, hole-by-hole, and shot updates.",
};

const LEADER = [
  { pos: "T2", name: "Gaganjeet Bhullar", r1: "67", thru: "14", today: "-3", todayCls: "red", total: "-6", totalCls: "red" },
  { pos: "T9", name: "Harshjeet Sethie", r1: "69", thru: "13", today: "-2", todayCls: "red", total: "-4", totalCls: "red" },
  { pos: "T18", name: "Samarth Dwivedi", r1: "71", thru: "12", today: "-1", todayCls: "red", total: "-2", totalCls: "red" },
  { pos: "T34", name: "Yashas Chandra M S", r1: "74", thru: "11", today: "E", todayCls: "", total: "+2", totalCls: "green" },
];

const PAR = ["4", "4", "5", "3", "4", "4", "4", "3", "5", "4", "4", "3", "5", "4", "4", "3", "4", "5"];
const SCORE = ["4", "3", "4", "3", "4", "4", "4", "3", "5", "4", "3", "3", "4", "4", "·", "·", "·", "·"];

const UPDATES = [
  { init: "GB", bg: "linear-gradient(160deg,#C9242E,#871119)", color: "#fff", title: "Bhullar · Birdie on 11", d: "Stuck wedge to 4 ft. Eighth birdie of the tournament.", t: "2 min ago" },
  { init: "HS", bg: "linear-gradient(160deg,#E6C57E,#C39A52)", color: "#3A1A06", title: "Sethie · Par save on 13", d: "12 ft right-to-left curler from the fringe. Big momentum hold.", t: "9 min ago" },
  { init: "SD", bg: "#1A1513", color: "#E9CB8E", title: "Dwivedi · Eagle look on 12", d: "Drove the par-4 12th to 18 ft. Settled for two-putt birdie.", t: "18 min ago" },
];

export default function ScoresPage() {
  return (
    <>
      <section
        className="relative overflow-hidden px-8 pt-[78px] pb-16"
        style={{ background: "radial-gradient(125% 105% at 50% -5%,#C9242E 0%,#A8181F 58%,#871119 100%)" }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 84% 16%,rgba(233,203,142,0.16),transparent 42%)" }} />
        <div className="relative max-w-[1200px] mx-auto">
          <div className="flex items-center gap-[14px]">
            <span className="badge-live">LIVE</span>
            <span className="font-manrope font-bold text-[12px] tracking-[0.32em] text-[#E9CB8E] uppercase">
              IGPL Chennai Open · Round 2 of 4
            </span>
          </div>
          <h1 className="mt-[18px] font-sora font-extrabold text-white" style={{ fontSize: "clamp(48px,7.4vw,108px)", lineHeight: 0.92, letterSpacing: "-0.035em" }}>
            SCORES
          </h1>
          <div className="mt-[18px] flex gap-6 flex-wrap text-white font-manrope">
            {[
              ["COURSE", "Madras Gymkhana · Par 72"],
              ["WEATHER", "29°C · Wind 11 km/h SE"],
              ["TEAM POSITION", "T2 · -9"],
            ].map(([k, v]) => (
              <div key={k}>
                <span className="text-[#E9CB8E] font-bold tracking-[0.08em] text-[11px]">{k}</span>
                <div className="font-sora font-bold mt-1">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream-100 px-8 pt-16 pb-24">
        <div className="max-w-[1100px] mx-auto">
          <Reveal variant="fade-up" className="scorecard mb-6">
            <h2 className="m-0 mb-[18px] font-sora font-extrabold text-[26px] tracking-[-0.02em]">
              Live Leaderboard · Lions Squad
            </h2>
            <div className="overflow-x-auto">
              <table className="stats-table">
                <thead>
                  <tr>
                    <th>Pos</th><th>Player</th><th>R1</th><th>R2 (Thru)</th><th>Today</th><th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {LEADER.map((r) => (
                    <tr key={r.name}>
                      <td className="font-bold">{r.pos}</td>
                      <td className="font-bold">{r.name}</td>
                      <td>{r.r1}</td>
                      <td>{r.thru}</td>
                      <td className={r.todayCls}>{r.today}</td>
                      <td className={r.totalCls}>{r.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>

          <Reveal variant="fade-up" className="scorecard mb-6">
            <h2 className="m-0 mb-[6px] font-sora font-extrabold text-[22px] tracking-[-0.02em]">
              Bhullar · Round 2 hole-by-hole
            </h2>
            <div className="font-manrope text-[13px] text-muted mb-[18px]">Thru 14 · -3 today, -6 tournament</div>
            <div className="overflow-x-auto">
              <table className="stats-table">
                <thead>
                  <tr>
                    <th>Hole</th>
                    {PAR.map((_, i) => (
                      <th key={i}>{i + 1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-bold text-muted">Par</td>
                    {PAR.map((p, i) => (
                      <td key={i}>{p}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="font-bold">Score</td>
                    {SCORE.map((s, i) => (
                      <td key={i} style={s === "·" ? { color: "#9b8f85" } : undefined}>{s}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </Reveal>

          <Reveal variant="fade-up" className="scorecard">
            <h2 className="m-0 mb-[18px] font-sora font-extrabold text-[22px] tracking-[-0.02em]">
              Recent shot updates
            </h2>
            <div className="flex flex-col gap-[14px]">
              {UPDATES.map((u) => (
                <div key={u.title} className="flex gap-[14px] p-[14px] bg-white border border-black/[0.06] rounded-[14px]">
                  <div
                    className="w-[54px] h-[54px] rounded-full font-sora font-extrabold text-[18px] flex items-center justify-center shrink-0"
                    style={{ background: u.bg, color: u.color }}
                  >
                    {u.init}
                  </div>
                  <div className="flex-1">
                    <div className="font-sora font-bold text-[14px]">{u.title}</div>
                    <div className="font-manrope text-[13px] text-muted mt-[3px]">{u.d}</div>
                  </div>
                  <div className="font-manrope text-[12px] text-[#9b8f85]">{u.t}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
