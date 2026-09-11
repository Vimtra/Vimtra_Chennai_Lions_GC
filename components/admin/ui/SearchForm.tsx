import Link from "next/link";
import { Search, X } from "lucide-react";

/**
 * Server-rendered GET search box. Submitting sets `?q=` (and resets the
 * page) while preserving any other filter params passed in `keep`. No
 * client JS needed; the list re-renders on the server with the query.
 */
export default function SearchForm({
  action,
  q,
  placeholder = "Search…",
  keep = {},
  name = "q",
}: {
  action: string;
  q?: string;
  placeholder?: string;
  keep?: Record<string, string | undefined>;
  name?: string;
}) {
  const clearParams = new URLSearchParams();
  for (const [k, v] of Object.entries(keep)) if (v) clearParams.set(k, v);
  const clearHref = clearParams.toString() ? `${action}?${clearParams}` : action;
  return (
    <form action={action} method="get" className="adm-search" role="search">
      {Object.entries(keep).map(([k, v]) => (v ? <input key={k} type="hidden" name={k} value={v} /> : null))}
      <Search />
      <input
        type="search"
        name={name}
        defaultValue={q ?? ""}
        placeholder={placeholder}
        aria-label={placeholder}
        autoComplete="off"
      />
      {q ? (
        <Link href={clearHref} className="adm-search-clear" aria-label="Clear search">
          <X />
        </Link>
      ) : null}
    </form>
  );
}
