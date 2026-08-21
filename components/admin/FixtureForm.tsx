import Link from "next/link";
import type { Fixture, FixtureStatus } from "@prisma/client";

// The form is a pure server component — inputs are hardened on the Server
// Action side (parseInput in actions.ts) so we don't need any client state.

const STATUS_OPTIONS: FixtureStatus[] = [
  "UPCOMING",
  "LIVE",
  "COMPLETED",
  "CANCELLED",
];

function toDateInput(d: Date | null | undefined): string {
  if (!d) return "";
  const dt = new Date(d);
  return dt.toISOString().slice(0, 10);
}

export default function FixtureForm({
  action,
  fixture,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  fixture?: Fixture;
  submitLabel: string;
}) {
  return (
    <form action={action} className="grid gap-4">
      {fixture && <input type="hidden" name="id" value={fixture.id} />}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="field">
          <label>Fixture name</label>
          <input
            name="name"
            required
            defaultValue={fixture?.name}
            placeholder="Am Green IGPL Invitational · Al Hamra"
          />
        </div>
        <div className="field">
          <label>Slug (optional — auto-derived from name)</label>
          <input
            name="slug"
            defaultValue={fixture?.slug}
            placeholder="am-green-igpl-al-hamra-2026"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="field">
          <label>Date start</label>
          <input
            name="dateStart"
            type="date"
            required
            defaultValue={toDateInput(fixture?.dateStart ?? null)}
          />
        </div>
        <div className="field">
          <label>Date end (optional)</label>
          <input
            name="dateEnd"
            type="date"
            defaultValue={toDateInput(fixture?.dateEnd ?? null)}
          />
        </div>
        <div className="field">
          <label>Status</label>
          <select name="status" defaultValue={fixture?.status ?? "UPCOMING"}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="field">
          <label>City</label>
          <input
            name="city"
            required
            defaultValue={fixture?.city}
            placeholder="Ras Al Khaimah"
          />
        </div>
        <div className="field">
          <label>Country</label>
          <input
            name="country"
            required
            defaultValue={fixture?.country}
            placeholder="UAE"
          />
        </div>
        <div className="field">
          <label>Course name (optional)</label>
          <input
            name="courseName"
            defaultValue={fixture?.courseName ?? ""}
            placeholder="Al Hamra Golf Club"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="field">
          <label>Leg / label (optional)</label>
          <input
            name="leg"
            defaultValue={fixture?.leg ?? ""}
            placeholder="African Swing · Fourth Stop"
          />
        </div>
        <div className="field">
          <label>Presented by (optional)</label>
          <input
            name="presentedBy"
            defaultValue={fixture?.presentedBy ?? ""}
            placeholder="Vimtra Chennai Lions GC"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-4">
        <div className="field">
          <label>Note (small line under the fixture)</label>
          <input
            name="note"
            defaultValue={fixture?.note ?? ""}
            placeholder="Hosted by Leander Paes"
          />
        </div>
        <div className="field">
          <label>Sort order</label>
          <input
            name="sortOrder"
            type="number"
            step="1"
            defaultValue={fixture?.sortOrder ?? 0}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" className="btn-dark press">
          {submitLabel}
        </button>
        <Link href="/admin/fixtures" className="btn-ghost">
          Cancel
        </Link>
      </div>
    </form>
  );
}
