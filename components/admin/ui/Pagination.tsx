import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const PAGE_SIZE = 25;

/** Parse a `?page=` value into a 1-based page number. */
export function parsePage(raw: string | undefined): number {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

/**
 * Server-rendered pager. Shows "n–m of total" and previous/next links that
 * preserve every other query param.
 */
export default function Pagination({
  action,
  page,
  total,
  pageSize = PAGE_SIZE,
  params = {},
}: {
  action: string;
  page: number;
  total: number;
  pageSize?: number;
  params?: Record<string, string | undefined>;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `${action}?${qs}` : action;
  };
  return (
    <div className="adm-panel-foot">
      <span>
        {total === 0 ? "No rows" : `${from}–${to} of ${total}`}
      </span>
      {pages > 1 && (
        <nav className="adm-pager" aria-label="Pagination">
          {page > 1 ? (
            <Link href={href(page - 1)} className="adm-btn adm-btn-sm adm-btn-icon" aria-label="Previous page">
              <ChevronLeft />
            </Link>
          ) : (
            <span className="adm-btn adm-btn-sm adm-btn-icon" aria-disabled="true">
              <ChevronLeft />
            </span>
          )}
          <span>
            Page {page} of {pages}
          </span>
          {page < pages ? (
            <Link href={href(page + 1)} className="adm-btn adm-btn-sm adm-btn-icon" aria-label="Next page">
              <ChevronRight />
            </Link>
          ) : (
            <span className="adm-btn adm-btn-sm adm-btn-icon" aria-disabled="true">
              <ChevronRight />
            </span>
          )}
        </nav>
      )}
    </div>
  );
}
