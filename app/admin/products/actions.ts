"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createProduct, updateProduct, deleteProduct, type ProductInput } from "@/lib/db";

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
