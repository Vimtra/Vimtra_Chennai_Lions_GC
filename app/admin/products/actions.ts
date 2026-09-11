"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  getProductsByIds,
  bulkSetProductStock,
  setProductActive,
  type ProductInput,
} from "@/lib/db";
import { CoverUploadError, storeCoverImage } from "@/lib/cover-upload";
import type { ActionResult } from "@/lib/admin-action-result";

/**
 * Product Manager actions. Every entry point calls requireAdmin() first and
 * re-validates its input server-side; the client form's checks exist only
 * to give faster feedback.
 *
 * Images go through lib/cover-upload.ts — the ONE storage path for every
 * admin image (Vercel Blob in deployed environments, `public/uploads/`
 * locally when no token is set). The token never leaves the server.
 */

const MAX_STOCK = 1_000_000;

function text(v: FormDataEntryValue | null): string {
  return String(v ?? "").trim();
}

function optInt(v: FormDataEntryValue | null): number | null {
  const s = text(v);
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : null;
}

async function parseInput(
  formData: FormData,
  existing?: { img?: string; images: string[] }
): Promise<ProductInput> {
  const upload = formData.get("image");
  const currentImg = text(formData.get("currentImg"));
  const removeImage = text(formData.get("removeImage")) === "1";

  let img: string | undefined = removeImage ? undefined : currentImg || undefined;

  if (upload instanceof File && upload.size > 0) {
    // Throws CoverUploadError with a written, user-facing message.
    img = await storeCoverImage(upload, "products");
  }

  // Keep any secondary gallery images the row already holds; only the
  // primary slot is managed by this form. Previously every save collapsed
  // `images` to a single entry.
  const rest = (existing?.images ?? []).filter((s) => s !== existing?.img && s !== currentImg);
  const images = img ? [img, ...rest] : rest;

  const stock = optInt(formData.get("stock"));
  const weightGrams = optInt(formData.get("weightGrams"));
  const sku = text(formData.get("sku"));

  return {
    name: text(formData.get("name")),
    cat: text(formData.get("cat")),
    price: Math.max(0, Math.round(Number(formData.get("price")) || 0)),
    glyph: text(formData.get("glyph")).toUpperCase().slice(0, 3),
    img,
    images,
    range: text(formData.get("range")),
    desc: text(formData.get("desc")),
    // Only written when the form actually submitted the field.
    ...(formData.has("stock") ? { stock: Math.min(MAX_STOCK, stock ?? 0) } : {}),
    ...(formData.has("active") || formData.has("activeSubmitted")
      ? { active: text(formData.get("active")) === "1" }
      : {}),
    ...(formData.has("sku") ? { sku: sku || null } : {}),
    ...(formData.has("weightGrams") ? { weightGrams } : {}),
  };
}

/** Refresh every surface that reads the catalog. */
function revalidateCatalog(id?: string) {
  revalidatePath("/shop");
  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  revalidatePath("/admin");
  revalidatePath("/");
  if (id) revalidatePath(`/product/${id}`);
}

/** Server-side guard for the fields the form marks required. */
function validate(input: ProductInput): string | null {
  if (!input.name) return "Product name is required.";
  if (!input.cat) return "Category is required.";
  if (!Number.isFinite(input.price) || input.price < 0) return "Price must be zero or more.";
  return null;
}

function toMessage(err: unknown): string {
  if (err instanceof CoverUploadError) return err.message;
  return "Something went wrong. The product was not changed.";
}

export type ProductActionResult = ActionResult<{ id: string }>;

export async function createProductAction(formData: FormData): Promise<ProductActionResult> {
  await requireAdmin();
  try {
    const input = await parseInput(formData);
    const invalid = validate(input);
    if (invalid) return { ok: false, error: invalid };
    const product = await createProduct(input);
    revalidateCatalog(product.id);
    return { ok: true, id: product.id, message: `“${product.name}” added.` };
  } catch (err) {
    console.error("[createProductAction]", err instanceof Error ? err.message : err);
    return { ok: false, error: toMessage(err) };
  }
}

