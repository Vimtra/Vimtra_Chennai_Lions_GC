import rawProducts from "@/data/products.json";
import { webSrc } from "@/lib/image-src";

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
  img?: string; // legacy single-image field kept for M0-M4 compatibility
  range: string; // corporate bulk quantities (legacy, retained for display)
  desc: string;
  // ------- M5 additions -------
  /** Available inventory. 0 = out of stock, hides Add-to-Cart on the buyer side. */
  stock: number;
  /** false hides the product from the public /shop and /product/[id] pages. */
  active: boolean;
  /** Ordered image URLs; first entry is the primary/hero image. Falls back to `img`. */
  images: string[];
  /** Shipping weight in grams. Optional. */
  weightGrams?: number;
  /** Optional stock-keeping unit / barcode. */
  sku?: string;
}

/** Centered fallback logo used when a product has no custom image. */
export const FALLBACK_LOGO = "/assets/logo-lion.png";

/**
 * Normalize a stored image path (e.g. "assets/prod-tshirt.png") to a
 * Next.js public path ("/assets/prod-tshirt-web.jpg"). Empty/omitted → undefined.
 */
export function normalizeImg(img?: string): string | undefined {
  if (!img) return undefined;
  if (img.startsWith("http") || img.startsWith("/")) return img;
  return "/" + img.replace(/^\.?\/?/, "");
}

/** Immutable seed catalog, normalized from data/products.json.
 *  M5 fields default to safe values so the type stays consistent even
 *  though `products.json` was written pre-M5. Backfill in the DB uses
 *  the same defaults + a stock preset of 25 (approved by operator). */
export const SEED_PRODUCTS: Product[] = (rawProducts as Product[]).map((p) => ({
  ...p,
  img: normalizeImg(p.img),
  stock: p.stock ?? 25,
  active: p.active ?? true,
  images: p.images ?? [],
  weightGrams: p.weightGrams,
  sku: p.sku,
}));

/** Resolve the image to render for a product. Priority:
 *  1. First entry in `images[]` (M5 preferred),
 *  2. Legacy `img` (M0-M4),
 *  3. Franchise fallback logo. */
export function productImage(p: Pick<Product, "images" | "img">): string {
  // Stored paths may predate the optimized derivatives; resolve them here so
  // every surface (shop, product, cart, order) gets the light version.
  if (p.images && p.images.length > 0) return webSrc(p.images[0]);
  return webSrc(p.img) || FALLBACK_LOGO;
}

/** Convenience: is this product buyable right now? */
export function isBuyable(p: Pick<Product, "active" | "stock">): boolean {
  return p.active && p.stock > 0;
}

/** Format an integer rupee amount the Indian way, e.g. 6000 → "₹6,000". */
export function inr(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}
