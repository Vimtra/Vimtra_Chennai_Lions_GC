import "server-only";
import { prisma } from "@/lib/prisma";
import { normalizeImg, type Product } from "@/lib/products";

/**
 * Catalog data layer — Postgres via Prisma. Used by both the public store
 * (/shop, /product/[id]) and the admin Product Manager. Seed with
 * `npm run db:seed` (prisma/seed.ts).
 */

type Row = {
  id: string;
  name: string;
  cat: string;
  price: number;
  glyph: string;
  img: string | null;
  range: string;
  desc: string;
};

function toProduct(row: Row): Product {
  return {
    id: row.id,
    name: row.name,
    cat: row.cat,
    price: row.price,
    glyph: row.glyph,
    img: row.img ?? undefined,
    range: row.range,
    desc: row.desc,
  };
}

export type ProductInput = Omit<Product, "id" | "img"> & { img?: string };

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "product"
  );
}

async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name);
  let id = base;
  let n = 2;
  while (await prisma.product.findUnique({ where: { id } })) id = `${base}-${n++}`;
  return id;
}

export async function listProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({ orderBy: { createdAt: "asc" } });
  return rows.map(toProduct);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const row = await prisma.product.findUnique({ where: { id } });
  return row ? toProduct(row) : undefined;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const id = await uniqueSlug(input.name);
  const row = await prisma.product.create({
    data: {
      id,
      name: input.name,
      cat: input.cat,
      price: input.price,
      glyph: input.glyph,
      img: normalizeImg(input.img) ?? null,
      range: input.range,
      desc: input.desc,
    },
  });
  return toProduct(row);
}

export async function updateProduct(id: string, input: ProductInput): Promise<Product | undefined> {
  try {
    const row = await prisma.product.update({
      where: { id },
      data: {
        name: input.name,
        cat: input.cat,
        price: input.price,
        glyph: input.glyph,
        img: normalizeImg(input.img) ?? null,
        range: input.range,
        desc: input.desc,
      },
    });
    return toProduct(row);
  } catch {
    return undefined;
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    await prisma.product.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
