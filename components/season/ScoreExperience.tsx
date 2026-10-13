"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { gsap, registerGsap, reduced, rise } from "@/components/motion/gsap";
import s from "./ScoreExperience.module.css";

/**
 * The scoring desk — status filter and season programme on one side, the
 * selected tournament's masthead and leaderboard on the other.
 *
 * Every value is passed in pre-formatted by app/scores/page.tsx from real
 * Fixture and Score rows. Nothing provisional, projected or illustrative is
 * drawn: a board with no rows says so, a board whose rows could not be read
 * says that instead, and a missing cell stays "—".
 */

export interface ScoreRow {
  id: string;
  position: string | null;
  playerName: string;
  r1: string | null;
  r2: string | null;
  r3: string | null;
  /** Read from the stored row; the column is only drawn when a row has it. */
  r4: string | null;
  thru: string | null;
  score: string | null;
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
  /** Fixture start, ISO — used only to order events, never displayed. */
  startsAt: string;
  status: "UPCOMING" | "LIVE" | "COMPLETED" | "CANCELLED";
  rows: ScoreRow[];
  /** The Score read for this fixture failed; rows is empty for that reason. */
  unavailable?: boolean;
}

const STATUS_LABEL: Record<BoardEvent["status"], string> = {
  LIVE: "Round in progress",
  UPCOMING: "Scheduled",
  COMPLETED: "Played",
  CANCELLED: "Cancelled",
};

const EVENT_STATUSES = ["UPCOMING", "LIVE", "COMPLETED"] as const;
type EventStatus = (typeof EVENT_STATUSES)[number];

const EVENT_STATUS_LABEL: Record<EventStatus, string> = {
  UPCOMING: "Upcoming",
  LIVE: "Ongoing",
  COMPLETED: "Completed",
};

/**
 * Which event a status tab opens on. Live and upcoming open on the first
 * (soonest) event; completed opens on the most recent one that has a
 * published card, so the tab lands on a real board where one exists.
 */
function defaultEvent(events: BoardEvent[], status: EventStatus): BoardEvent | undefined {
  const inStatus = events.filter((e) => e.status === status);
  if (status !== "COMPLETED") return inStatus[0];
  const byRecent = [...inStatus].sort((a, b) => b.startsAt.localeCompare(a.startsAt));
  return byRecent.find((e) => e.rows.length > 0) ?? byRecent[0];
}

/**
 * Opening view: a round in play first; otherwise the latest published card;
 * otherwise what is next on the schedule.
 */
function initialStatus(events: BoardEvent[]): EventStatus {
  if (events.some((e) => e.status === "LIVE")) return "LIVE";
  if (events.some((e) => e.status === "COMPLETED" && e.rows.length > 0)) return "COMPLETED";
  if (events.some((e) => e.status === "UPCOMING")) return "UPCOMING";
  return "COMPLETED";
}

function eventState(e: BoardEvent): { key: "live" | "card" | "none"; label: string } {
  if (e.status === "LIVE" && e.rows.length > 0) return { key: "live", label: "Live" };
  if (e.rows.length > 0) return { key: "card", label: "Scorecard" };
  if (e.status === "UPCOMING") return { key: "none", label: "Scheduled" };
  return { key: "none", label: "No card" };
}

/**
 * Tone for a stored score string, or nothing.
 *
 * Only values that are unambiguously relative to par are toned: "E", or a
 * signed/unsigned integer small enough that it cannot be a stroke count
 * (a round or total in strokes is never under 30). Anything else — strokes,
 * "WD", free text — is left neutral. The string itself is never rewritten.
 */
function parTone(v: string | null): string | undefined {
  if (!v) return undefined;
  // Normalise a typographic minus (U+2212) for the test only.
  const t = v.trim().replace(/−/g, "-");
  if (/^e$/i.test(t)) return s.even;
  if (!/^[+-]?\d+$/.test(t)) return undefined;
  const n = Number(t);
  if (Math.abs(n) >= 30) return undefined;
  if (n < 0) return s.under;
  if (n > 0) return s.over;
  return s.even;
}

/** One stored value, printed as-is. `tone` is off for non-score columns (Thru). */
function Cell({
  value,
  className,
  tone = true,
}: {
  value: string | null;
  className?: string;
  tone?: boolean;
}) {
  if (value === null || value.trim() === "") {
    return (
      <td className={[className, s.missing].filter(Boolean).join(" ")}>
        <span aria-hidden>—</span>
        <span className={s.sr}>Not published</span>
      </td>
    );
  }
  return (
    <td className={[className, tone ? parTone(value) : undefined].filter(Boolean).join(" ") || undefined}>
      {value}
    </td>
  );
}

function State({ k, t, d, wide }: { k: string; t: string; d?: string; wide?: boolean }) {
  return (
    <div className={`${s.state} ${wide ? s.stateWide : ""}`} data-sx-row>
      <p className={s.stateK}>{k}</p>
      <p className={s.stateT}>{t}</p>
      {d && <p className={s.stateD}>{d}</p>}
    </div>
  );
}

