"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { bulkSetProductStock } from "@/lib/db";

/**
 * Bulk inventory update — the ONLY server-side entry point for the
 * inventory manager. Discipline:
 *
 *   1. requireAdmin() runs FIRST — non-admin (or unauthenticated) callers
 *      cannot mutate stock even if they know the action name or replay a
 *      form submission. Never trust anything on the client (no hidden
 *      admin flag, no role field, no "isAdmin" cookie).
 *
 *   2. Every field is re-validated server-side. Client submits JSON via
 *      Server Action; we treat that JSON as untrusted:
 *        - `id` must be a non-empty string
 *        - `stock` must be an integer in [0, MAX_STOCK]
 *        - `active` must be boolean
 *
 *   3. Only `stock` + `active` are written. Every other Product column
 *      (name, price, images, sku, weight, desc) is untouched — the
 *      inventory manager never edits product metadata.
 *
 *   4. Empty / no-change submissions are refused loudly rather than
 *      silently succeeding, so the UI can distinguish "saved 0" from
 *      "nothing to save".
 *
 *   5. Revalidation covers every surface a stock change is visible on:
 *      the shop grid, the individual product pages, the home page
 *      (which may embed a store teaser), and the admin views.
 */

const MAX_STOCK = 1_000_000;

export interface StockUpdate {
  id: string;
  stock: number;
  active: boolean;
}

export type BulkStockResult =
  | { ok: true; updated: number }
  | {
      ok: false;
      code: "EMPTY" | "AUTH" | "INVALID" | "SERVER";
      error: string;
      invalidIds?: string[];
    };

function sanitize(raw: unknown): StockUpdate | { id: string | null; bad: true } | null {
  if (!raw || typeof raw !== "object") return null;
  const rec = raw as Record<string, unknown>;
  const id = typeof rec.id === "string" ? rec.id.trim() : "";
  if (!id) return null;
  const stock = Number(rec.stock);
  const active = rec.active === true;
  const stockOk =
    Number.isFinite(stock) &&
    Number.isInteger(stock) &&
    stock >= 0 &&
    stock <= MAX_STOCK;
  if (!stockOk) return { id, bad: true };
  return { id, stock, active };
}

export async function bulkUpdateStockAction(
  updates: unknown
): Promise<BulkStockResult> {
  // Server-side authorization — non-admins cannot mutate stock even by
  // calling this action directly.
  await requireAdmin();

  if (!Array.isArray(updates) || updates.length === 0) {
    return { ok: false, code: "EMPTY", error: "No changes to save." };
  }

  const cleaned: StockUpdate[] = [];
  const invalidIds: string[] = [];
  for (const raw of updates) {
    const parsed = sanitize(raw);
    if (parsed === null) continue; // skip malformed
    if ("bad" in parsed) {
      if (parsed.id) invalidIds.push(parsed.id);
      continue;
    }
    cleaned.push(parsed);
  }

  if (invalidIds.length > 0) {
    return {
      ok: false,
      code: "INVALID",
      error: `Stock must be a whole number between 0 and ${MAX_STOCK.toLocaleString(
        "en-IN"
      )}.`,
      invalidIds,
    };
  }
  if (cleaned.length === 0) {
    return { ok: false, code: "EMPTY", error: "Nothing valid to save." };
  }

  try {
    const updated = await bulkSetProductStock(cleaned);
    // Refresh every catalog-visible surface.
    revalidatePath("/admin/inventory");
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/");
    for (const u of cleaned) revalidatePath(`/product/${u.id}`);
    return { ok: true, updated };
  } catch (e) {
    console.error("[bulkUpdateStockAction] fatal:", e);
    return {
      ok: false,
      code: "SERVER",
      error: "Could not save inventory changes. Please try again.",
    };
  }
}
