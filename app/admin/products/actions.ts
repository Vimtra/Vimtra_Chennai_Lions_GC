"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createProduct, updateProduct, deleteProduct, type ProductInput } from "@/lib/db";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductsStock,
  type ProductInput,
} from "@/lib/db";

function parseInput(formData: FormData): ProductInput {
  return {
    name: String(formData.get("name") ?? "").trim(),
    cat: String(formData.get("cat") ?? "").trim(),
    price: Math.max(0, Math.round(Number(formData.get("price")) || 0)),
    glyph: String(formData.get("glyph") ?? "").trim().toUpperCase().slice(0, 3),
    img: String(formData.get("img") ?? "").trim() || undefined,
    range: String(formData.get("range") ?? "").trim(),
    desc: String(formData.get("desc") ?? "").trim(),
  };
}

/** Refresh every surface that reads the catalog. */
function revalidateCatalog(id?: string) {
  revalidatePath("/shop");
  revalidatePath("/admin/products");
  revalidatePath("/");
  if (id) revalidatePath(`/product/${id}`);
}

export async function createProductAction(formData: FormData) {
  await requireAdmin();
  const product = await createProduct(parseInput(formData));
  revalidateCatalog(product.id);
  redirect("/admin/products");
}

export async function updateProductAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await updateProduct(id, parseInput(formData));
  revalidateCatalog(id);
  redirect("/admin/products");
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await deleteProduct(id);
  revalidateCatalog(id);
  revalidatePath("/admin/products");
}

export interface BulkStockUpdateItem {
  id: string;
  stock: number;
}

export type BulkStockResult =
  | { ok: true; updatedCount: number }
  | { ok: false; error: string };

/**
 * Server action for updating stock across multiple products in bulk.
 * Enforces admin authorization via requireAdmin() server-side.
 */
export async function bulkUpdateStockAction(
  updates: BulkStockUpdateItem[]
): Promise<BulkStockResult> {
  await requireAdmin();

  if (!Array.isArray(updates) || updates.length === 0) {
    return { ok: false, error: "No changes provided to save." };
  }

  const validUpdates: { id: string; stock: number }[] = [];
  for (const item of updates) {
    if (!item || typeof item.id !== "string" || !item.id.trim()) {
      return { ok: false, error: "Invalid product identifier encountered." };
    }
    const num = Number(item.stock);
    if (!Number.isInteger(num) || num < 0) {
      return {
        ok: false,
        error: `Invalid stock value "${item.stock}" for product "${item.id}". Stock must be a non-negative whole integer.`,
      };
    }
    validUpdates.push({ id: item.id.trim(), stock: num });
  }

  try {
    const updatedCount = await updateProductsStock(validUpdates);
    revalidateCatalog();
    for (const item of validUpdates) {
      revalidatePath(`/product/${item.id}`);
    }
    return { ok: true, updatedCount };
  } catch (err: unknown) {
    console.error("[bulkUpdateStockAction] Error updating stock:", err);
    return {
      ok: false,
      error: "Failed to update stock in database. Please try again.",
    };
  }
}
