import Link from "next/link";
import { Pencil, ExternalLink, Send, Archive, Undo2, FileEdit, Home, Newspaper } from "lucide-react";
import type { MediaCoverage } from "@prisma/client";
import { formatCoverageDate } from "@/lib/media-coverage-format";
import { webSrc } from "@/lib/image-src";
import type { ActionResult } from "@/lib/admin-action-result";
import { PostPill, KindPill, StatusPill } from "@/components/admin/ui/StatusPill";
import QuickActionButton from "@/components/admin/ui/QuickActionButton";
import ConfirmDeleteButton from "@/components/admin/ConfirmDeleteButton";
import EmptyState from "@/components/admin/ui/EmptyState";

type RowAction = (formData: FormData) => Promise<ActionResult>;

/**
 * The list behind Admin → News and Admin → Media. Same table, same
 * controls; `mode` changes labels, the edit route, and (news only) the
 * Feature-on-Home column.
 *
 * Status transitions are reversible so they are one click; delete is not,
 * so it goes through the confirmation dialog.
 */
export default function CoverageTable({
  items,
  mode,
  setStatusAction,
  deleteAction,
  setFeaturedAction,
  filtered,
}: {
  items: MediaCoverage[];
  mode: "news" | "media";
  setStatusAction: RowAction;
  deleteAction: RowAction;
  setFeaturedAction?: RowAction;
  /** True when a filter is applied, so the empty state reads correctly. */
  filtered?: boolean;
}) {
  const editBase = mode === "news" ? "/admin/news" : "/admin/media";
  const noun = mode === "news" ? "official news" : "media coverage";

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Newspaper />}
        title={filtered ? `No ${noun} matches` : `No ${noun} yet`}
        body={
          filtered
            ? "Try another status filter."
            : mode === "news"
              ? "File the league's and the franchise's own reporting here. Published items appear under Official News on /news."
              : "File third-party press and social posts here. Published items appear under Media Coverage on /news."
        }
        actions={
          <Link href={`${editBase}/new`} className="adm-btn adm-btn-sm adm-btn-primary">
            {mode === "news" ? "Add official news" : "Add media article"}
          </Link>
        }
      />
    );
  }

  return (
    <div className="adm-table-wrap">
      <table className="adm-table is-responsive">
        <thead>
          <tr>
            <th>Item</th>
            {mode === "media" && <th>Kind</th>}
            <th>{mode === "news" ? "Source" : "Publisher"}</th>
            <th>Date</th>
            <th>Status</th>
            {mode === "news" && <th>Home</th>}
            <th className="adm-td-actions">
              <span className="adm-sr">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((m) => {
            const cover = webSrc(m.coverImage);
            return (
              <tr key={m.id} className={m.status === "ARCHIVED" ? "is-dim" : undefined}>
                <td className="adm-td-primary">
                  <div className="adm-cell-media" style={{ alignItems: "flex-start" }}>
                    {cover ? (
                      <span className="adm-thumb is-wide">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={cover} alt="" />
                      </span>
                    ) : (
                      <span className="adm-thumb-mono" aria-hidden>
                        {m.sourceName
                          .split(/\s+/)
                          .slice(0, 3)
                          .map((w) => w[0])
                          .join("")
                          .toUpperCase()}
                      </span>
                    )}
                    <div>
                      <Link href={`${editBase}/${m.id}/edit`} className="adm-cell-title" style={{ textDecoration: "none", display: "block" }}>
                        {m.title}
                      </Link>
                      <div className="adm-cell-sub" style={{ maxWidth: 520, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {m.summary}
                      </div>
                    </div>
                  </div>
                </td>
                {mode === "media" && (
                  <td data-label="Kind">
                    <KindPill kind={m.kind} />
                  </td>
                )}
                <td data-label={mode === "news" ? "Source" : "Publisher"}>
                  <div style={{ fontWeight: 600 }}>{m.sourceName}</div>
                  <a href={m.sourceUrl} target="_blank" rel="noreferrer noopener" className="adm-link" style={{ fontSize: 12, display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <ExternalLink style={{ width: 12, height: 12 }} /> open
                  </a>
                </td>
                <td data-label="Date" className="adm-td-muted adm-td-nowrap">
                  {m.publishedAt ? formatCoverageDate(m.publishedAt) : "—"}
                </td>
                <td data-label="Status">
                  <PostPill status={m.status} />
                </td>
                {mode === "news" && (
                  <td data-label="Home">
                    {setFeaturedAction ? (
                      <QuickActionButton
                        action={setFeaturedAction}
                        fields={{ id: m.id, featured: m.featuredOnHome ? "0" : "1" }}
                        className={`adm-btn adm-btn-sm ${m.featuredOnHome ? "" : "adm-btn-ghost"}`}
                        title={m.featuredOnHome ? "Remove from home page" : "Feature on home page"}
                      >
                        <Home /> {m.featuredOnHome ? "Featured" : "Feature"}
                      </QuickActionButton>
                    ) : m.featuredOnHome ? (
                      <StatusPill tone="gold" dotless>
                        featured
                      </StatusPill>
                    ) : (
                      <span className="adm-tone-muted">—</span>
                    )}
                  </td>
                )}
                <td className="adm-td-actions">
                  <div className="adm-actions">
                    <Link href={`${editBase}/${m.id}/edit`} className="adm-btn adm-btn-sm">
                      <Pencil /> Edit
                    </Link>
                    {m.status === "DRAFT" && (
                      <QuickActionButton action={setStatusAction} fields={{ id: m.id, status: "PUBLISHED" }} className="adm-btn adm-btn-sm adm-btn-primary" title="Publish">
                        <Send /> Publish
                      </QuickActionButton>
                    )}
                    {m.status === "PUBLISHED" && (
                      <>
                        <QuickActionButton action={setStatusAction} fields={{ id: m.id, status: "DRAFT" }} className="adm-btn adm-btn-sm adm-btn-ghost" title="Unpublish to draft">
                          <FileEdit /> Unpublish
                        </QuickActionButton>
                        <QuickActionButton action={setStatusAction} fields={{ id: m.id, status: "ARCHIVED" }} className="adm-btn adm-btn-sm adm-btn-ghost" title="Archive">
                          <Archive /> Archive
                        </QuickActionButton>
                      </>
                    )}
                    {m.status === "ARCHIVED" && (
                      <QuickActionButton action={setStatusAction} fields={{ id: m.id, status: "DRAFT" }} className="adm-btn adm-btn-sm adm-btn-ghost" title="Restore to draft">
                        <Undo2 /> Restore
                      </QuickActionButton>
                    )}
                    <ConfirmDeleteButton
                      action={deleteAction}
                      id={m.id}
                      label={m.title}
                      meta={m.sourceName}
                      description={`Permanently removes this ${mode === "news" ? "news item" : "article"} from the admin and from /news. Archiving keeps it on file instead.`}
                      triggerClassName="adm-btn adm-btn-sm adm-btn-ghost adm-tone-danger"
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
