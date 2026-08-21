"use client";

import { useMemo, useState } from "react";
import type { StandingBoard } from "@prisma/client";
import type { StandingRow } from "@/lib/standings";

type Board = "team" | "player" | "order";

const TABS: { key: Board; label: string; boardCode: StandingBoard }[] = [
  { key: "team", label: "TEAM STANDINGS", boardCode: "TEAM" },
  { key: "player", label: "PLAYER OF THE SEASON", boardCode: "PLAYER" },
  { key: "order", label: "ORDER OF MERIT", boardCode: "ORDER" },
];

// Column header sets per board. Kept out of the JSX so the shape of the
// three tables stays parallel; extra columns come from row.extra (a JSON
// blob managed by the admin surface).
const HEADERS: Record<Board, string[]> = {
  team: ["Pos", "Franchise", "Events", "Points", "Best Finish", "Avg Score"],
  player: ["Pos", "Player", "Franchise", "Top 10s", "Wins", "Points"],
  order: ["Pos", "Player", "Events", "Earnings (₹)", "Avg / Event", ""],
};

const EXTRA_KEYS: Record<Board, string[]> = {
  team: ["events", "bestFinish", "avgScore"],
  player: ["teamName", "top10", "wins"],
  order: ["events", "earnings", "avgPerEvent"],
};

const LIONS_TEAM_NAMES = new Set([
  "vimtra chennai lions gc",
  "vimtra chennai lions",
  "chennai lions gc",
  "chennai lions",
]);

function isLions(row: StandingRow): boolean {
  const team = (row.teamName ?? row.name).toLowerCase();
  return LIONS_TEAM_NAMES.has(team);
}

export default function LeaderboardTabs({
  seasonYear,
  boards,
}: {
  seasonYear: number;
  boards: { team: StandingRow[]; player: StandingRow[]; order: StandingRow[] };
}) {
  const [board, setBoard] = useState<Board>(
    boards.team.length ? "team" : boards.player.length ? "player" : "order"
  );

  const activeRows = useMemo(
    () => (board === "team" ? boards.team : board === "player" ? boards.player : boards.order),
    [board, boards]
  );

  return (
    <div>
      <div className="flex gap-[10px] flex-wrap mb-[30px]">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tab ${board === t.key ? "active" : ""}`}
            onClick={() => setBoard(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-cream-50 border border-black/[0.07] rounded-[22px] p-6 overflow-x-auto">
        <h2 className="m-0 mb-[18px] font-sora font-extrabold text-[24px] tracking-[-0.02em]">
          {board === "team"
            ? `IGPL ${seasonYear} · Franchise Standings`
            : board === "player"
            ? `Player of the Season · ${seasonYear}`
            : `Order of Merit · ${seasonYear}`}
        </h2>

        {activeRows.length === 0 ? (
          <div className="font-manrope text-[14px] leading-[1.65] text-muted py-6">
            No rows recorded for this board yet. Standings publish here once
            season scoring produces verifiable results.
          </div>
        ) : (
          <table className="stats-table">
            <thead>
              <tr>
                {HEADERS[board].map((h, i) => (
                  <th key={`${h}-${i}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeRows.map((r) => (
                <tr key={r.id} className={isLions(r) ? "lions" : ""}>
                  <td className="pos">{r.rank}</td>
                  <td>{r.name}</td>
                  {EXTRA_KEYS[board].map((k, i) => (
                    <td key={`${k}-${i}`}>
                      {formatCell(k === "teamName" ? r.teamName : r.extra[k]) ??
                        ""}
                    </td>
                  ))}
                  <td>{r.points ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function formatCell(v: string | number | null | undefined): string | null {
  if (v === null || v === undefined || v === "") return null;
  return String(v);
}
