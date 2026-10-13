import type { ReactNode } from "react";
import type { StandingRow } from "@/lib/standings";
import FranchiseTable, { isLionsName } from "@/components/season/FranchiseTable";

/**
 * One standings board, rendered as an editorial ranking rather than a table.
 *
 * The three boards share a skeleton — rank numeral, identity, figure, meta —
 * so they read as one championship system, but each is presented on its own
 * terms:
 *
 *   team   Chennai Lions event results: rank, event, R1–R4 and score —
 *          see FranchiseTable
 *   player player name over their franchise, POINTS as the figure
 *   order  player name, EARNINGS as the figure, set in rupees
 *
 * Columns come from the Standing model: `rank`, `name`, `teamName`, `points`
 * and the board-specific keys inside `extra`. Nothing is derived and nothing
 * is invented — in particular the schema carries no previous-rank column, so
 * there is no position-movement indicator anywhere on this page. Adding one
 * would mean inventing it.
 *
 * With no rows the board does not disappear and does not show illustrative
 * ranks. It states what it will rank, by the columns it actually carries.
 */

export type BoardKey = "team" | "player" | "order";

interface BoardDef {
  n: string;
  name: string;
  /** What this board ranks, in one line. Stated once, in the head. */
  ranks: string;
  /** What is absent while it is empty. Never a repeat of `ranks`. */
  missing: string;
  /** The columns it carries, named from the schema. */
  cols: string[];
  figureLabel: string;
}

export const BOARD_DEFS: Record<BoardKey, BoardDef> = {
  team: {
    n: "01",
    // The stored TEAM rows are the Lions' own results at individual events,
    // not a league-wide franchise table — labelled accordingly.
    name: "Chennai Lions — Event Results",
    ranks: "Results and round scores across published events.",
    missing: "No event results have been published yet.",
    cols: ["Rank", "Event", "R1", "R2", "R3", "R4", "Score"],
    figureLabel: "Score",
  },
  player: {
    n: "02",
    name: "Player of the Season",
    ranks: "Season points across the field.",
    missing: "Season points are not available yet.",
    cols: ["Position", "Player", "Franchise", "Top 10s", "Wins", "Points"],
    figureLabel: "Points",
  },
  order: {
    n: "03",
    name: "Order of Merit",
    ranks: "Season earnings across the field.",
    missing: "Earnings are not available yet.",
    cols: ["Position", "Player", "Events", "Earnings", "Average per event"],
    figureLabel: "Earnings",
  },
};

function isLions(r: StandingRow): boolean {
  return isLionsName(r.teamName ?? r.name);
}

function text(v: unknown): string | null {
  if (v === null || v === undefined || v === "") return null;
  return String(v);
}

/** Rupees when the stored value is numeric; the admin's own string when not. */
function money(v: unknown): string | null {
  const raw = text(v);
  if (raw === null) return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return raw;
  return `₹${n.toLocaleString("en-IN")}`;
}

function Meta({ items }: { items: { k: string; v: string | null }[] }) {
  const shown = items.filter((i) => i.v !== null);
  if (shown.length === 0) return null;
  return (
    <dl className="tb-rank-meta">
      {shown.map((i) => (
        <div key={i.k}>
          <dt>{i.k}</dt>
          <dd>{i.v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Rows({ board, rows }: { board: BoardKey; rows: StandingRow[] }) {
  if (board === "team") return <FranchiseTable rows={rows} />;

  return (
    <ol className="tb-ranks">
      {rows.map((r) => {
        const lead = r.rank === 1;
        const figure = board === "order" ? money(r.extra.earnings) : text(r.points);

        const meta =
          board === "player"
            ? [
                { k: "Wins", v: text(r.extra.wins) },
                { k: "Top 10s", v: text(r.extra.top10) },
              ]
            : [
                { k: "Events", v: text(r.extra.events) },
                { k: "Avg / event", v: money(r.extra.avgPerEvent) },
              ];

        return (
          <li
            key={r.id}
            data-rise
            className={`${lead ? "is-lead" : ""} ${
              isLions(r) ? "is-lions" : ""
            }`
              .replace(/\s+/g, " ")
              .trim()}
          >
            <span className="tb-rank-n">
              {String(r.rank).padStart(2, "0")}
            </span>
            <span className="tb-rank-id">
              <span className="tb-rank-name">{r.name}</span>
              {board === "player" && r.teamName && (
                <span className="tb-rank-sub">{r.teamName}</span>
              )}
              <Meta items={meta} />
            </span>
            <span className="tb-rank-fig">
              <span className="tb-rank-fig-v">{figure ?? "—"}</span>
              <span className="tb-rank-fig-k">
                {BOARD_DEFS[board].figureLabel}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function Awaiting({ board, note }: { board: BoardKey; note: ReactNode }) {
  const def = BOARD_DEFS[board];
  return (
    <div className="tb-await" data-rise>
      <p className="tb-await-t">{def.missing}</p>
      <ul className="tb-await-cols">
        {def.cols.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
      <p className="tb-await-d">{note}</p>
    </div>
  );
}

export default function StandingsBoard({
  board,
  rows,
  note,
}: {
  board: BoardKey;
  rows: StandingRow[];
  /** One factual line about why the board is empty. Only used when it is. */
  note: ReactNode;
}) {
  const def = BOARD_DEFS[board];
  return (
    <div className={`tb-board tb-board-${board}`}>
      <div className="tb-board-head">
        <p className="tb-board-n" data-rise>
          {def.n}
          <span aria-hidden />
        </p>
        <h2 className="tb-board-name" data-rise>
          {def.name}
        </h2>
        <p className="tb-board-ranks" data-rise>
          {def.ranks}
        </p>
      </div>
      {rows.length > 0 ? (
        <Rows board={board} rows={rows} />
      ) : (
        <Awaiting board={board} note={note} />
      )}
    </div>
  );
}
