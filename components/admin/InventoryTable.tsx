"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Pencil, RotateCcw, Search } from "lucide-react";
import type { Product } from "@/lib/products";
import { inr } from "@/lib/products";
import { useToast } from "@/store/toast";
import {
  bulkUpdateStockAction,
  type BulkStockResult,
  type StockUpdate,
} from "@/app/admin/inventory/actions";

/**
 * Inventory manager — one screen to edit stock (and active flag) across
 * the whole catalog. Reuses the existing `admin-table` + `btn-*` styles
 * and the shared `useToast` store; introduces no new global styles.
 *
 * State model:
 *   • `drafts[id]` holds the buyer-visible edit state per product row —
 *     stock is kept as a STRING so we can distinguish "" (currently
 *     typing) from "0" (deliberate zero) and still validate cleanly.
 *   • A row is `dirty` when its draft differs from its originally-loaded
 *     Product row. A row is `invalid` when its stock string is not a
 *     non-negative integer within the server-side cap. Only DIRTY + VALID
 *     rows are sent to the server on Save; invalid rows block Save.
 *
 * Filters + search operate on the visible list only — they DO NOT drop
 * pending edits. If you edit a row's stock then filter it out of view,
 * the change remains staged and will still be saved.
 */

const MAX_STOCK = 1_000_000;

type Draft = { stock: string; active: boolean };

type StockFilter = "all" | "in-stock" | "out-of-stock" | "active" | "inactive";

interface Props {
  products: Product[];
}

