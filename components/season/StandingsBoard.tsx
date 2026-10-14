import type { ReactNode } from "react";
import type { StandingRow } from "@/lib/standings";
import FranchiseTable from "@/components/season/FranchiseTable";

/** Chennai Lions event results, with a verified-data empty state. */
export default function StandingsBoard({
  rows,
  note,
}: {
  rows: StandingRow[];
  /** One factual line about why the board is empty. */
  note: ReactNode;
}) {
  return (
    <div className="tb-board tb-board-team">
      <div className="tb-board-head">
        <p className="tb-board-n" data-rise>
          01<span aria-hidden />
        </p>
        <h2 className="tb-board-name" data-rise>
          Chennai Lions — Event Results
        </h2>
        <p className="tb-board-ranks" data-rise>
          Results and round scores across published events.
        </p>
      </div>
      {rows.length > 0 ? (
        <FranchiseTable rows={rows} />
      ) : (
        <div className="tb-await" data-rise>
          <p className="tb-await-t">No event results have been published yet.</p>
          <ul className="tb-await-cols">
            {["Rank", "Event", "R1", "R2", "R3", "R4", "Score"].map((column) => (
              <li key={column}>{column}</li>
            ))}
          </ul>
          <p className="tb-await-d">{note}</p>
        </div>
      )}
    </div>
  );
}
