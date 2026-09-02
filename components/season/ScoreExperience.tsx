"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gsap, registerGsap, reduced, rise } from "@/components/motion/gsap";

/**
 * The scoring experience — one tournament card plus the season's card index.
 *
 * Shape rather than dashboard: the selected event is a broadcast title
 * block, the scores beneath it are a ruled leaderboard, and moving between
 * events happens through the season's own programme index rather than a
 * row of filter pills.
 *
 * The board renders exactly what the Score table holds for the selected
 * fixture. With no rows it states the absence and names the columns the
 * board will carry — the same device /leaderboards uses — rather than
 * drawing an empty table. Nothing provisional, projected or illustrative is
 * ever drawn, so the lit and unlit states are the same component.
 *
 * Every value is passed in pre-formatted by app/scores/page.tsx from real
 * Fixture and Score rows.
 */

export interface ScoreRow {
  id: string;
  position: string | null;
  playerName: string;
  r1: string | null;
  r2: string | null;
  r3: string | null;
  r4: string | null;
  thru: string | null;
  today: string | null;
  total: string | null;
  /** True when the name matches the franchise's own Season 2026 roster. */
  lions: boolean;
}

export interface BoardEvent {
  id: string;
  /** "Am Green IGPL Invitational 2026" — the part before the " · ". */
  lead: string;
  /** "Al Hamra" — the part after it. Falls back to the whole name. */
  tail: string;
  fullName: string;
  leg: string | null;
  presentedBy: string | null;
  course: string | null;
  place: string;
  dates: string;
  day: string;
  mon: string;
  status: "UPCOMING" | "LIVE" | "COMPLETED" | "CANCELLED";
  rows: ScoreRow[];
}

const STATUS_LABEL: Record<BoardEvent["status"], string> = {
  LIVE: "Round in progress",
  UPCOMING: "Scheduled",
  COMPLETED: "Played",
  CANCELLED: "Cancelled",
};

/** What the board itself is doing, which is not the same as the event's state. */
function boardState(e: BoardEvent): { live: boolean; label: string } {
  if (e.status === "LIVE" && e.rows.length > 0)
    return { live: true, label: "Scoring live" };
  if (e.rows.length > 0) return { live: false, label: "Final card" };
  return { live: false, label: "Board unlit" };
}

const COLS = ["R1", "R2", "R3", "R4"] as const;