export default function ScoreExperience({
  events,
  unavailable = false,
}: {
  events: BoardEvent[];
  /** The fixture list itself could not be read. */
  unavailable?: boolean;
}) {
  const root = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<EventStatus>(() => initialStatus(events));
  const [activeId, setActiveId] = useState<string>(
    () => defaultEvent(events, initialStatus(events))?.id ?? ""
  );

  const visibleEvents = useMemo(
    () => events.filter((e) => e.status === status),
    [events, status]
  );
  const active = useMemo(
    () => visibleEvents.find((e) => e.id === activeId) ?? visibleEvents[0],
    [visibleEvents, activeId]
  );

  // Re-dress the board whenever the selection changes.
  useEffect(() => {
    if (!active) return;
    registerGsap();
    const el = root.current;
    if (!el || reduced()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      const head = rise("[data-sx-head] > *", { y: 12, stagger: 0.05 });
      if (head) tl.add(head, 0);
      const rows = rise("[data-sx-row]", { y: 10, stagger: 0.035 });
      if (rows) tl.add(rows, 0.12);
    }, el);
    return () => ctx.revert();
  }, [active]);

  // Keep the selected event in view inside the horizontal rail (below
  // 1100px). Scrolls the rail only — never the page.
  const railRef = useRef<HTMLOListElement | null>(null);
  useEffect(() => {
    const rail = railRef.current;
    if (!rail || !active) return;
    const btn = rail.querySelector<HTMLElement>(`[data-event-id="${active.id}"]`);
    if (!btn || rail.scrollWidth <= rail.clientWidth) return;
    const delta = btn.getBoundingClientRect().left - rail.getBoundingClientRect().left;
    rail.scrollTo({
      left: Math.max(0, rail.scrollLeft + delta - 4),
      behavior: reduced() ? "auto" : "smooth",
    });
  }, [active, status]);

  function selectStatus(next: EventStatus) {
    setStatus(next);
    setActiveId(defaultEvent(events, next)?.id ?? "");
  }

  if (unavailable) {
    return (
      <Stage>
        <div className="hp-wrap">
          <State
            wide
            k="Scores unavailable"
            t="The scoring desk could not be reached just now."
            d="Nothing has been estimated in its place. Please try again shortly."
          />
        </div>
      </Stage>
    );
  }

  if (events.length === 0) {
    return (
      <Stage>
        <div className="hp-wrap">
          <State
            wide
            k="No events on the card"
            t="The Season 2026 calendar has not been published yet."
          />
        </div>
      </Stage>
    );
  }

  const hasR4 = Boolean(active?.rows.some((r) => r.r4 && r.r4.trim() !== ""));
  const rounds: Array<{ key: "r1" | "r2" | "r3" | "r4"; label: string }> = [
    { key: "r1", label: "R1" },
    { key: "r2", label: "R2" },
    { key: "r3", label: "R3" },
    ...(hasR4 ? [{ key: "r4" as const, label: "R4" }] : []),
  ];
  const lionsOnBoard = Boolean(active?.rows.some((r) => r.lions));
  const facts = active
    ? [
        active.course ? { k: "Course", v: active.course } : null,
        { k: "Location", v: active.place },
        { k: "Dates", v: active.dates },
        active.presentedBy ? { k: "Presented by", v: active.presentedBy } : null,
      ].filter((f): f is { k: string; v: string } => f !== null)
    : [];

  return (
    <Stage>
      <div className={`hp-wrap ${s.desk}`} ref={root}>
        {/* ---- Controls ---- */}
        <nav className={s.controls} aria-label="Choose a tournament">
          <p className={s.controlsLabel}>Season 2026 tournaments</p>
          <div className={s.tabs} role="group" aria-label="Filter tournaments by status">
            {EVENT_STATUSES.map((st) => {
              const count = events.filter((e) => e.status === st).length;
              return (
                <button
                  key={st}
                  type="button"
                  className={s.tab}
                  aria-pressed={status === st}
                  onClick={() => selectStatus(st)}
                >
                  <span>{EVENT_STATUS_LABEL[st]}</span>
                  <span className={s.tabCount}>{count}</span>
                </button>
              );
            })}
          </div>

          {visibleEvents.length > 0 && (
            <ol className={s.events} ref={railRef} aria-label={`${EVENT_STATUS_LABEL[status]} tournaments`}>
              {visibleEvents.map((e) => {
                const isActive = e.id === active?.id;
                const st = eventState(e);
                return (
                  <li key={e.id}>
                    <button
                      type="button"
                      className={s.event}
                      aria-pressed={isActive}
                      data-event-id={e.id}
                      onClick={() => setActiveId(e.id)}
                    >
                      <span className={s.eventDate}>
                        <span className={s.eventDay}>{e.day}</span>
                        <span className={s.eventMon}>{e.mon}</span>
                      </span>
                      <span className={s.eventBody}>
                        <span className={s.eventName}>{e.tail}</span>
                        <span className={s.eventVenue}>
                          {[e.course, e.place].filter(Boolean).join(" · ")}
                        </span>
                        <span className={s.eventState} data-state={st.key}>
                          {st.label}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
        </nav>

        {/* ---- Board ---- */}
        <div className={s.board}>
          {!active ? (
            <State
              wide
              k={`No ${EVENT_STATUS_LABEL[status].toLowerCase()} events`}
              t={
                status === "LIVE"
                  ? "No round is in play right now."
                  : "Nothing to show under this filter yet."
              }
              d="Tournament cards appear here as the league publishes them."
            />
          ) : (
            <>
              <header className={s.head} data-sx-head aria-live="polite">
                <div className={s.headTop}>
                  <p className={s.kicker}>
                    {[active.leg, active.lead].filter(Boolean).join(" · ") || "Tournament"}
                  </p>
                  <p className={s.status} data-live={active.status === "LIVE"}>
                    <span className={s.statusDot} aria-hidden />
                    {STATUS_LABEL[active.status]}
                  </p>
                </div>
                <h2 className={s.title}>{active.tail}</h2>
                <dl className={s.facts}>
                  {facts.map((f) => (
                    <div className={s.fact} key={f.k}>
                      <dt>{f.k}</dt>
                      <dd>{f.v}</dd>
                    </div>
                  ))}
                </dl>
              </header>

              {active.unavailable ? (
                <State
                  k="Scorecard unavailable"
                  t="This board could not be loaded just now."
                  d="Nothing has been estimated in its place. Please try again shortly."
                />
              ) : active.rows.length === 0 ? (
                <State
                  k="No scorecard yet"
                  t={
                    active.status === "COMPLETED"
                      ? "Final results have not been published."
                      : active.status === "LIVE"
                        ? "Live scores are not available yet."
                        : "Scores will appear when play begins."
                  }
                  d="Only verified round scores are published here — no provisional or projected figures."
                />
              ) : (
                <>
                  <div className={s.boardBar} aria-hidden>
                    <p className={s.boardLabel}>Leaderboard</p>
                    <p className={s.boardMeta}>
                      {lionsOnBoard && <span className={s.legend}>Vimtra Chennai Lions</span>}
                      <span>
                        {active.rows.length} {active.rows.length === 1 ? "player" : "players"}
                      </span>
                    </p>
                  </div>

                  <div
                    className={s.scroll}
                    tabIndex={0}
                    role="region"
                    aria-label={`${active.tail} leaderboard (scrolls sideways)`}
                  >
                    <table className={`${s.table} ${hasR4 ? s.hasR4 : ""}`}>
                      <caption className={s.sr}>
                        {active.tail} leaderboard, {active.rows.length}{" "}
                        {active.rows.length === 1 ? "player" : "players"}
                      </caption>
                      <colgroup>
                        <col className={s.colPos} />
                        <col />
                        <col className={s.colNum} />
                        {rounds.map((r) => (
                          <col key={r.key} className={s.colNum} />
                        ))}
                        <col className={s.colTotal} />
                      </colgroup>
                      <thead>
                        <tr>
                          <th scope="col">
                            <abbr title="Position">Pos</abbr>
                          </th>
                          <th scope="col">Player</th>
                          <th scope="col">
                            <abbr title="Holes completed">Thru</abbr>
                          </th>
                          {rounds.map((r) => (
                            <th scope="col" key={r.key}>
                              <abbr title={`Round ${r.label.slice(1)}`}>{r.label}</abbr>
                            </th>
                          ))}
                          <th scope="col" className={s.thTotal}>
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {active.rows.map((row) => (
                          <tr key={row.id} data-sx-row className={row.lions ? s.lions : undefined}>
                            <td className={s.pos}>
                              {row.position ?? (
                                <>
                                  <span aria-hidden>—</span>
                                  <span className={s.sr}>Not published</span>
                                </>
                              )}
                            </td>
                            <th scope="row" className={s.player}>
                              <span className={s.name}>{row.playerName}</span>
                              {row.lions && (
                                <span className={s.tag}>
                                  <span className={s.sr}>Vimtra Chennai </span>Lions
                                </span>
                              )}
                            </th>
                            <Cell value={row.thru} className={s.thru} tone={false} />
                            {rounds.map((r) => (
                              <Cell key={r.key} value={row[r.key]} />
                            ))}
                            <Cell value={row.score} className={s.total} />
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <p className={s.note}>
                    Scores are shown exactly as published to this site. “—” marks a value not yet
                    published.
                  </p>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </Stage>
  );
}

function Stage({ children }: { children: React.ReactNode }) {
  return (
    <section className={s.stage} aria-label="Tournament scoring">
      <div className={s.atmos} aria-hidden />
      {children}
    </section>
  );
}
