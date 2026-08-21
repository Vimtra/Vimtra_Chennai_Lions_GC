import Link from "next/link";
import type { MediaCoverage, MediaKind } from "@prisma/client";

function toDateInput(d: Date | null | undefined): string {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

const KIND_OPTIONS: { value: MediaKind; label: string }[] = [
  { value: "ARTICLE", label: "Article — third-party press" },
  { value: "SOCIAL", label: "Social — Instagram / social platform" },
];

export default function MediaCoverageForm({
  action,
  item,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  item?: MediaCoverage;
  submitLabel: string;
}) {
  return (
    <form action={action} className="grid gap-4">
      {item && <input type="hidden" name="id" value={item.id} />}
      <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-4">
        <div className="field">
          <label>Kind</label>
          <select name="kind" defaultValue={item?.kind ?? "ARTICLE"}>
            {KIND_OPTIONS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>
            Source name (e.g. &ldquo;The Hindu&rdquo; for articles,
            &ldquo;Instagram&rdquo; for social)
          </label>
          <input
            name="sourceName"
            required
            defaultValue={item?.sourceName}
            placeholder="Instagram"
          />
        </div>
      </div>

      <div className="field">
        <label>Source URL (external article or social post)</label>
        <input
          name="sourceUrl"
          type="url"
          required
          defaultValue={item?.sourceUrl}
          placeholder="https://www.instagram.com/p/..."
        />
      </div>
      <div className="field">
        <label>Article title (as published by the source)</label>
        <input
          name="title"
          required
          defaultValue={item?.title}
          placeholder="Important to perform well in multi-sport events: Bhullar"
        />
      </div>
      <div className="field">
        <label>Our short original summary (1–3 sentences)</label>
        <textarea
          name="summary"
          required
          rows={4}
          defaultValue={item?.summary}
          placeholder="A brief, original attribution. Do not paste the article body."
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="field">
          <label>Published date (optional)</label>
          <input
            name="publishedAt"
            type="date"
            defaultValue={toDateInput(item?.publishedAt ?? null)}
          />
        </div>
        <div className="field">
          <label>Cover image path (optional)</label>
          <input
            name="coverImage"
            defaultValue={item?.coverImage ?? ""}
            placeholder="/media/clipping.jpg"
          />
        </div>
        <div className="field">
          <label>Sort order (higher = earlier)</label>
          <input
            name="sortOrder"
            type="number"
            defaultValue={item?.sortOrder ?? 0}
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <label className="inline-flex items-center gap-2 font-manrope text-[13.5px] text-ink">
          <input
            type="checkbox"
            name="active"
            defaultChecked={item ? item.active : true}
            className="!m-0 !w-4 !h-4"
          />
          Show on the public /news page
        </label>
      </div>
      <div className="flex gap-3">
        <button type="submit" className="btn-dark press">
          {submitLabel}
        </button>
        <Link href="/admin/media" className="btn-ghost">
          Cancel
        </Link>
      </div>
    </form>
  );
}
