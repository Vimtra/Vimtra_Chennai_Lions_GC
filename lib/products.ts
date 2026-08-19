import rawProducts from "@/data/products.json";

/**
 * Product schema (see CLAUDE.md → Products & Merchandising Data Model).
 * Pure types + helpers + the seed catalog. The *mutable* catalog (with admin
 * CRUD) lives in lib/db.ts, which seeds itself from SEED_PRODUCTS here.
 */
export interface Product {
  id: string; // URL-friendly slug, e.g. "tshirt-pride"
  name: string;
  cat: string; // category, e.g. "Apparel"
  price: number; // integer INR
  glyph: string; // 3-letter abbreviation
  img?: string; // optional mockup; falls back to team logo
  range: string; // corporate bulk quantities
  desc: string;
}

/** Centered fallback logo used when a product has no custom image. */
export const FALLBACK_LOGO = "/assets/logo-lion.png";

/**
 * Normalize a stored image path (e.g. "assets/prod-tshirt.png") to a
 * Next.js public path ("/assets/prod-tshirt.png"). Empty/omitted → undefined.
 */
export function normalizeImg(img?: string): string | undefined {
  if (!img) return undefined;
  if (img.startsWith("http") || img.startsWith("/")) return img;
  return "/" + img.replace(/^\.?\/?/, "");
}

/** Immutable seed catalog, normalized from data/products.json. */
export const SEED_PRODUCTS: Product[] = (rawProducts as Product[]).map((p) => ({
  ...p,
  img: normalizeImg(p.img),
}));

/** Resolve the image to render for a product (custom mockup or fallback logo). */
export function productImage(p: Product): string {
  return p.img || FALLBACK_LOGO;
}

/** Format an integer rupee amount the Indian way, e.g. 6000 → "₹6,000". */
export function inr(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}
