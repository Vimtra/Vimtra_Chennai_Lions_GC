"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Save } from "lucide-react";
import type { StandingBoard } from "@prisma/client";
import type { StandingRow } from "@/lib/standings";
import { saveStandingAction, deleteStandingAction } from "@/app/admin/leaderboards/actions";
import ConfirmDeleteButton from "@/components/admin/ConfirmDeleteButton";
import { adminToast } from "@/store/admin-toast";

export interface ExtraField {
  key: string;
  label: string;
  placeholder?: string;
}

/**
 * One rank row as an inline form. With `row` it edits in place (rank
 * changes move the row); without it, it creates a new rank.
 */
export default function StandingRowForm({
  board,
  seasonYear,
  extraFields,
  row,
}: {
  board: StandingBoard;
  seasonYear: number;
  extraFields: ExtraField[];
  row?: StandingRow;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<{ message: string; field?: string } | null>(null);
  const creating = !row;
  const uid = row?.id ?? `new-${board}`;

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending) return;
    const form = e.currentTarget;
    if (!form.reportValidity()) return;
    const fd = new FormData(form);
    setError(null);
    start(async () => {
      try {
        const r = await saveStandingAction(fd);
        if (r.ok) {
          adminToast(r.message ?? "Saved.", "ok");
          if (creating) form.reset();
          router.refresh();
        } else {
          setError({ message: r.error, field: r.field });
        }
      } catch {
        setError({ message: "Could not reach the server. Nothing was saved." });
      }
    });
  };

  const invalid = (name: string) => (error?.field === name ? true : undefined);

  return (
    <form onSubmit={onSubmit} className="adm-score-row" aria-label={creating ? "Add a rank row" : `Rank ${row.rank} · ${row.name}`}>
      {row && <input type="hidden" name="id" value={row.id} />}
      <input type="hidden" name="seasonYear" value={seasonYear} />
      <input type="hidden" name="board" value={board} />
      <fieldset className="adm-fieldset" disabled={pending} style={{ gap: 10 }}>
        <div className="adm-row adm-row-4">
          <div className="adm-field">
            <label className="adm-label" htmlFor={`${uid}-rank`}>
              Rank
            </label>
            <input id={`${uid}-rank`} name="rank" type="number" min={1} required defaultValue={row?.rank ?? ""} placeholder="1" inputMode="numeric" aria-invalid={invalid("rank")} />
          </div>
          <div className="adm-field" style={{ gridColumn: "span 2" }}>
            <label className="adm-label" htmlFor={`${uid}-name`}>
              {board === "TEAM" ? "Franchise" : "Player"}
            </label>
            <input id={`${uid}-name`} name="name" required maxLength={80} defaultValue={row?.name ?? ""} placeholder={board === "TEAM" ? "Vimtra Chennai Lions GC" : "Player name"} aria-invalid={invalid("name")} />
          </div>
          <div className="adm-field">
            <label className="adm-label" htmlFor={`${uid}-points`}>
              Points <span className="adm-opt">optional</span>
            </label>
            <input id={`${uid}-points`} name="points" type="number" defaultValue={row?.points ?? ""} placeholder="—" inputMode="numeric" />
          </div>
        </div>
        <div className="adm-row adm-row-4">
          {board !== "TEAM" && (
            <div className="adm-field" style={{ gridColumn: "span 2" }}>
              <label className="adm-label" htmlFor={`${uid}-team`}>
                Franchise <span className="adm-opt">optional</span>
              </label>
              <input id={`${uid}-team`} name="teamName" maxLength={80} defaultValue={row?.teamName ?? ""} placeholder="Vimtra Chennai Lions" />
            </div>
          )}
          {extraFields.map((f) => (
            <div key={f.key} className="adm-field">
              <label className="adm-label" htmlFor={`${uid}-${f.key}`}>
                {f.label}
              </label>
              <input id={`${uid}-${f.key}`} name={f.key} maxLength={40} defaultValue={(row?.extra[f.key] as string | undefined) ?? ""} placeholder={f.placeholder} />
            </div>
          ))}
        </div>
        {error && (
          <div className="adm-alert" data-tone="danger" role="alert">
            <span>{error.message}</span>
          </div>
        )}
        <div className="adm-actions">
          {row && (
            <ConfirmDeleteButton
              action={deleteStandingAction}
              id={row.id}
              label={`${row.rank}. ${row.name}`}
              description="Removes this rank from the public /leaderboards board. It cannot be undone."
              triggerLabel="Delete row"
              triggerClassName="adm-btn adm-btn-sm adm-btn-ghost adm-tone-danger"
            />
          )}
          <button type="submit" className={`adm-btn adm-btn-sm ${creating ? "adm-btn-primary" : ""}`} disabled={pending}>
            {pending ? <Loader2 className="adm-spin" /> : creating ? <Plus /> : <Save />}
            {creating ? "Add rank" : "Save row"}
          </button>
        </div>
      </fieldset>
    </form>
  );
}