export default function InventoryTable({ products }: Props) {
  const showToast = useToast((s) => s.show);
  const [pending, startTransition] = useTransition();
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() =>
    Object.fromEntries(
      products.map((p) => [
        p.id,
        { stock: String(p.stock), active: p.active },
      ])
    )
  );
  const [query, setQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverInvalidIds, setServerInvalidIds] = useState<Set<string>>(
    new Set()
  );

  // --- Derived --------------------------------------------------------------
  const originalById = useMemo(
    () => new Map(products.map((p) => [p.id, p] as const)),
    [products]
  );
  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.cat))).sort(),
    [products]
  );

  const validation = useMemo(() => {
    const out = new Map<string, { dirty: boolean; invalid: boolean }>();
    for (const p of products) {
      const d = drafts[p.id];
      if (!d) {
        out.set(p.id, { dirty: false, invalid: false });
        continue;
      }
      const dirty =
        d.stock !== String(p.stock) || d.active !== p.active;
      const invalid = !isValidStockString(d.stock);
      out.set(p.id, { dirty, invalid });
    }
    return out;
  }, [drafts, products]);

  const dirtyCount = useMemo(
    () => Array.from(validation.values()).filter((v) => v.dirty).length,
    [validation]
  );
  const invalidCount = useMemo(
    () => Array.from(validation.values()).filter((v) => v.invalid).length,
    [validation]
  );

  const visibleProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (categoryFilter !== "all" && p.cat !== categoryFilter) return false;
      if (stockFilter === "in-stock" && !(p.active && p.stock > 0)) return false;
      if (stockFilter === "out-of-stock" && p.stock > 0) return false;
      if (stockFilter === "active" && !p.active) return false;
      if (stockFilter === "inactive" && p.active) return false;
      if (q) {
        const hay = `${p.name} ${p.id} ${p.sku ?? ""} ${p.cat}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [products, query, categoryFilter, stockFilter]);

  // --- Handlers -------------------------------------------------------------
  function setStock(id: string, value: string) {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...prev[id]!, stock: value },
    }));
    if (serverInvalidIds.has(id)) {
      const next = new Set(serverInvalidIds);
      next.delete(id);
      setServerInvalidIds(next);
    }
    if (serverError) setServerError(null);
  }
  function setActive(id: string, value: boolean) {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...prev[id]!, active: value },
    }));
    if (serverError) setServerError(null);
  }
  function resetOne(id: string) {
    const original = originalById.get(id);
    if (!original) return;
    setDrafts((prev) => ({
      ...prev,
      [id]: { stock: String(original.stock), active: original.active },
    }));
    if (serverInvalidIds.has(id)) {
      const next = new Set(serverInvalidIds);
      next.delete(id);
      setServerInvalidIds(next);
    }
  }
  function resetAll() {
    setDrafts(
      Object.fromEntries(
        products.map((p) => [
          p.id,
          { stock: String(p.stock), active: p.active },
        ])
      )
    );
    setServerInvalidIds(new Set());
    setServerError(null);
  }

  function onSave() {
    if (pending) return;
    if (invalidCount > 0) {
      setServerError(
        `${invalidCount} row${
          invalidCount === 1 ? " has" : "s have"
        } an invalid stock value. Fix them before saving.`
      );
      return;
    }
    // Only send DIRTY + VALID rows.
    const payload: StockUpdate[] = [];
    for (const p of products) {
      const v = validation.get(p.id);
      const d = drafts[p.id];
      if (!v || !d || !v.dirty || v.invalid) continue;
      payload.push({ id: p.id, stock: Number(d.stock), active: d.active });
    }
    if (payload.length === 0) {
      setServerError("Nothing to save.");
      return;
    }
    setServerError(null);
    setServerInvalidIds(new Set());
    startTransition(async () => {
      const res: BulkStockResult = await bulkUpdateStockAction(payload);
      if (res.ok) {
        showToast(
          `Saved <span class="gold">${res.updated}</span> inventory change${
            res.updated === 1 ? "" : "s"
          }`
        );
        // Payload just became the new "original" — reflect that so
        // dirty rows go clean (until the Next.js revalidation delivers
        // fresh props on next render, which will also line up).
        // We update our local originals mirror by mutating the map.
        for (const u of payload) {
          const p = originalById.get(u.id);
          if (p) {
            p.stock = u.stock;
            p.active = u.active;
          }
        }
        // Re-sync drafts from the mutated map so validation clears.
        setDrafts((prev) => {
          const next = { ...prev };
          for (const u of payload) {
            next[u.id] = { stock: String(u.stock), active: u.active };
          }
          return next;
        });
      } else {
        setServerError(res.error);
        if ("invalidIds" in res && res.invalidIds) {
          setServerInvalidIds(new Set(res.invalidIds));
        }
      }
    });
  }

  // --- Render ---------------------------------------------------------------
  return (
    <div>
      {/* Filter + search toolbar */}
      <div className="bg-cream-50 border border-black/[0.07] rounded-[18px] p-4 md:p-5 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-[420px]">
            <Search className="w-[15px] h-[15px] absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, SKU, category, or id…"
              aria-label="Search products"
              className="w-full pl-9 pr-3"
              style={{ margin: 0 }}
            />
          </div>
          <div className="font-manrope text-[12.5px] text-muted whitespace-nowrap">
            Showing {visibleProducts.length} of {products.length}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterChip
            label="All"
            active={stockFilter === "all"}
            onClick={() => setStockFilter("all")}
          />
          <FilterChip
            label="In stock"
            active={stockFilter === "in-stock"}
            onClick={() => setStockFilter("in-stock")}
          />
          <FilterChip
            label="Out of stock"
            active={stockFilter === "out-of-stock"}
            onClick={() => setStockFilter("out-of-stock")}
          />
          <FilterChip
            label="Active"
            active={stockFilter === "active"}
            onClick={() => setStockFilter("active")}
          />
          <FilterChip
            label="Inactive"
            active={stockFilter === "inactive"}
            onClick={() => setStockFilter("inactive")}
          />
        </div>
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <FilterChip
              label="All categories"
              active={categoryFilter === "all"}
              onClick={() => setCategoryFilter("all")}
              tone="cat"
            />
            {categories.map((c) => (
              <FilterChip
                key={c}
                label={c}
                active={categoryFilter === c}
                onClick={() => setCategoryFilter(c)}
                tone="cat"
              />
            ))}
          </div>
        )}
      </div>

      {/* Server error banner */}
      {serverError && (
        <div
          role="alert"
          className="mt-4 p-4 rounded-[14px] font-manrope text-[13.5px] font-semibold border"
          style={{
            background: "rgba(196,32,42,0.08)",
            color: "#C4202A",
            borderColor: "rgba(196,32,42,0.35)",
          }}
        >
          {serverError}
        </div>
      )}

      {/* Table */}
      <div className="mt-4 bg-cream-50 border border-black/[0.07] rounded-[18px] p-4 overflow-x-auto">
        {visibleProducts.length === 0 ? (
          <div className="p-8 text-center font-manrope text-[13.5px] text-muted">
            No products match those filters.
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th style={{ width: 130 }}>Stock</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleProducts.map((p) => {
                const draft = drafts[p.id]!;
                const v = validation.get(p.id) ?? {
                  dirty: false,
                  invalid: false,
                };
                const currentStockN = Number(draft.stock);
                const stockStatus = statusFor({
                  active: draft.active,
                  stock: v.invalid ? p.stock : currentStockN,
                });
                const rowInvalid = v.invalid || serverInvalidIds.has(p.id);
                return (
                  <tr
                    key={p.id}
                    style={
                      v.dirty
                        ? { background: "rgba(233,203,142,0.12)" }
                        : undefined
                    }
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-[9px] bg-gradient-to-br from-[#C9242E] to-[#871119] text-white/80 font-sora font-extrabold text-[11px] flex items-center justify-center">
                          {p.glyph}
                        </span>
                        <div>
                          <div className="font-sora font-bold text-[14px] text-ink">
                            {p.name}
                          </div>
                          <div className="font-manrope text-[12px] text-muted">
                            {p.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="font-manrope text-[13px] text-muted">
                      {p.sku ?? "—"}
                    </td>
                    <td className="font-manrope text-muted">{p.cat}</td>
                    <td className="font-sora font-bold">{inr(p.price)}</td>
                    <td>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={MAX_STOCK}
                        step={1}
                        value={draft.stock}
                        onChange={(e) => setStock(p.id, e.target.value)}
                        aria-invalid={rowInvalid}
                        aria-label={`Stock for ${p.name}`}
                        disabled={pending}
                        className="w-[100px]"
                        style={{
                          margin: 0,
                          padding: "7px 10px",
                          borderColor: rowInvalid ? "#C4202A" : undefined,
                          background: rowInvalid
                            ? "rgba(196,32,42,0.05)"
                            : undefined,
                        }}
                      />
                      {v.invalid && (
                        <div className="mt-1 font-manrope text-[11.5px] text-crimson-600 font-semibold">
                          Whole number 0–{MAX_STOCK.toLocaleString("en-IN")}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="flex flex-col gap-1.5 items-start">
                        <StatusBadge status={stockStatus} />
                        <label className="inline-flex items-center gap-1.5 font-manrope text-[12px] text-muted cursor-pointer">
                          <input
                            type="checkbox"
                            checked={draft.active}
                            onChange={(e) =>
                              setActive(p.id, e.target.checked)
                            }
                            disabled={pending}
                            style={{ margin: 0 }}
                          />
                          <span>Active</span>
                        </label>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 justify-end">
                        {v.dirty && (
                          <button
                            type="button"
                            onClick={() => resetOne(p.id)}
                            disabled={pending}
                            className="btn-ghost"
                            title="Reset this row to its saved value"
                          >
                            <RotateCcw className="w-[13px] h-[13px]" />
                            Reset
                          </button>
                        )}
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="btn-ghost"
                          title="Edit product details"
                        >
                          <Pencil className="w-[13px] h-[13px]" />
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Sticky save bar — only appears when there are unsaved changes. */}
      {(dirtyCount > 0 || pending) && (
        <div
          className="sticky bottom-4 mt-6 z-20 flex flex-wrap items-center gap-3 justify-between rounded-[16px] border border-black/[0.12] bg-white shadow-[0_20px_40px_-20px_rgba(0,0,0,0.35)] p-4"
        >
          <div className="font-manrope text-[13.5px] text-ink flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream-100 font-bold text-[12px] tracking-[0.06em] uppercase">
              {dirtyCount} unsaved change{dirtyCount === 1 ? "" : "s"}
            </span>
            {invalidCount > 0 && (
              <span className="text-crimson-600 font-semibold">
                {invalidCount} invalid — fix before saving
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetAll}
              disabled={pending}
              className="btn-ghost"
            >
              <RotateCcw className="w-[13px] h-[13px]" />
              Reset all
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={pending || invalidCount > 0 || dirtyCount === 0}
              className="btn-dark press"
            >
              {pending ? "Saving…" : "Save stock changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Presentational helpers

function FilterChip({
  label,
  active,
  onClick,
  tone = "primary",
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  tone?: "primary" | "cat";
}) {
  const base =
    "font-manrope font-semibold text-[12.5px] px-3 py-[6px] rounded-full border transition-colors";
  const cls = active
    ? tone === "cat"
      ? `${base} bg-ink text-white border-ink`
      : `${base} bg-crimson-600 text-white border-crimson-600`
    : `${base} bg-white text-muted border-black/[0.14] hover:border-ink hover:text-ink`;
  return (
    <button type="button" onClick={onClick} className={cls}>
      {label}
    </button>
  );
}

type StatusKey = "in-stock" | "low-stock" | "out-of-stock" | "inactive";

function statusFor({
  active,
  stock,
}: {
  active: boolean;
  stock: number;
}): StatusKey {
  if (!active) return "inactive";
  if (stock <= 0) return "out-of-stock";
  if (stock <= 5) return "low-stock";
  return "in-stock";
}

function StatusBadge({ status }: { status: StatusKey }) {
  const label =
    status === "in-stock"
      ? "In stock"
      : status === "low-stock"
        ? "Low stock"
        : status === "out-of-stock"
          ? "Out of stock"
          : "Inactive";
  const style: React.CSSProperties =
    status === "in-stock"
      ? { background: "rgba(46,125,50,0.12)", color: "#256b2a" }
      : status === "low-stock"
        ? { background: "rgba(196,32,42,0.10)", color: "#C4202A" }
        : status === "out-of-stock"
          ? { background: "rgba(26,21,19,0.90)", color: "#fff" }
          : { background: "rgba(107,99,92,0.14)", color: "#6b635c" };
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-[3px] font-sora font-extrabold text-[10.5px] tracking-[0.14em] uppercase"
      style={style}
    >
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Client-side validation mirror of the server rule.

function isValidStockString(s: string): boolean {
  if (s === "" || s === undefined) return false;
  // Accept only non-negative integers, no leading + / -.
  if (!/^\d+$/.test(s)) return false;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 && n <= MAX_STOCK;
}
