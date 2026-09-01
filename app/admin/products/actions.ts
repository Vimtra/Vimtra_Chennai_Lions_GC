"use server";

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
  // The admin explicitly cleared the image. Without this the current value
  // was always echoed back, so an image could be replaced but never removed.
  const removeImage = String(formData.get("removeImage") ?? "") === "1";

  let img = removeImage ? undefined : currentImg || undefined;

  if (upload instanceof File && upload.size > 0) {
    if (upload.size > 5 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(upload.type)) {
      throw new Error("Please upload a JPG, PNG, WebP or AVIF image under 5 MB.");
    }
    const extension = upload.type === "image/jpeg" ? "jpg" : upload.type.split("/")[1];
    const fileName = `${randomUUID()}.${extension}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    try {
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, fileName), Buffer.from(await upload.arrayBuffer()));
    } catch (err) {
      // Surfaces as the form's error state instead of a raw fs code. This is
      // also what a read-only filesystem looks like — see the deployment note
      // above `revalidateCatalog`.
      console.error("[parseInput] image write failed:", err);
      throw new Error(
        "The image could not be saved to storage. The product was not changed."
      );
    }
    // A fresh upload wins over a pending removal.
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

/**
 * IMAGE STORAGE — uses the upload system that already exists here: the file
 * is written to `public/uploads/` (git-ignored) and the product stores the
 * `/uploads/<uuid>.<ext>` path. No new storage architecture was introduced.
 *
 * DEPLOYMENT CAVEAT: this writes to the app's own filesystem, which works in
 * local dev and on a persistent server, but NOT on Vercel — its filesystem is
 * read-only apart from `/tmp`, and `/tmp` does not survive between
 * invocations. CLAUDE.md names Vercel as the target, so uploads will fail
 * there until this is pointed at blob storage (Vercel Blob, S3, Cloudinary).
 * Failures now surface as a clear form error rather than a raw fs code, and
 * the product is left unchanged when a write fails.
 */

/** Refresh every surface that reads the catalog. */
function revalidateCatalog(id?: string) {
  revalidatePath("/shop");
  revalidatePath("/admin/products");
  // The inventory manager lists the same catalog and deletes from it, but was
  // missing here — so a delete made on /admin/inventory left its own table
  // showing the row it had just removed.
  revalidatePath("/admin/inventory");
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

/**
 * Create/update outcome.
 *
 * These used to end in `redirect("/admin/products")`. A redirect throws
 * NEXT_REDIRECT, which a modal calling the action cannot tell apart from a
 * genuine failure — so there was no way to show a loading, error or success
 * state. They now report the outcome and let the caller decide: the modal
 * closes and the revalidated list refreshes underneath it, and the
 * standalone edit page navigates itself.
 *
 * The data logic is unchanged — same `parseInput`, same `createProduct` /
 * `updateProduct`, same `revalidateCatalog`.
 */
export type ProductActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

/** Server-side guard for the two fields the form marks required. */
function validate(input: ProductInput): string | null {
  if (!input.name) return "Product name is required.";
  if (!input.cat) return "Category is required.";
  return null;
}

function toMessage(err: unknown): string {
  // parseInput throws a written, user-facing message for a bad upload.
  if (err instanceof Error && err.message) return err.message;
  return "Something went wrong. Please try again.";
}

export async function createProductAction(
  formData: FormData
): Promise<ProductActionResult> {
  await requireAdmin();
  try {
    const input = await parseInput(formData);
    const invalid = validate(input);
    if (invalid) return { ok: false, error: invalid };

    const product = await createProduct(input);
    revalidateCatalog(product.id);
    return { ok: true, id: product.id };
  } catch (err) {
    console.error("[createProductAction]", err);
    return { ok: false, error: toMessage(err) };
  }
}

export async function updateProductAction(
  formData: FormData
): Promise<ProductActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { ok: false, error: "Missing product identifier." };

  try {
    const input = await parseInput(formData);
    const invalid = validate(input);
    if (invalid) return { ok: false, error: invalid };

    const updated = await updateProduct(id, input);
    if (!updated) {
      return {
        ok: false,
        error: "That product is no longer in the catalog. Reload and try again.",
      };
    }
    revalidateCatalog(id);
    return { ok: true, id };
  } catch (err) {
    console.error("[updateProductAction]", err);
    return { ok: false, error: toMessage(err) };
  }
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await deleteProduct(id);
  revalidateCatalog(id);
  revalidatePath("/admin/products");
}
