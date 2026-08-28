import "server-only";
import { prisma } from "@/lib/prisma";
import { normalizeImg, type Product } from "@/lib/products";

/**
 * Catalog data layer — Postgres via Prisma. Used by both the public store
 * (/shop, /product/[id]) and the admin Product Manager. Seed with
 * `npm run db:seed` (prisma/seed.ts).
 */

// Row type reflects the DB shape (nullable img/sku/weightGrams, present M5 columns).
type Row = {
  id: string;
  name: string;
  cat: string;
  price: number;
  glyph: string;
  img: string | null;
  range: string;
  desc: string;
  stock: number;
  active: boolean;
  images: string[];
  weightGrams: number | null;
  sku: string | null;
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
    stock: row.stock,
    active: row.active,
    images: row.images ?? [],
    weightGrams: row.weightGrams ?? undefined,
    sku: row.sku ?? undefined,
  };
}

/**
 * Product create/update input. All M5-additive fields are optional so the
 * pre-M5 admin form (which doesn't submit stock/active/images/weight/sku)
 * continues to work during Phase 5.1. Phase 5.5 will extend the admin
 * form to surface every field. Server-side defaults applied here:
 *   stock       -> 0    (new admin creations are out-of-stock until backfilled;
 *                        errs on the safe side rather than accidentally
 *                        overselling)
 *   active      -> true (new products are visible unless explicitly hidden)
 *   images      -> []
 *   weightGrams -> null
 *   sku         -> null
 */
export type ProductInput = Omit<
  Product,
  | "id"
  | "img"
  | "images"
  | "weightGrams"
  | "sku"
  | "stock"
  | "active"
> & {
  img?: string;
  images?: string[];
  weightGrams?: number;
  sku?: string;
  stock?: number;
  active?: boolean;
};

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

/** Public listing — hides inactive rows. Admin uses `listAllProducts`. */
export async function listProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: "asc" },
  });
  return rows.map(toProduct);
}

/** Admin listing — includes inactive/hidden rows. */
export async function listAllProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({ orderBy: { createdAt: "asc" } });
  return rows.map(toProduct);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const row = await prisma.product.findUnique({ where: { id } });
  return row ? toProduct(row) : undefined;
}

/** Fetch multiple products by id in one query. Used by the checkout
 *  action to lock down authoritative prices, stock, and images
 *  server-side (never trust the client cart's snapshot). */
export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const rows = await prisma.product.findMany({ where: { id: { in: ids } } });
  return rows.map(toProduct);
}

function normalizeImages(images?: string[]): string[] {
  if (!images || images.length === 0) return [];
  return images
    .map((s) => (typeof s === "string" ? s.trim() : ""))
    .filter(Boolean)
    .map((s) => normalizeImg(s) ?? s);
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
      stock: Math.max(0, Math.round(input.stock ?? 0)),
      active: input.active ?? true,
      images: normalizeImages(input.images),
      weightGrams: input.weightGrams ?? null,
      sku: input.sku ?? null,
    },
  });
  return toProduct(row);
}

export async function updateProduct(
  id: string,
  input: ProductInput
): Promise<Product | undefined> {
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
        // Only touch M5 columns if the caller explicitly provided them.
        // Otherwise the pre-M5 admin form (which submits only 7 fields)
        // would silently reset stock to 0 and wipe images/sku/weightGrams
        // on every save. `createProduct` still applies safe defaults for
        // brand-new rows — that behaviour is intentional and unchanged.
        ...(input.stock !== undefined
          ? { stock: Math.max(0, Math.round(input.stock)) }
          : {}),
        ...(input.active !== undefined ? { active: input.active } : {}),
        ...(input.images !== undefined
          ? { images: normalizeImages(input.images) }
          : {}),
        ...(input.weightGrams !== undefined
          ? { weightGrams: input.weightGrams }
          : {}),
        ...(input.sku !== undefined ? { sku: input.sku } : {}),
      },
    });
    return toProduct(row);
  } catch {
    return undefined;
  }
}

/**
 * Update ONLY the stock + active flag on many products in a single Postgres
 * transaction. Never touches name/price/images/sku/weight/desc — safe to
 * call from the inventory manager without stepping on metadata edits
 * happening elsewhere. Returns the number of rows written.
 *
 * Callers are expected to have validated inputs already (integer, non-
 * negative, upper-bound); this function coerces defensively regardless.
 */
export async function bulkSetProductStock(
  updates: { id: string; stock: number; active: boolean }[]
): Promise<number> {
  if (updates.length === 0) return 0;
  const rows = await prisma.$transaction(
    updates.map((u) =>
      prisma.product.update({
        where: { id: u.id },
        data: {
          stock: Math.max(0, Math.round(u.stock)),
          active: u.active,
        },
        select: { id: true },
      })
    )
  );
  return rows.length;
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    await prisma.product.delete({ where: { id } });
    return true;
  } catch {
    // Product.delete may fail with a FK RESTRICT if there are OrderItems
    // referencing it — that's intentional. The caller (admin form) should
    // present "toggle active" as the safer alternative.
    return false;
  }
}