export async function updateProductAction(formData: FormData): Promise<ProductActionResult> {
  await requireAdmin();
  const id = text(formData.get("id"));
  if (!id) return { ok: false, error: "Missing product identifier." };
  try {
    const existing = await getProductById(id);
    if (!existing) {
      return { ok: false, error: "That product is no longer in the catalog. Reload and try again." };
    }
    const input = await parseInput(formData, existing);
    const invalid = validate(input);
    if (invalid) return { ok: false, error: invalid };
    const updated = await updateProduct(id, input);
    if (!updated) {
      return { ok: false, error: "That product could not be saved. Reload and try again." };
    }
    revalidateCatalog(id);
    return { ok: true, id, message: "Changes saved." };
  } catch (err) {
    console.error("[updateProductAction]", err instanceof Error ? err.message : err);
    return { ok: false, error: toMessage(err) };
  }
}

/**
 * Delete reports its outcome instead of pretending: a product that has ever
 * been ordered cannot be deleted (OrderItem is a RESTRICT relation) — the
 * dialog keeps that message on screen and points at "Hide" instead.
 */
export async function deleteProductAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = text(formData.get("id"));
  if (!id) return { ok: false, error: "Missing product identifier." };
  const outcome = await deleteProduct(id);
  switch (outcome) {
    case "deleted":
      revalidateCatalog(id);
      return { ok: true, message: "Product deleted." };
    case "referenced":
      return {
        ok: false,
        error:
          "This product appears on existing orders, so it cannot be deleted. Hide it from the shop instead — order history stays intact.",
      };
    case "missing":
      return { ok: false, error: "That product no longer exists." };
    default:
      return { ok: false, error: "That product could not be deleted. Reload and try again." };
  }
}

/** Show / hide on the shop. Reversible, so no confirmation required. */
export async function setProductActiveAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = text(formData.get("id"));
  const active = text(formData.get("active")) === "1";
  if (!id) return { ok: false, error: "Missing product identifier." };
  const updated = await setProductActive(id, active);
  if (!updated) return { ok: false, error: "That product no longer exists." };
  revalidateCatalog(id);
  return { ok: true, message: active ? `“${updated.name}” is now visible on the shop.` : `“${updated.name}” hidden from the shop.` };
}

// ---------------------------------------------------------------------------
// Inventory — bulk stock update (the only stock entry point for /admin/inventory)

export interface BulkStockUpdateItem {
  id: string;
  stock: number;
}

export type BulkStockResult =
  | { ok: true; updatedCount: number }
  | { ok: false; error: string };

/**
 * Writes STOCK ONLY. `bulkSetProductStock` takes an `active` flag as well,
 * so each product's current value is read and passed straight back — the
 * flag is preserved, never toggled here. Nothing else on the row is
 * touched, and none of the checkout stock-decrement paths are involved.
 */
export async function bulkUpdateStockAction(updates: BulkStockUpdateItem[]): Promise<BulkStockResult> {
  await requireAdmin();

  if (!Array.isArray(updates) || updates.length === 0) {
    return { ok: false, error: "No changes provided to save." };
  }

  const validated: { id: string; stock: number }[] = [];
  for (const item of updates) {
    if (!item || typeof item.id !== "string" || !item.id.trim()) {
      return { ok: false, error: "Invalid product identifier encountered." };
    }
    const num = Number(item.stock);
    if (!Number.isInteger(num) || num < 0 || num > MAX_STOCK) {
      return {
        ok: false,
        error: `Invalid stock value "${item.stock}" for product "${item.id}". Stock must be a whole number between 0 and ${MAX_STOCK.toLocaleString("en-IN")}.`,
      };
    }
    validated.push({ id: item.id.trim(), stock: num });
  }

  try {
    const current = await getProductsByIds(validated.map((u) => u.id));
    const activeById = new Map(current.map((p) => [p.id, p.active]));

    const missing = validated.filter((u) => !activeById.has(u.id));
    if (missing.length > 0) {
      return {
        ok: false,
        error: `No longer in the catalog: ${missing.map((m) => m.id).join(", ")}. Reload the page and try again.`,
      };
    }

    const updatedCount = await bulkSetProductStock(
      validated.map((u) => ({
        id: u.id,
        stock: u.stock,
        active: activeById.get(u.id) as boolean,
      }))
    );

    revalidateCatalog();
    for (const u of validated) revalidatePath(`/product/${u.id}`);
    return { ok: true, updatedCount };
  } catch (err: unknown) {
    console.error("[bulkUpdateStockAction] Error updating stock:", err);
    return { ok: false, error: "Failed to update stock in database. Please try again." };
  }
}
