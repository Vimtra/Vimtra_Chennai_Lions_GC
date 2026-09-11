"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Save } from "lucide-react";
import type { Score } from "@prisma/client";
import { createScoreAction, updateScoreAction, deleteScoreAction } from "@/app/admin/scores/actions";
import ConfirmDeleteButton from "@/components/admin/ConfirmDeleteButton";
import { adminToast } from "@/store/admin-toast";

/**
 * One leaderboard row as an inline form — either an existing Score (save /
 * delete) or the "add a row" form at the foot of the board. The whole grid
 * is submitted at once so a round's numbers land together.
 */
export default function ScoreRowForm({
  fixtureId,
  score,
}: {
  fixtureId: string;
  score?: Score;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const creating = !score;
  const uid = score?.id ?? "new";

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending) return;
    const form = e.currentTarget;
    if (!form.reportValidity()) return;
    const fd = new FormData(form);
    setError(null);
    start(async () => {
      try {
        const r = creating ? await createScoreAction(fd) : await updateScoreAction(fd);
        if (r.ok) {
          adminToast(r.message ?? "Saved.", "ok");
          if (creating) form.reset();
          router.refresh();
        } else {
          setError(r.error);
        }
      } catch {
        setError("Could not reach the server. Nothing was saved.");
      }
    });
  };

  const cell = (name: string, label: string, extra?: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div className="adm-field">
      <label className="adm-label" htmlFor={`${uid}-${name}`}>
        {label}
      </label>
      <input id={`${uid}-${name}`} name={name} defaultValue={(score?.[name as keyof Score] as string | null | undefined) ?? ""} maxLength={12} {...extra} />
    </div>
  );

  return (
    <form onSubmit={onSubmit} className="adm-score-row" aria-label={creating ? "Add a score row" : `Score row for ${score.playerName}`}>
      {score ? <input type="hidden" name="id" value={score.id} /> : <input type="hidden" name="fixtureId" value={fixtureId} />}
      <fieldset className="adm-fieldset" disabled={pending} style={{ gap: 8 }}>
        <div className="adm-score-grid">
          {cell("position", "Pos", { placeholder: "T2" })}
          <div className="adm-field" style={{ gridColumn: "span 1" }}>
            <label className="adm-label" htmlFor={`${uid}-playerName`}>
              Player
            </label>
            <input id={`${uid}-playerName`} name="playerName" required maxLength={80} defaultValue={score?.playerName ?? ""} placeholder="Player name" style={{ fontWeight: 600 }} />
          </div>
          <div className="adm-field">
            <label className="adm-label" htmlFor={`${uid}-round`}>
              Rnd
            </label>
            <input id={`${uid}-round`} name="round" type="number" min={1} max={10} defaultValue={score?.round ?? 1} inputMode="numeric" />
          </div>
          {cell("r1", "R1")}
          {cell("r2", "R2")}
          {cell("r3", "R3")}
          {cell("r4", "R4")}
          {cell("thru", "Thru")}
          {cell("today", "Today")}
          {cell("total", "Total")}
        </div>
        {error && (
          <div className="adm-alert" data-tone="danger" role="alert">
            <span>{error}</span>
          </div>
        )}
        <div className="adm-actions">
          {score && (
            <ConfirmDeleteButton
              action={deleteScoreAction}
              id={score.id}
              label={score.playerName}
              meta={`Round ${score.round}${score.position ? ` · ${score.position}` : ""}`}
              description="Removes this row from the public /scores leaderboard. It cannot be undone."
              triggerLabel="Delete row"
              triggerClassName="adm-btn adm-btn-sm adm-btn-ghost adm-tone-danger"
            />
          )}
          <button type="submit" className={`adm-btn adm-btn-sm ${creating ? "adm-btn-primary" : ""}`} disabled={pending}>
            {pending ? <Loader2 className="adm-spin" /> : creating ? <Plus /> : <Save />}
            {creating ? "Add row" : "Save row"}
          </button>
        </div>
      </fieldset>
    </form>
  );
}