export default function ScoreExperience({ events }: { events: BoardEvent[] }) {
  const root = useRef<HTMLDivElement | null>(null);
  const [activeId, setActiveId] = useState<string>(events[0]?.id ?? "");

  const active = useMemo(
    () => events.find((e) => e.id === activeId) ?? events[0],
    [events, activeId]
  );

  // Re-run the board's own entrance whenever the event changes, so a
  // selection reads as the board being re-dressed rather than text swapping.
  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el || reduced()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      const head = rise("[data-tb-card] > *", { y: 16, stagger: 0.06 });
      if (head) tl.add(head, 0);
      const rows = rise("[data-tb-row]", { y: 14, stagger: 0.045 });
      if (rows) tl.add(rows, 0.18);
    }, el);
    return () => ctx.revert();
  }, [activeId]);

  const select = useCallback((id: string) => setActiveId(id), []);

  if (!active) return null;

  const state = boardState(active);
  const hasRows = active.rows.length > 0;

  return (
    <div ref={root}>
      {/* ---- The card: event identity, venue, dates, scoring status ---- */}
      <div className="tb-card" data-tb-card aria-live="polite">
        <p className="tb-card-top">
          <span className="tb-card-leg">{active.leg ?? `Season 2026`}</span>
          <span className={`ss-status ${state.live ? "is-live" : "is-upcoming"}`}>
            <span className="ss-dot" aria-hidden />
            {state.label}
          </span>
        </p>

        <h2 className="tb-card-title">
          <span className="tb-card-lead">{active.lead}</span>
          <span className="tb-card-tail">{active.tail}</span>
        </h2>

        <dl className="tb-rail">
          {active.course && (
            <div className="tb-rail-cell">
              <dt>Course</dt>
              <dd>{active.course}</dd>
            </div>
          )}
          <div className="tb-rail-cell">
            <dt>Location</dt>
            <dd>{active.place}</dd>
          </div>
          <div className="tb-rail-cell">
            <dt>Dates</dt>
            <dd>{active.dates}</dd>
          </div>
          <div className="tb-rail-cell">
            <dt>Event</dt>
            <dd>{STATUS_LABEL[active.status]}</dd>
          </div>
        </dl>

        {active.presentedBy && (
          <p className="tb-card-by">Presented by {active.presentedBy}</p>
        )}
      </div>

      {/* ---- The board: lit, or honestly unlit ---- */}
      {hasRows ? (
        <div className="tb-lb-wrap">
          {/* Roles are explicit because the mobile layout overrides
              `display` on the table, the rows and the cells — without
              them the table would stop being a table for screen readers
              at exactly the width where the data is hardest to read. */}
          <table className="tb-lb" role="table">
            {/* The event's full name is already the card's title directly
                above; repeating it here set 26/1000 em tracking wrapped to
                seven lines at 375px. The short form still identifies the
                table for a screen reader reaching it out of context. */}
            <caption className="tb-lb-cap">
              {active.tail} — verified round scores
            </caption>
            <thead role="rowgroup">
              <tr role="row">
                <th scope="col" role="columnheader">Pos</th>
                <th scope="col" role="columnheader">Player</th>
                {COLS.map((c) => (
                  <th scope="col" role="columnheader" key={c}>
                    {c}
                  </th>
                ))}
                <th scope="col" role="columnheader">Thru</th>
                <th scope="col" role="columnheader">Today</th>
                <th scope="col" role="columnheader">Total</th>
              </tr>
            </thead>
            <tbody role="rowgroup">
              {active.rows.map((r) => (
                <tr
                  key={r.id}
                  role="row"
                  data-tb-row
                  className={r.lions ? "is-lions" : undefined}
                >
                  <td className="tb-lb-pos" role="cell" data-l="Pos">
                    {r.position ?? "—"}
                  </td>
                  <th scope="row" role="rowheader" className="tb-lb-who" data-l="Player">
                    {r.playerName}
                  </th>
                  <td role="cell" data-l="R1">{r.r1 ?? "—"}</td>
                  <td role="cell" data-l="R2">{r.r2 ?? "—"}</td>
                  <td role="cell" data-l="R3">{r.r3 ?? "—"}</td>
                  <td role="cell" data-l="R4">{r.r4 ?? "—"}</td>
                  <td role="cell" data-l="Thru">{r.thru ?? "—"}</td>
                  <td className="tb-lb-today" role="cell" data-l="Today">
                    {r.today ?? "—"}
                  </td>
                  <td className="tb-lb-total" role="cell" data-l="Total">
                    {r.total ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="tb-unlit">
          <div className="tb-unlit-say" data-tb-row>
            <p className="tb-unlit-k">No verified rows</p>
            <p className="tb-unlit-t">
              {active.status === "COMPLETED"
                ? "This card has not been published yet."
                : "The board lights up when the first round tees off."}
            </p>
            <p className="tb-unlit-d">
              Only confirmed round scores are published here — no provisional
              leaderboards, no projected totals.
            </p>
          </div>

          {/* The columns this board will carry, named. An earlier version
              drew the header over six empty rules — "the board, unlit" —
              but stripped of context that reads as a table that failed to
              load, and it cost a screen of dead space to say nothing. This
              is the same device /leaderboards uses for its empty boards, so
              the two pages state absence the same way. */}
          <ul className="tb-await-cols" data-tb-row>
            {["Pos", "Player", "R1", "R2", "R3", "R4", "Thru", "Today", "Total"].map(
              (c) => (
                <li key={c}>{c}</li>
              )
            )}
          </ul>
        </div>
      )}

      {/* ---- The season's card index ---- */}
      <div className="tb-index-wrap">
        <p className="tb-index-label">
          The season card
          <span aria-hidden>{String(events.length).padStart(2, "0")}</span>
        </p>
        <ol className="tb-index">
          {events.map((e, i) => {
            const isActive = e.id === active.id;
            const st = boardState(e);
            return (
              <li key={e.id} className={isActive ? "is-active" : undefined}>
                <button
                  type="button"
                  onClick={() => select(e.id)}
                  aria-pressed={isActive}
                >
                  <span className="tb-index-n" aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="tb-index-date">
                    <span className="tb-index-day">{e.day}</span>
                    <span className="tb-index-mon">{e.mon}</span>
                  </span>
                  <span className="tb-index-body">
                    <span className="tb-index-name">{e.fullName}</span>
                    <span className="tb-index-venue">
                      {[e.course, e.place].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                  <span className="tb-index-state">
                    {st.live ? "Live" : e.rows.length > 0 ? "Card" : "Unlit"}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
