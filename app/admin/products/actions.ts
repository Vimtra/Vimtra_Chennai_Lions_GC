"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { requireAdmin } from "@/lib/auth";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByIds,
  bulkSetProductStock,
  type ProductInput,
} from "@/lib/db";

async function parseInput(formData: FormData): Promise<ProductInput> {
  const upload = formData.get("image");
  const currentImg = String(formData.get("currentImg") ?? "").trim();
  let img = currentImg || undefined;
  if (upload instanceof File && upload.size > 0) {
    if (upload.size > 5 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(upload.type)) {
      throw new Error("Please upload a JPG, PNG, WebP or AVIF image under 5 MB.");
    }
    const extension = upload.type === "image/jpeg" ? "jpg" : upload.type.split("/")[1];
    const fileName = `${randomUUID()}.${extension}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, fileName), Buffer.from(await upload.arrayBuffer()));
    img = `/uploads/${fileName}`;
  }
  return {
    name: String(formData.get("name") ?? "").trim(),
    cat: String(formData.get("cat") ?? "").trim(),
    price: Math.max(0, Math.round(Number(formData.get("price")) || 0)),
    glyph: String(formData.get("glyph") ?? "").trim().toUpperCase().slice(0, 3),
    img,
    images: img ? [img] : [],
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

export interface BulkStockUpdateItem {
  id: string;
  stock: number;
}

export type BulkStockResult =
  | { ok: true; updatedCount: number }
  | { ok: false; error: string };

/**
 * Bulk stock update for the inventory manager (/admin/inventory).
 *
 * Authorization is enforced server-side via requireAdmin() — the client
 * component cannot reach the database on its own.
 *
 * Scope is deliberately narrow: this writes STOCK ONLY. `bulkSetProductStock`
 * takes an `active` flag as well, so each product's current `active` value is
 * read and passed straight back through — the flag is preserved, never
 * toggled here. Nothing else on the product row is touched, and none of the
 * checkout/order stock-decrement paths are involved.
 */
export async function bulkUpdateStockAction(
  updates: BulkStockUpdateItem[]
): Promise<BulkStockResult> {
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
    if (!Number.isInteger(num) || num < 0) {
      return {
        ok: false,
        error: `Invalid stock value "${item.stock}" for product "${item.id}". Stock must be a non-negative whole number.`,
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
        error: `No longer in the catalog: ${missing
          .map((m) => m.id)
          .join(", ")}. Reload the page and try again.`,
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
    return {
      ok: false,
      error: "Failed to update stock in database. Please try again.",
    };
  }
}

export async function createProductAction(formData: FormData) {
  await requireAdmin();
  const product = await createProduct(await parseInput(formData));
  revalidateCatalog(product.id);
  redirect("/admin/products");
}

export async function updateProductAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await updateProduct(id, await parseInput(formData));
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
