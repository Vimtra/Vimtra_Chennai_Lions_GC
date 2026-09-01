"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  X,
  Pencil,
  Trash2,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Package,
  Layers,
} from "lucide-react";
import { inr, type Product } from "@/lib/products";
import { bulkUpdateStockAction, deleteProductAction } from "@/app/admin/products/actions";
import ConfirmDeleteButton from "@/components/admin/ConfirmDeleteButton";

interface InventoryTableProps {
  products: Product[];
}

export default function InventoryTable({ products }: InventoryTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [stockFilter, setStockFilter] = useState<"ALL" | "IN_STOCK" | "OUT_OF_STOCK" | "LOW_STOCK">("ALL");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // Draft stock edits: maps productId -> draft stock string
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Distinct categories available in current product list
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.cat) set.add(p.cat);
    });
    return Array.from(set).sort();
  }, [products]);

  // Determine dirty items and validity
  const { dirtyMap, hasErrors, dirtyCount } = useMemo(() => {
    const dirty: Record<string, { original: number; draft: number; isValid: boolean; error?: string }> = {};
    let errors = false;
    let count = 0;

    for (const [id, valStr] of Object.entries(drafts)) {
      const prod = products.find((p) => p.id === id);
      if (!prod) continue;

      const trimmed = valStr.trim();
      const isDifferent = trimmed !== "" && Number(trimmed) !== prod.stock;

      if (isDifferent) {
        count++;
        // Validation: must be non-empty, whole positive integer or 0
        const isInt = /^\d+$/.test(trimmed);
        const num = Number(trimmed);
        const valid = isInt && num >= 0 && Number.isSafeInteger(num);

        if (!valid) {
          errors = true;
          dirty[id] = {
            original: prod.stock,
            draft: isNaN(num) ? -1 : num,
            isValid: false,
            error: "Must be a non-negative integer",
          };
        } else {
          dirty[id] = {
            original: prod.stock,
            draft: num,
            isValid: true,
          };
        }
      }
    }

    return { dirtyMap: dirty, hasErrors: errors, dirtyCount: count };
  }, [drafts, products]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();

    return products.filter((p) => {
      // Search by name, SKU, or ID
      if (q) {
        const matchName = p.name.toLowerCase().includes(q);
        const matchSku = p.sku ? p.sku.toLowerCase().includes(q) : false;
        const matchId = p.id.toLowerCase().includes(q);
        if (!matchName && !matchSku && !matchId) return false;
      }

      // Category filter
      if (categoryFilter !== "ALL" && p.cat !== categoryFilter) {
        return false;
      }

      // Stock filter (evaluates against current draft if edited, else actual stock)
      const currentStock = drafts[p.id] !== undefined && /^\d+$/.test(drafts[p.id].trim())
        ? Number(drafts[p.id].trim())
        : p.stock;

      if (stockFilter === "IN_STOCK" && currentStock <= 0) return false;
      if (stockFilter === "OUT_OF_STOCK" && currentStock > 0) return false;
      if (stockFilter === "LOW_STOCK" && (currentStock <= 0 || currentStock > 5)) return false;

      // Active filter
      if (activeFilter === "ACTIVE" && !p.active) return false;
      if (activeFilter === "INACTIVE" && p.active) return false;

      return true;
    });
  }, [products, search, categoryFilter, stockFilter, activeFilter, drafts]);

  // Handle inline stock input change
  const handleStockChange = (id: string, value: string) => {
    setFeedback(null);
    setDrafts((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Discard all changes
  const handleDiscardAll = () => {
    setDrafts({});
    setFeedback(null);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearch("");
    setCategoryFilter("ALL");
    setStockFilter("ALL");
    setActiveFilter("ALL");
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    categoryFilter !== "ALL" ||
    stockFilter !== "ALL" ||
    activeFilter !== "ALL";

  // Bulk save changes
  const handleSave = () => {
    if (dirtyCount === 0 || hasErrors || isPending) return;

    setFeedback(null);

    const updates = Object.entries(dirtyMap)
      .filter(([, v]) => v.isValid)
      .map(([id, v]) => ({
        id,
        stock: v.draft,
      }));

    if (updates.length === 0) return;

    startTransition(async () => {
      try {
        const result = await bulkUpdateStockAction(updates);
        if (result.ok) {
          setFeedback({
            type: "success",
            message: `Successfully saved stock updates for ${result.updatedCount} product${
              result.updatedCount === 1 ? "" : "s"
            }.`,
          });
          // Clear saved drafts
          setDrafts({});
          router.refresh();
        } else {
          setFeedback({
            type: "error",
            message: result.error || "Failed to update stock.",
          });
        }
      } catch {
        setFeedback({
          type: "error",
          message: "An unexpected error occurred while saving stock changes.",
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Action & Summary Bar */}
      <div className="bg-cream-50 border border-black/[0.07] rounded-[18px] p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-crimson-600" />
              <span className="font-sora font-extrabold text-[18px] text-ink">
                Inventory Overview
              </span>
            </div>
            <span className="text-muted text-[13.5px] font-manrope">
              ({products.length} total products · {products.filter((p) => p.stock > 0).length} in stock ·{" "}
              {products.filter((p) => p.stock === 0).length} out of stock)
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {dirtyCount > 0 && (
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-sora font-bold text-[12px] ${
                    hasErrors
                      ? "bg-crimson-600/10 text-crimson-600 border border-crimson-600/20"
                      : "bg-gold-500/15 text-gold-deep border border-gold-500/30"
                  }`}
                >
                  ⚡ {dirtyCount} unsaved change{dirtyCount === 1 ? "" : "s"}
                </span>

                <button
                  type="button"
                  onClick={handleDiscardAll}
                  disabled={isPending}
                  className="btn-ghost text-[12.5px] py-1.5 px-3"
                  title="Discard all pending changes"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Discard
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={dirtyCount === 0 || hasErrors || isPending}
              className={`btn-dark text-[13px] py-2 px-5 ${
                dirtyCount === 0 || hasErrors
                  ? "opacity-50 cursor-not-allowed"
                  : "press"
              }`}
            >
              <Save className="w-4 h-4" />
              {isPending ? "Saving changes…" : "Save stock changes"}
            </button>
          </div>
        </div>

        {/* Feedback Messages */}
        {feedback && (
          <div
            className={`mt-4 p-4 rounded-[12px] flex items-center justify-between gap-3 text-[14px] font-manrope ${
              feedback.type === "success"
                ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-800"
                : "bg-crimson-600/10 border border-crimson-600/25 text-crimson-700"
            }`}
          >
            <div className="flex items-center gap-2.5 font-medium">
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-crimson-600 flex-shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-inherit opacity-70 hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Search & Filter Controls */}
        <div className="mt-5 pt-5 border-t border-black/[0.06] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, SKU, slug…"
              className="pl-9.5 pr-8 py-2 text-[13.5px] rounded-[10px] border-black/[0.12]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-2 text-[13.5px] rounded-[10px] border-black/[0.12]"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Status Filter */}
          <div>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="py-2 text-[13.5px] rounded-[10px] border-black/[0.12]"
            >
              <option value="ALL">All Stock Statuses</option>
              <option value="IN_STOCK">In Stock (&gt; 0)</option>
              <option value="LOW_STOCK">Low Stock (1–5)</option>
              <option value="OUT_OF_STOCK">Out of Stock (0)</option>
            </select>
          </div>

          {/* Active Status Filter */}
          <div>
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value as any)}
              className="py-2 text-[13.5px] rounded-[10px] border-black/[0.12]"
            >
              <option value="ALL">All Visibility (Active &amp; Inactive)</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive / Hidden Only</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-3 flex items-center justify-between text-[12.5px] text-muted font-manrope">
            <span>
              Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> products
            </span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-crimson-600 hover:underline font-semibold"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Inventory Table */}
      <div className="bg-cream-50 border border-black/[0.07] rounded-[18px] p-4 overflow-x-auto shadow-sm">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="min-w-[220px]">Product</th>
              <th className="min-w-[100px]">SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th className="min-w-[140px]">Stock Level</th>
              <th>Stock Status</th>
              <th>Visibility</th>
              <th className="text-right min-w-[130px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-10">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted">
                    <Layers className="w-8 h-8 opacity-40" />
                    <p className="font-manrope text-[14px] font-semibold">No products match your filters</p>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="btn-ghost text-[12px] py-1 px-3 mt-1"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => {
                const currentDraftVal = drafts[p.id];
                const displayVal = currentDraftVal !== undefined ? currentDraftVal : String(p.stock);
                const dirtyInfo = dirtyMap[p.id];
                const isDirty = !!dirtyInfo;
                const isInvalid = dirtyInfo && !dirtyInfo.isValid;

                const currentStockNum = isNaN(Number(displayVal)) ? p.stock : Number(displayVal);
                const isOutOfStock = currentStockNum <= 0;
                const isLowStock = currentStockNum > 0 && currentStockNum <= 5;

                return (
                  <tr
                    key={p.id}
                    className={`transition-colors ${
                      isDirty ? "bg-amber-500/[0.04]" : "hover:bg-black/[0.01]"
                    }`}
                  >
                    {/* Product Name + Glyph + ID */}
                    <td>
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-[9px] bg-gradient-to-br from-[#C9242E] to-[#871119] text-white/85 font-sora font-extrabold text-[11px] flex items-center justify-center flex-shrink-0">
                          {p.glyph}
                        </span>
                        <div className="min-w-0">
                          <div className="font-sora font-bold text-[14px] text-ink truncate">
                            {p.name}
                          </div>
                          <div className="font-manrope text-[11.5px] text-muted truncate">
                            {p.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="font-manrope text-[13px] text-muted">
                      {p.sku ? (
                        <span className="font-mono bg-black/[0.04] px-1.5 py-0.5 rounded text-[12px] text-ink">
                          {p.sku}
                        </span>
                      ) : (
                        <span className="text-muted/60">—</span>
                      )}
                    </td>

                    {/* Category */}
                    <td className="font-manrope text-[13px] text-muted whitespace-nowrap">
                      {p.cat}
                    </td>

                    {/* Price */}
                    <td className="font-sora font-bold text-[13.5px] text-ink whitespace-nowrap">
                      {inr(p.price)}
                    </td>

                    {/* Inline Stock Input */}
                    <td>
                      <div className="flex flex-col gap-1 max-w-[120px]">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={displayVal}
                            onChange={(e) => handleStockChange(p.id, e.target.value)}
                            disabled={isPending}
                            className={`!w-24 !py-1.5 !px-2.5 font-sora font-bold text-[13.5px] rounded-[8px] text-center ${
                              isInvalid
                                ? "!border-crimson-600 !bg-crimson-600/5 focus:!border-crimson-600"
                                : isDirty
                                  ? "!border-gold-500 !bg-gold-500/10 focus:!border-gold-500"
                                  : "!border-black/[0.14]"
                            }`}
                          />
                          {isDirty && (
                            <button
                              type="button"
                              onClick={() => {
                                setDrafts((prev) => {
                                  const next = { ...prev };
                                  delete next[p.id];
                                  return next;
                                });
                              }}
                              title={`Reset to original (${p.stock})`}
                              className="text-muted hover:text-ink p-1"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        {isDirty && (
                          <span className="font-manrope text-[10.5px] text-muted">
                            was: <strong>{p.stock}</strong>
                          </span>
                        )}
                        {isInvalid && (
                          <span className="font-manrope text-[10.5px] text-crimson-600 font-semibold">
                            {dirtyInfo.error}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Stock Status Badge */}
                    <td>
                      {isOutOfStock ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full font-sora font-extrabold text-[10px] tracking-[0.06em] uppercase bg-black/80 text-white">
                          Out of stock
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full font-sora font-extrabold text-[10px] tracking-[0.06em] uppercase bg-crimson-600/15 text-crimson-700 border border-crimson-600/25">
                          Low ({currentStockNum})
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full font-sora font-extrabold text-[10px] tracking-[0.06em] uppercase bg-emerald-500/15 text-emerald-800 border border-emerald-500/25">
                          In stock ({currentStockNum})
                        </span>
                      )}
                    </td>

                    {/* Active Visibility Badge */}
                    <td>
                      {p.active ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full font-sora font-bold text-[10.5px] tracking-[0.04em] uppercase bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full font-sora font-bold text-[10.5px] tracking-[0.04em] uppercase bg-black/[0.06] text-muted border border-black/[0.1]">
                          Hidden
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="flex items-center gap-2 justify-end">
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="btn-ghost text-[12px] py-1 px-2.5"
                          title="Edit full product details"
                        >
                          <Pencil className="w-[12px] h-[12px]" /> Edit
                        </Link>
                        <ConfirmDeleteButton
                          action={deleteProductAction}
                          id={p.id}
                          label={p.name}
                          description="This permanently removes the product from the catalog, the shop and the admin. It cannot be undone."
                          triggerClassName="btn-ghost btn-danger text-[12px] py-1 px-2.5"
                          triggerTitle="Delete product"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

