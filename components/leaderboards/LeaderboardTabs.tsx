"use client";

import { useMemo, useState } from "react";
import type { StandingRow } from "@/lib/standings";

type Board = "team" | "player" | "order";

const TABS: { key: Board; label: string }[] = [
  { key: "team", label: "Franchise Table" },
  { key: "player", label: "Player of the Season" },
  { key: "order", label: "Order of Merit" },
];

const TITLES: Record<Board, string[]> = {
  team: ["FRANCHISE", "TABLE."],
  player: ["PLAYER OF", "THE SEASON."],
  order: ["ORDER OF", "MERIT."],
};

// Column header sets per board. Kept out of the JSX so the shape of the
// three tables stays parallel; extra columns come from row.extra (a JSON
// blob managed by the admin surface).
const HEADERS: Record<Board, string[]> = {
  team: ["Pos", "Franchise", "Events", "Points", "Best Finish", "Avg Score"],
  player: ["Pos", "Player", "Franchise", "Top 10s", "Wins", "Points"],
  order: ["Pos", "Player", "Events", "Earnings (₹)", "Avg / Event"],
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

function cell(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  return String(v);
}

/**
 * The three standings boards.
 *
 * Rendered only when the season actually holds rows — the empty state lives
 * on the page itself, so this component never has to pretend. The pill tabs
 * and the rounded card are gone: an editorial tab rail over a ruled table,
 * with the franchise's own row marked so a visitor can find it instantly.
 */
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

  const rows = useMemo(
    () =>
      board === "team"
        ? boards.team
        : board === "player"
        ? boards.player
        : boards.order,
    [board, boards]
  );

  return (
    <div>
      <div className="ss-tabs" role="group" aria-label="Choose a standings board">
        {TABS.map((t) => {
          const count =
            t.key === "team"
              ? boards.team.length
              : t.key === "player"
              ? boards.player.length
              : boards.order.length;
          return (
            <button
              key={t.key}
              type="button"
              className={`ss-tab ${board === t.key ? "is-active" : ""}`.trim()}
              aria-pressed={board === t.key}
              disabled={count === 0}
              onClick={() => setBoard(t.key)}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div aria-live="polite">
        <h2 className="hp-section-title">
          {TITLES[board].map((l) => (
            <span className="mq-line" data-line key={l}>
              <span>{l}</span>
            </span>
          ))}
        </h2>
        <p className="cm-lede" data-rise>
          AM Green IGPL · Season {seasonYear}
        </p>

        {rows.length === 0 ? (
          <p className="cm-lede hp-mt-md">
            No rows published for this board yet.
          </p>
        ) : (
          <div className="ss-table-wrap hp-mt-lg">
            <table className="ss-table">
              <thead>
                <tr>
                  {HEADERS[board].map((h) => (
                    <th key={h} scope="col">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className={isLions(r) ? "is-lions" : undefined}>
                    <td className="ss-rank">{r.rank}</td>
                    <td className="ss-who">{r.name}</td>
                    {EXTRA_KEYS[board].map((k) => (
                      <td key={k}>
                        {k === "teamName"
                          ? cell(r.teamName)
                          : cell(r.extra[k])}
                      </td>
                    ))}
                    {board !== "order" && <td>{cell(r.points)}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
