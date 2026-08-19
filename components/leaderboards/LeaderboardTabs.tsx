"use client";

import { useState } from "react";

type Board = "team" | "player" | "order";

const TABS: { key: Board; label: string }[] = [
  { key: "team", label: "TEAM STANDINGS" },
  { key: "player", label: "PLAYER OF THE SEASON" },
  { key: "order", label: "ORDER OF MERIT" },
];

const TEAM = [
  ["1", "Bengaluru Tuskers GC", "5", "1,842", "1st (×2)", "69.4", false],
  ["2", "Vimtra Chennai Lions GC", "5", "1,694", "2nd (×2)", "70.1", true],
  ["3", "Mumbai Mavericks", "5", "1,562", "1st (×1)", "70.6", false],
  ["4", "Delhi Royals GC", "5", "1,498", "2nd (×1)", "70.9", false],
  ["5", "Hyderabad Hawks", "5", "1,402", "3rd (×1)", "71.3", false],
  ["6", "Kolkata Tigers GC", "5", "1,288", "4th", "71.8", false],
  ["7", "Pune Panthers", "5", "1,124", "5th", "72.4", false],
  ["8", "Jaipur Jaguars GC", "5", "998", "6th", "73.0", false],
] as const;

const PLAYER = [
  ["1", "Aman Raj", "Bengaluru Tuskers", "5", "2", "612", false],
  ["2", "Gaganjeet Bhullar", "Vimtra Chennai Lions", "4", "1", "568", true],
  ["3", "Shubhankar Sharma", "Mumbai Mavericks", "4", "1", "522", false],
  ["4", "Karandeep Kochhar", "Delhi Royals", "3", "1", "478", false],
  ["5", "Harshjeet Sethie", "Vimtra Chennai Lions", "3", "0", "442", true],
  ["6", "Veer Ahlawat", "Hyderabad Hawks", "2", "0", "396", false],
  ["11", "Samarth Dwivedi", "Vimtra Chennai Lions", "1", "0", "312", true],
  ["28", "Yashas Chandra M S", "Vimtra Chennai Lions", "0", "0", "164", true],
] as const;

const ORDER = [
  ["1", "Aman Raj", "5", "1,82,40,000", "4.8", false],
  ["2", "Gaganjeet Bhullar", "5", "1,64,80,000", "6.2", true],
  ["3", "Shubhankar Sharma", "5", "1,42,20,000", "7.0", false],
  ["7", "Harshjeet Sethie", "5", "78,40,000", "11.4", true],
  ["14", "Samarth Dwivedi", "5", "52,10,000", "18.6", true],
] as const;

function Pos({ value, lions }: { value: string; lions: boolean }) {
  return <td className={`pos ${lions ? "red" : ""}`}>{value}</td>;
}

export default function LeaderboardTabs() {
  const [board, setBoard] = useState<Board>("team");

  return (
    <div className="max-w-[1100px] mx-auto">
      <div className="flex gap-[10px] flex-wrap mb-[30px]">
        {TABS.map((t) => (
          <button key={t.key} className={`tab ${board === t.key ? "active" : ""}`} onClick={() => setBoard(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {board === "team" && (
        <div className="bg-cream-50 border border-black/[0.07] rounded-[22px] p-6 overflow-x-auto">
          <h2 className="m-0 mb-[18px] font-sora font-extrabold text-[24px] tracking-[-0.02em]">
            IGPL 2026 · Franchise Standings
          </h2>
          <table className="stats-table">
            <thead>
              <tr><th>Pos</th><th>Franchise</th><th>Events</th><th>Points</th><th>Best Finish</th><th>Avg Score</th></tr>
            </thead>
            <tbody>
              {TEAM.map((r) => (
                <tr key={r[1]} className={r[6] ? "lions" : ""}>
                  <Pos value={r[0]} lions={r[6]} />
                  <td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td>{r[4]}</td><td>{r[5]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {board === "player" && (
        <div className="bg-cream-50 border border-black/[0.07] rounded-[22px] p-6 overflow-x-auto">
          <h2 className="m-0 mb-[18px] font-sora font-extrabold text-[24px] tracking-[-0.02em]">
            Player of the Season Race
          </h2>
          <table className="stats-table">
            <thead>
              <tr><th>Pos</th><th>Player</th><th>Franchise</th><th>Top 10s</th><th>Wins</th><th>Points</th></tr>
            </thead>
            <tbody>
              {PLAYER.map((r) => (
                <tr key={r[1]} className={r[6] ? "lions" : ""}>
                  <Pos value={r[0]} lions={r[6]} />
                  <td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td>{r[4]}</td><td>{r[5]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {board === "order" && (
        <div className="bg-cream-50 border border-black/[0.07] rounded-[22px] p-6 overflow-x-auto">
          <h2 className="m-0 mb-[18px] font-sora font-extrabold text-[24px] tracking-[-0.02em]">
            Order of Merit · Prize Money
          </h2>
          <table className="stats-table">
            <thead>
              <tr><th>Pos</th><th>Player</th><th>Events</th><th>Earnings (₹)</th><th>Avg Finish</th></tr>
            </thead>
            <tbody>
              {ORDER.map((r) => (
                <tr key={r[1]} className={r[5] ? "lions" : ""}>
                  <Pos value={r[0]} lions={r[5]} />
                  <td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td>{r[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
