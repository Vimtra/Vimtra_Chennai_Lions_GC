"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { requireAdmin } from "@/lib/auth";
import { createProduct, updateProduct, deleteProduct, type ProductInput } from "@/lib/db";

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
