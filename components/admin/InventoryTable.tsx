"use client";

import { useState, useTransition, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, X, Pencil, Save, RotateCcw, Layers, AlertCircle } from "lucide-react";
import { inr, type Product } from "@/lib/products";
import { bulkUpdateStockAction, deleteProductAction } from "@/app/admin/products/actions";
import ConfirmDeleteButton from "@/components/admin/ConfirmDeleteButton";
import { StockPill } from "@/components/admin/ui/StatusPill";
import { adminToast } from "@/store/admin-toast";

export type StockFilter = "ALL" | "IN_STOCK" | "OUT_OF_STOCK" | "LOW_STOCK";
export type ActiveFilter = "ALL" | "ACTIVE" | "INACTIVE";

interface InventoryTableProps {
  products: Product[];
  initialStockFilter?: StockFilter;
  initialActiveFilter?: ActiveFilter;
}

/**
 * Bulk stock editor. Drafts live in local state until "Save" sends every
 * changed row in one server action; the page then refreshes from the
 * database so what is shown is what was stored. Leaving the page with
 * unsaved edits prompts the browser's own "unsaved changes" guard.
 */
export default function InventoryTable({
  products,
  initialStockFilter = "ALL",
  initialActiveFilter = "ALL",
}: InventoryTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [stockFilter, setStockFilter] = useState<StockFilter>(initialStockFilter);
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>(initialActiveFilter);

  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.cat && set.add(p.cat));
    return Array.from(set).sort();
  }, [products]);

  const { dirtyMap, hasErrors, dirtyCount } = useMemo(() => {
    const dirty: Record<string, { original: number; draft: number; isValid: boolean; error?: string }> = {};
    let errors = false;
    let count = 0;
    for (const [id, valStr] of Object.entries(drafts)) {
      const prod = products.find((p) => p.id === id);
      if (!prod) continue;
      const trimmed = valStr.trim();
      const isDifferent = trimmed !== "" && Number(trimmed) !== prod.stock;
      if (!isDifferent) continue;
      count++;
      const isInt = /^\d+$/.test(trimmed);
      const num = Number(trimmed);
      const valid = isInt && num >= 0 && num <= 1_000_000;
      if (!valid) {
        errors = true;
        dirty[id] = { original: prod.stock, draft: isNaN(num) ? -1 : num, isValid: false, error: "Whole number, 0 or more" };
      } else {
        dirty[id] = { original: prod.stock, draft: num, isValid: true };
      }
    }
    return { dirtyMap: dirty, hasErrors: errors, dirtyCount: count };
  }, [drafts, products]);

  // Warn before leaving with unsaved edits.
  useEffect(() => {
    if (dirtyCount === 0) return;
    const onUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, [dirtyCount]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (q) {
        const hit =
          p.name.toLowerCase().includes(q) ||
          (p.sku ? p.sku.toLowerCase().includes(q) : false) ||
          p.id.toLowerCase().includes(q);
        if (!hit) return false;
      }
      if (categoryFilter !== "ALL" && p.cat !== categoryFilter) return false;
      const currentStock =
        drafts[p.id] !== undefined && /^\d+$/.test(drafts[p.id].trim()) ? Number(drafts[p.id].trim()) : p.stock;
      if (stockFilter === "IN_STOCK" && currentStock <= 0) return false;
      if (stockFilter === "OUT_OF_STOCK" && currentStock > 0) return false;
      if (stockFilter === "LOW_STOCK" && (currentStock <= 0 || currentStock > 5)) return false;
      if (activeFilter === "ACTIVE" && !p.active) return false;
      if (activeFilter === "INACTIVE" && p.active) return false;
      return true;
    });
  }, [products, search, categoryFilter, stockFilter, activeFilter, drafts]);

  const handleStockChange = (id: string, value: string) => {
    setError(null);
    setDrafts((prev) => ({ ...prev, [id]: value }));
  };
  const handleDiscardAll = () => {
    setDrafts({});
    setError(null);
  };
  const handleResetFilters = () => {
    setSearch("");
    setCategoryFilter("ALL");
    setStockFilter("ALL");
    setActiveFilter("ALL");
  };
  const hasActiveFilters =
    search.trim() !== "" || categoryFilter !== "ALL" || stockFilter !== "ALL" || activeFilter !== "ALL";

  const handleSave = () => {
    if (dirtyCount === 0 || hasErrors || isPending) return;
    setError(null);
    const updates = Object.entries(dirtyMap)
      .filter(([, v]) => v.isValid)
      .map(([id, v]) => ({ id, stock: v.draft }));
    if (updates.length === 0) return;
    startTransition(async () => {
      try {
        const result = await bulkUpdateStockAction(updates);
        if (result.ok) {
          adminToast(
            `Stock saved for ${result.updatedCount} product${result.updatedCount === 1 ? "" : "s"}.`,
            "ok"
          );
          setDrafts({});
          router.refresh();
        } else {
          setError(result.error || "Failed to update stock.");
        }
      } catch {
        setError("An unexpected error occurred while saving stock changes.");
      }
    });
  };

  return (
    <div className="adm-stack">
      <div className="adm-panel adm-panel-pad" style={{ display: "grid", gap: 14 }}>
        <div className="adm-toolbar" style={{ marginBottom: 0 }}>
          <div className="adm-search">
            <Search />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, SKU, slug…"
              aria-label="Search products"
            />
            {search && (
              <button type="button" onClick={() => setSearch("")} className="adm-search-clear" aria-label="Clear search">
                <X />
              </button>
            )}
          </div>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} aria-label="Category">
            <option value="ALL">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value as StockFilter)} aria-label="Stock level">
            <option value="ALL">Any stock level</option>
            <option value="IN_STOCK">In stock</option>
            <option value="LOW_STOCK">Low (1–5)</option>
            <option value="OUT_OF_STOCK">Out of stock</option>
          </select>
          <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value as ActiveFilter)} aria-label="Visibility">
            <option value="ALL">Visible &amp; hidden</option>
            <option value="ACTIVE">Visible only</option>
            <option value="INACTIVE">Hidden only</option>
          </select>
        </div>

        <div className="adm-inline" style={{ justifyContent: "space-between" }}>
          <span className="adm-sub" style={{ margin: 0 }}>
            Showing <strong>{filteredProducts.length}</strong> of {products.length}
            {hasActiveFilters && (
              <>
                {" · "}
                <button type="button" onClick={handleResetFilters} className="adm-link" style={{ background: "none", border: 0, padding: 0, cursor: "pointer" }}>
                  Reset filters
                </button>
              </>
            )}
          </span>
          <div className="adm-inline">
            {dirtyCount > 0 && (
              <>
                <span className="adm-pill" data-tone={hasErrors ? "danger" : "gold"}>
                  {dirtyCount} unsaved
                </span>
                <button type="button" onClick={handleDiscardAll} disabled={isPending} className="adm-btn adm-btn-sm adm-btn-ghost">
                  <RotateCcw /> Discard
                </button>
              </>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={dirtyCount === 0 || hasErrors || isPending}
              className="adm-btn adm-btn-sm adm-btn-primary"
            >
              <Save />
              {isPending ? "Saving…" : "Save stock changes"}
            </button>
          </div>
        </div>

        {error && (
          <div className="adm-alert" data-tone="danger" role="alert">
            <AlertCircle />
            <span>{error}</span>
            <button type="button" className="adm-alert-close" onClick={() => setError(null)} aria-label="Dismiss">
              <X />
            </button>
          </div>
        )}
      </div>

      <div className="adm-panel">
        {filteredProducts.length === 0 ? (
          <div className="adm-empty">
            <Layers />
            <div className="adm-empty-title">No products match your filters</div>
            {hasActiveFilters && (
              <div className="adm-empty-actions">
                <button type="button" onClick={handleResetFilters} className="adm-btn adm-btn-sm">
                  Clear filters
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table is-responsive">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th className="adm-td-right">Price</th>
                  <th>Stock on hand</th>
                  <th>Status</th>
                  <th className="adm-td-actions">
                    <span className="adm-sr">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const draftVal = drafts[p.id];
                  const displayVal = draftVal !== undefined ? draftVal : String(p.stock);
                  const dirtyInfo = dirtyMap[p.id];
                  const isDirty = !!dirtyInfo;
                  const isInvalid = dirtyInfo && !dirtyInfo.isValid;
                  const currentStockNum = isNaN(Number(displayVal)) ? p.stock : Number(displayVal);
                  return (
                    <tr key={p.id} className={isDirty ? "is-highlight" : !p.active ? "is-dim" : undefined}>
                      <td className="adm-td-primary">
                        <div className="adm-cell-media">
                          <span className="adm-thumb-glyph">{p.glyph || "—"}</span>
                          <div>
                            <div className="adm-cell-title">{p.name}</div>
                            <div className="adm-cell-sub">{p.sku ? <span className="adm-mono">{p.sku}</span> : p.id}</div>
                          </div>
                        </div>
                      </td>
                      <td data-label="Category" className="adm-td-muted">
                        {p.cat}
                      </td>
                      <td data-label="Price" className="adm-td-num adm-td-right">
                        {inr(p.price)}
                      </td>
                      <td data-label="Stock">
                        <div style={{ display: "grid", gap: 4, maxWidth: 160 }}>
                          <div className="adm-inline" style={{ flexWrap: "nowrap" }}>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={displayVal}
                              onChange={(e) => handleStockChange(p.id, e.target.value)}
                              disabled={isPending}
                              aria-label={`Stock for ${p.name}`}
                              aria-invalid={isInvalid || undefined}
                              className="adm-num"
                              style={{ width: 96, textAlign: "center", minHeight: 36, padding: "6px 8px" }}
                            />
                            {isDirty && (
                              <button
                                type="button"
                                onClick={() =>
                                  setDrafts((prev) => {
                                    const next = { ...prev };
                                    delete next[p.id];
                                    return next;
                                  })
                                }
                                title={`Reset to ${p.stock}`}
                                className="adm-btn adm-btn-sm adm-btn-icon adm-btn-ghost"
                                aria-label={`Reset to ${p.stock}`}
                              >
                                <RotateCcw />
                              </button>
                            )}
                          </div>
                          {isDirty && !isInvalid && <span className="adm-hint">was {p.stock}</span>}
                          {isInvalid && <span className="adm-field-error">{dirtyInfo.error}</span>}
                        </div>
                      </td>
                      <td data-label="Status">
                        <StockPill stock={currentStockNum} active={p.active} />
                      </td>
                      <td className="adm-td-actions">
                        <div className="adm-actions">
                          <Link href={`/admin/products/${p.id}/edit`} className="adm-btn adm-btn-sm">
                            <Pencil /> Edit
                          </Link>
                          <ConfirmDeleteButton
                            action={deleteProductAction}
                            id={p.id}
                            label={p.name}
                            meta={p.sku ?? p.id}
                            description="Removes the product from the catalogue, the shop and the admin. Products that appear on any order cannot be deleted — hide them instead."
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
        )}
      </div>
    </div>
  );
}
