"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import type { MediaCoverage, MediaKind } from "@prisma/client";
import CoverImageField from "@/components/admin/CoverImageField";
import { PostPill } from "@/components/admin/ui/StatusPill";
import { adminToast } from "@/store/admin-toast";
import type { ActionResult } from "@/lib/admin-action-result";

/**
 * The one form behind Admin → News and Admin → Media.
 *
 * Both content types carry the same fields — headline, source, date,
 * external URL, description, cover, editorial status — and differ only in
 * WHICH kinds they may hold and how the labels read:
 *
 *   news   kind is OFFICIAL, always; the source is the desk that reported
 *          it (AM Green IGPL, the franchise itself); has "Feature on Home"
 *   media  kind is ARTICLE or SOCIAL, chosen; the source is the publisher
 *
 * The action is awaited directly so a validation failure keeps every typed
 * value on screen with the server's message inline. Which button was
 * pressed decides the status submitted (Publish / Save draft / Archive).
 */

function toDateInput(d: Date | null | undefined): string {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

const MEDIA_KIND_OPTIONS: { value: MediaKind; label: string }[] = [
  { value: "ARTICLE", label: "Article — third-party press" },
  { value: "SOCIAL", label: "Social — Instagram / social platform" },
];

export default function CoverageForm({
  mode,
  action,
  item,
}: {
  mode: "news" | "media";
  action: (formData: FormData) => Promise<ActionResult<{ id: string }>>;
  item?: MediaCoverage;
}) {
  const router = useRouter();
  const isNews = mode === "news";
  const listHref = isNews ? "/admin/news" : "/admin/media";
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const statusRef = useRef<string>(item?.status ?? "DRAFT");

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending || done) return;
    const form = e.currentTarget;
    if (!form.reportValidity()) return;
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const status = submitter?.value || statusRef.current;
    const fd = new FormData(form);
    fd.set("status", status);
    setError(null);
    start(async () => {
      try {
        const r = await action(fd);
        if (r.ok) {
          setDone(true);
          adminToast(r.message ?? "Saved.", "ok");
          router.push(listHref);
          router.refresh();
        } else {
          setError(r.error);
          // Bring the message into view — the form can be long.
          form.scrollIntoView({ block: "start", behavior: "smooth" });
        }
      } catch {
        setError("Could not reach the server. Nothing was saved.");
      }
    });
  };

  const busy = pending || done;

  return (
    <form onSubmit={onSubmit} className="adm-form">
      {item && <input type="hidden" name="id" value={item.id} />}
      {isNews && <input type="hidden" name="kind" value="OFFICIAL" />}

      {error && (
        <div className="adm-alert" data-tone="danger" role="alert">
          <AlertCircle />
          <span>{error}</span>
        </div>
      )}

      <fieldset className="adm-fieldset" disabled={busy}>
        <legend className="adm-fieldset-legend">{isNews ? "Story" : "Article"}</legend>

        {!isNews && (
          <div className="adm-row adm-row-main-side">
            <div className="adm-field">
              <label className="adm-label" htmlFor="cf-kind">
                Kind
              </label>
              <select id="cf-kind" name="kind" defaultValue={item?.kind === "SOCIAL" ? "SOCIAL" : "ARTICLE"}>
                {MEDIA_KIND_OPTIONS.map((k) => (
                  <option key={k.value} value={k.value}>
                    {k.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="adm-field">
          <label className="adm-label" htmlFor="cf-title">
            Headline
          </label>
          <input
            id="cf-title"
            name="title"
            required
            maxLength={200}
            defaultValue={item?.title}
            placeholder={isNews ? "Vimtra Chennai Lions GC unveils squad…" : "Headline exactly as the publisher ran it"}
          />
        </div>

        <div className="adm-row adm-row-main-side">
          <div className="adm-field">
            <label className="adm-label" htmlFor="cf-source">
              {isNews ? "Source" : "Publisher"}
            </label>
            <input
              id="cf-source"
              name="sourceName"
              required
              maxLength={80}
              defaultValue={item?.sourceName}
              placeholder={isNews ? "AM Green IGPL" : "The Hindu"}
            />
          </div>
          <div className="adm-field">
            <label className="adm-label" htmlFor="cf-date">
              Date <span className="adm-opt">optional</span>
            </label>
            <input id="cf-date" name="publishedAt" type="date" defaultValue={toDateInput(item?.publishedAt ?? null)} />
          </div>
        </div>

        <div className="adm-field">
          <label className="adm-label" htmlFor="cf-url">
            {isNews ? "External URL" : "Article URL"}
          </label>
          <input
            id="cf-url"
            name="sourceUrl"
            type="url"
            required
            inputMode="url"
            defaultValue={item?.sourceUrl}
            placeholder={isNews ? "https://theigpl.com/news/…" : "https://www.thehindu.com/…"}
          />
          <span className="adm-hint">Must be a full http(s) address. Readers are sent here — the site never hosts the article itself.</span>
        </div>

        <div className="adm-field">
          <label className="adm-label" htmlFor="cf-summary">
            Description
          </label>
          <textarea
            id="cf-summary"
            name="summary"
            required
            rows={4}
            maxLength={600}
            defaultValue={item?.summary}
            placeholder="A short, original description. Do not paste the article body."
          />
        </div>
      </fieldset>

      <fieldset className="adm-fieldset" disabled={busy}>
        <legend className="adm-fieldset-legend">Presentation</legend>
        <CoverImageField currentCover={item?.coverImage} idPrefix={`cf-${mode}`} disabled={busy} />

        <div className="adm-row adm-row-2">
          {isNews ? (
            <label className="adm-check">
              <input type="checkbox" name="featuredOnHome" value="1" defaultChecked={item?.featuredOnHome ?? false} />
              <span>
                <strong>Feature on Home</strong>
                <span>Shows in the home-page news section once published. The highest-sorted featured story is the one shown.</span>
              </span>
            </label>
          ) : (
            <div />
          )}
          <div className="adm-field">
            <label className="adm-label" htmlFor="cf-sort">
              Sort order <span className="adm-opt">higher appears first</span>
            </label>
            <input id="cf-sort" name="sortOrder" type="number" step="1" defaultValue={item?.sortOrder ?? 0} inputMode="numeric" />
          </div>
        </div>
      </fieldset>

      <div className="adm-form-actions">
        <button type="submit" name="status" value="PUBLISHED" className="adm-btn adm-btn-primary" disabled={busy}>
          {pending ? (
            <>
              <Loader2 className="adm-spin" /> Saving…
            </>
          ) : item?.status === "PUBLISHED" ? (
            "Save & keep published"
          ) : (
            "Publish"
          )}
        </button>
        <button type="submit" name="status" value="DRAFT" className="adm-btn" disabled={busy}>
          {item?.status === "DRAFT" ? "Save draft" : "Save as draft"}
        </button>
        {item && item.status !== "ARCHIVED" && (
          <button type="submit" name="status" value="ARCHIVED" className="adm-btn adm-btn-ghost" disabled={busy}>
            Archive
          </button>
        )}
        <span className="adm-spacer" />
        {item && (
          <span className="adm-inline" style={{ gap: 6 }}>
            <span className="adm-hint">Currently</span>
            <PostPill status={item.status} />
          </span>
        )}
        <button type="button" className="adm-btn adm-btn-ghost" onClick={() => router.push(listHref)} disabled={pending}>
          Cancel
        </button>
      </div>
    </form>
  );
}
