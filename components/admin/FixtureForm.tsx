"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import type { Fixture, FixtureStatus } from "@prisma/client";
import type { FixtureActionResult } from "@/app/admin/fixtures/actions";
import { adminToast } from "@/store/admin-toast";

const STATUS_OPTIONS: { value: FixtureStatus; label: string }[] = [
  { value: "UPCOMING", label: "Upcoming" },
  { value: "LIVE", label: "Live — in play now" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

function toDateInput(d: Date | null | undefined): string {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

/**
 * Add / edit fixture. Inputs are hardened on the server (parseInput in
 * actions.ts); the form keeps every value on a failed save and shows the
 * server's message next to the field it names.
 */
export default function FixtureForm({
  action,
  fixture,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<FixtureActionResult>;
  fixture?: Fixture;
  submitLabel: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<{ message: string; field?: string } | null>(null);
  const [done, setDone] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending || done) return;
    const form = e.currentTarget;
    if (!form.reportValidity()) return;
    const fd = new FormData(form);
    setError(null);
    start(async () => {
      try {
        const r = await action(fd);
        if (r.ok) {
          setDone(true);
          adminToast(r.message ?? "Saved.", "ok");
          router.push("/admin/fixtures");
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
  const busy = pending || done;

  return (
    <form onSubmit={onSubmit} className="adm-form">
      {fixture && <input type="hidden" name="id" value={fixture.id} />}

      {error && (
        <div className="adm-alert" data-tone="danger" role="alert">
          <AlertCircle />
          <span>{error.message}</span>
        </div>
      )}

      <fieldset className="adm-fieldset" disabled={busy}>
        <legend className="adm-fieldset-legend">Event</legend>
        <div className="adm-row adm-row-2">
          <div className="adm-field">
            <label className="adm-label" htmlFor="fx-name">
              Fixture name
            </label>
            <input id="fx-name" name="name" required maxLength={140} defaultValue={fixture?.name} placeholder="AM Green IGPL Invitational · Al Hamra" aria-invalid={invalid("name")} />
          </div>
          <div className="adm-field">
            <label className="adm-label" htmlFor="fx-slug">
              Slug <span className="adm-opt">optional — derived from the name</span>
            </label>
            <input id="fx-slug" name="slug" defaultValue={fixture?.slug} placeholder="am-green-igpl-al-hamra-2026" />
          </div>
        </div>

        <div className="adm-row adm-row-3">
          <div className="adm-field">
            <label className="adm-label" htmlFor="fx-start">
              Start date
            </label>
            <input id="fx-start" name="dateStart" type="date" required defaultValue={toDateInput(fixture?.dateStart ?? null)} aria-invalid={invalid("dateStart")} />
          </div>
          <div className="adm-field">
            <label className="adm-label" htmlFor="fx-end">
              End date <span className="adm-opt">optional</span>
            </label>
            <input id="fx-end" name="dateEnd" type="date" defaultValue={toDateInput(fixture?.dateEnd ?? null)} aria-invalid={invalid("dateEnd")} />
          </div>
          <div className="adm-field">
            <label className="adm-label" htmlFor="fx-status">
              Status
            </label>
            <select id="fx-status" name="status" defaultValue={fixture?.status ?? "UPCOMING"}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <span className="adm-hint">Live fixtures lead the home page and the scores desk.</span>
          </div>
        </div>
      </fieldset>

      <fieldset className="adm-fieldset" disabled={busy}>
        <legend className="adm-fieldset-legend">Venue</legend>
        <div className="adm-row adm-row-3">
          <div className="adm-field">
            <label className="adm-label" htmlFor="fx-city">
              City
            </label>
            <input id="fx-city" name="city" required defaultValue={fixture?.city} placeholder="Ras Al Khaimah" aria-invalid={invalid("city")} />
          </div>
          <div className="adm-field">
            <label className="adm-label" htmlFor="fx-country">
              Country
            </label>
            <input id="fx-country" name="country" required defaultValue={fixture?.country} placeholder="UAE" aria-invalid={invalid("country")} />
          </div>
          <div className="adm-field">
            <label className="adm-label" htmlFor="fx-course">
              Course <span className="adm-opt">optional</span>
            </label>
            <input id="fx-course" name="courseName" defaultValue={fixture?.courseName ?? ""} placeholder="Al Hamra Golf Club" />
          </div>
        </div>
      </fieldset>

      <fieldset className="adm-fieldset" disabled={busy}>
        <legend className="adm-fieldset-legend">Presentation</legend>
        <div className="adm-row adm-row-2">
          <div className="adm-field">
            <label className="adm-label" htmlFor="fx-leg">
              Leg / label <span className="adm-opt">optional</span>
            </label>
            <input id="fx-leg" name="leg" defaultValue={fixture?.leg ?? ""} placeholder="African Swing · Fourth Stop" />
          </div>
          <div className="adm-field">
            <label className="adm-label" htmlFor="fx-presented">
              Presented by <span className="adm-opt">optional</span>
            </label>
            <input id="fx-presented" name="presentedBy" defaultValue={fixture?.presentedBy ?? ""} placeholder="Vimtra Chennai Lions GC" />
          </div>
        </div>
        <div className="adm-row adm-row-main-side">
          <div className="adm-field">
            <label className="adm-label" htmlFor="fx-note">
              Note <span className="adm-opt">small line under the fixture</span>
            </label>
            <input id="fx-note" name="note" defaultValue={fixture?.note ?? ""} placeholder="Hosted by …" />
          </div>
          <div className="adm-field">
            <label className="adm-label" htmlFor="fx-sort">
              Sort order
            </label>
            <input id="fx-sort" name="sortOrder" type="number" step="1" defaultValue={fixture?.sortOrder ?? 0} inputMode="numeric" />
          </div>
        </div>
      </fieldset>

      <div className="adm-form-actions">
        <button type="submit" className="adm-btn adm-btn-primary" disabled={busy}>
          {pending ? (
            <>
              <Loader2 className="adm-spin" /> Saving…
            </>
          ) : (
            submitLabel
          )}
        </button>
        <button type="button" className="adm-btn" onClick={() => router.push("/admin/fixtures")} disabled={pending}>
          Cancel
        </button>
      </div>
    </form>
  );
}
