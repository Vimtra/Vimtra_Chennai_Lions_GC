import type { StandingRow } from "@/lib/standings";
import s from "./FranchiseTable.module.css";

/**
 * Chennai Lions event results — RANK | EVENT | R1 | R2 | R3 | R4 | SCORE.
 *
 * The TEAM board's stored rows are Vimtra Chennai Lions GC's results at
 * individual events, each name keyed as "Vimtra Chennai Lions GC (<event>)".
 * Checked against the stored data (2026-10-13): R1–R3 and SCORE equal the
 * sum of the best two Lions player scores for that event and round in the
 * Score table. `rank` is shown as "Rank", not "Finish": nothing stored says
 * it is an event placing, and the schema keeps it unique per board.
 *
 * Every value is read from the stored Standing row: `rank` from the column,
 * the round figures and total from the board's `extra` JSON (`r1`–`r4`,
 * `score`). Strings are printed exactly as stored; a missing value stays
 * "—". Row order is the stored rank order, and the franchise marker never
 * moves or re-ranks a row.
 *
 * Rendered only when the board has rows; the empty state stays with
 * StandingsBoard's `Awaiting`.
 */

const LIONS = new Set([
  "vimtra chennai lions gc",
  "vimtra chennai lions",
  "chennai lions gc",
  "chennai lions",
]);

/**
 * "Vimtra Chennai Lions GC (AM Green IGPL Invitational 2026 …)" → the
 * franchise, plus the trailing parenthetical the admin keyed in as context.
 * Display only: both halves are shown, nothing is dropped or rewritten.
 */
export function splitQualifier(name: string): { base: string; qualifier: string | null } {
  const m = name.trim().match(/^(.*?)\s*\(([^()]*)\)$/);
  if (!m || !m[1]) return { base: name.trim(), qualifier: null };
  return { base: m[1], qualifier: m[2].trim() || null };
}

/** Exact franchise-name match, once any trailing "(…)" context is set aside. */
export function isLionsName(name: string | null | undefined): boolean {
  if (!name) return false;
  return LIONS.has(splitQualifier(name).base.toLowerCase());
}

function text(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const t = String(v).trim();
  return t === "" ? null : t;
}

/**
 * Tone for a stored score string, or nothing. Only "E" or an integer too
 * small to be a stroke count (|n| < 30) is treated as relative to par;
 * anything else is left neutral. Matches the /scores leaderboard.
 */
function parTone(v: string): string | undefined {
  const t = v.replace(/−/g, "-");
  if (/^e$/i.test(t)) return s.even;
  if (!/^[+-]?\d+$/.test(t)) return undefined;
  const n = Number(t);
  if (Math.abs(n) >= 30) return undefined;
  return n < 0 ? s.under : n > 0 ? s.over : s.even;
}

function Cell({ value, className }: { value: string | null; className?: string }) {
  if (value === null) {
    return (
      <td className={[className, s.missing].filter(Boolean).join(" ")}>
        <span aria-hidden>—</span>
        <span className={s.sr}>Not published</span>
      </td>
    );
  }
  return <td className={[className, parTone(value)].filter(Boolean).join(" ")}>{value}</td>;
}

const ROUNDS = ["r1", "r2", "r3", "r4"] as const;

export default function FranchiseTable({ rows }: { rows: StandingRow[] }) {
  const lionsOnBoard = rows.some((r) => isLionsName(r.name));
  // "Event" only when every row actually names one; otherwise the column
  // keeps its stored meaning and is labelled "Franchise".
  const byEvent = rows.every((r) => splitQualifier(r.name).qualifier !== null);
  const unit = byEvent ? "event" : "row";
  const count = `${rows.length} ${unit}${rows.length === 1 ? "" : "s"}`;

  return (
    <div className={s.wrap} data-rise>
      <div className={s.bar} aria-hidden>
        <p className={s.barLabel}>Season {rows[0]?.seasonYear} · Chennai Lions event results</p>
        <p className={s.barMeta}>
          {lionsOnBoard && <span className={s.legend}>Vimtra Chennai Lions</span>}
          <span>{count}</span>
        </p>
      </div>

      <div
        className={s.scroll}
        tabIndex={0}
        role="region"
        aria-label="Chennai Lions event results (scrolls sideways)"
      >
        <table className={s.table}>
          <caption className={s.sr}>Chennai Lions event results, {count}</caption>
          <colgroup>
            <col className={s.colRank} />
            <col />
            {ROUNDS.map((k) => (
              <col key={k} className={s.colNum} />
            ))}
            <col className={s.colScore} />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">Rank</th>
              <th scope="col">{byEvent ? "Event" : "Franchise"}</th>
              {ROUNDS.map((k, i) => (
                <th scope="col" key={k}>
                  <abbr title={`Round ${i + 1}`}>R{i + 1}</abbr>
                </th>
              ))}
              <th scope="col" className={s.thScore}>
                Score
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const { base, qualifier } = splitQualifier(r.name);
              const lions = isLionsName(r.name);
              const cls = [r.rank === 1 ? s.lead : "", lions ? s.lions : ""]
                .filter(Boolean)
                .join(" ");
              return (
                <tr key={r.id} className={cls || undefined}>
                  <td className={s.rank}>{r.rank}</td>
                  <th scope="row" className={s.franchise}>
                    {/* Under an "Event" heading the event leads and the
                        stored franchise name follows; both are shown whole. */}
                    {byEvent && qualifier && <span className={s.name}>{qualifier}</span>}
                    <span className={byEvent && qualifier ? s.qualifier : s.name}>
                      {base}
                      {lions && (
                        <span className={s.tag}>
                          <span className={s.sr}>Vimtra Chennai </span>Lions
                        </span>
                      )}
                    </span>
                    {!byEvent && qualifier && <span className={s.qualifier}>{qualifier}</span>}
                  </th>
                  {ROUNDS.map((k) => (
                    <Cell key={k} value={text(r.extra[k])} />
                  ))}
                  <Cell value={text(r.extra.score)} className={s.score} />
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className={s.note}>
        Ranks and scores are shown exactly as published to this site. “—” marks a value not yet
        published.
      </p>
    </div>
  );
}
