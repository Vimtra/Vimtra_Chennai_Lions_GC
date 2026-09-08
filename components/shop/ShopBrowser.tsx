"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import ShopProductCard from "@/components/shop/ShopProductCard";
import type { Product } from "@/lib/products";

/**
 * Catalogue discovery + grid.
 *
 * All filtering is client-side over the rows the server already sent, so
 * search and sort resolve instantly and no new endpoint, query or database
 * column exists because of this page.
 *
 * WHAT THE CONTROLS ARE ALLOWED TO OFFER is decided by the data, not by a
 * design: the category rail is built from the distinct `cat` values present
 * in the rows (with real counts), and it renders only when the catalogue
 * actually has more than one. The sort list carries only orders the product
 * row can answer — catalogue order, name, price — because `Product` has no
 * rating, no popularity and no published-at field to sort by. Nothing here
 * fabricates a facet.
 *
 * "Catalogue order" is the order the database returns (createdAt asc), which
 * is the order the franchise entered its own products in. It is not called
 * "featured": no source designates a featured product.
 */

type SortKey = "catalogue" | "name-asc" | "price-asc" | "price-desc";

const SORTS: { k: SortKey; label: string }[] = [
  { k: "catalogue", label: "Catalogue order" },
  { k: "name-asc", label: "Name · A–Z" },
  { k: "price-asc", label: "Price · Low to high" },
  { k: "price-desc", label: "Price · High to low" },
];

const ALL = "__all__";

export default function ShopBrowser({ products }: { products: Product[] }) {
  const uid = useId();
  const searchId = `${uid}-search`;
  const sortId = `${uid}-sort`;

  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>(ALL);
  const [sort, setSort] = useState<SortKey>("catalogue");

  /** Distinct categories, in catalogue order, with their real counts. */
  const categories = useMemo(() => {
    const seen = new Map<string, number>();
    for (const p of products) {
      const c = (p.cat ?? "").trim();
      if (!c) continue;
      seen.set(c, (seen.get(c) ?? 0) + 1);
    }
    return Array.from(seen, ([name, count]) => ({ name, count }));
  }, [products]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = products;

    if (cat !== ALL) rows = rows.filter((p) => p.cat === cat);

    if (q) {
      rows = rows.filter((p) =>
        [p.name, p.cat, p.desc].some((f) =>
          (f ?? "").toLowerCase().includes(q)
        )
      );
    }

    if (sort === "catalogue") return rows;
    const out = [...rows];
    if (sort === "name-asc") {
      out.sort((a, b) => a.name.localeCompare(b.name, "en"));
    } else if (sort === "price-asc") {
      out.sort((a, b) => a.price - b.price);
    } else {
      out.sort((a, b) => b.price - a.price);
    }
    return out;
  }, [products, query, cat, sort]);

  const filtered = query.trim() !== "" || cat !== ALL || sort !== "catalogue";

  const reset = () => {
    setQuery("");
    setCat(ALL);
    setSort("catalogue");
  };

  return (
    <div className="sp-browse">
      {/* ---- Discovery rail ---- */}
      <div className="sp-bar">
        <div className="sp-bar-row">
          <div className="sp-field sp-field-search">
            <label className="sp-field-k" htmlFor={searchId}>
              Search
            </label>
            <div className="sp-input">
              <Search className="sp-input-ico" size={15} aria-hidden />
              <input
                id={searchId}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Product name, collection or material"
                autoComplete="off"
                className="sp-input-el"
              />
              {query !== "" && (
                <button
                  type="button"
                  className="sp-input-clear"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                >
                  <X size={14} aria-hidden />
                </button>
              )}
            </div>
          </div>

          <div className="sp-field sp-field-sort">
            <label className="sp-field-k" htmlFor={sortId}>
              Sort
            </label>
            <div className="sp-input sp-input-select">
              <select
                id={sortId}
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="sp-select-el"
              >
                {SORTS.map((s) => (
                  <option key={s.k} value={s.k}>
                    {s.label}
                  </option>
                ))}
              </select>
              <span className="sp-select-caret" aria-hidden />
            </div>
          </div>
        </div>

        {categories.length > 1 && (
          <div
            className="sp-cats"
            role="group"
            aria-label="Filter products by collection"
          >
            <button
              type="button"
              className={`sp-cat${cat === ALL ? " is-on" : ""}`}
              aria-pressed={cat === ALL}
              onClick={() => setCat(ALL)}
            >
              All
              <span className="sp-cat-n">{products.length}</span>
            </button>
            {categories.map((c) => (
              <button
                key={c.name}
                type="button"
                className={`sp-cat${cat === c.name ? " is-on" : ""}`}
                aria-pressed={cat === c.name}
                onClick={() => setCat(c.name)}
              >
                {c.name}
                <span className="sp-cat-n">{c.count}</span>
              </button>
            ))}
          </div>
        )}

        <div className="sp-bar-foot">
          <p className="sp-count" aria-live="polite">
            <span className="sp-count-n">{visible.length}</span>
            <span className="sp-count-l">
              {visible.length === 1 ? "product" : "products"}
              {filtered && products.length !== visible.length
                ? ` of ${products.length}`
                : ""}
            </span>
          </p>
          {filtered && (
            <button type="button" className="sp-reset" onClick={reset}>
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ---- Grid ---- */}
      {visible.length > 0 ? (
        <div className="sp-grid">
          {visible.map((p) => (
            <ShopProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="sp-empty">
          <p className="sp-empty-k">No match</p>
          <h3 className="sp-empty-t">
            Nothing in the store answers to that.
          </h3>
          <p className="sp-empty-b">
            {query.trim() !== "" ? (
              <>
                No product matches <strong>&ldquo;{query.trim()}&rdquo;</strong>
                {cat !== ALL ? <> in {cat}</> : null}. Clear the filters to see
                the full catalogue again.
              </>
            ) : (
              <>
                No product is listed under {cat} right now. Clear the filters
                to see the full catalogue again.
              </>
            )}
          </p>
          <div className="sp-empty-a">
            <button type="button" className="hp-btn hp-btn-primary" onClick={reset}>
              CLEAR FILTERS
              <span className="hp-arrow" aria-hidden>
                →
              </span>
            </button>
            <Link
              href="/contact?topic=Merchandise%20Support"
              className="hp-btn hp-btn-ghost"
            >
              Ask about merchandise
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
