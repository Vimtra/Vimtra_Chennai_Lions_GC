/**
 * Pure order-total calculator. Kept independent so /cart, /checkout, and
 * the server-side placeOrderAction all compute the same numbers from the
 * same inputs. Reading a config env at import time makes it trivial to
 * override thresholds via .env without a code change.
 *
 * All values are integer INR (whole rupees) — same convention as the
 * Product.price and Order.* fields in Prisma.
 */

const num = (v: string | undefined, fallback: number): number => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

// Env overrides (safe fallbacks match the pre-M5 /cart page's numbers).
export const SHIPPING_FLAT_INR = num(process.env.SHIPPING_FLAT_INR, 149);
export const SHIPPING_FREE_ABOVE_INR = num(
  process.env.SHIPPING_FREE_ABOVE_INR,
  2000
);
/** GST rate as a decimal — 0.18 = 18%. */
export const GST_RATE = num(process.env.GST_RATE, 18) / 100;

export interface OrderableLine {
  price: number; // unit price, integer INR
  qty: number; // integer >= 1
}

export interface OrderTotals {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

/** Compute subtotal / shipping / GST / total from a list of order lines. */
export function computeTotals(lines: OrderableLine[]): OrderTotals {
  const subtotal = lines.reduce(
    (sum, l) => sum + Math.max(0, Math.round(l.price)) * Math.max(0, Math.round(l.qty)),
    0
  );
  const shipping =
    subtotal === 0
      ? 0
      : subtotal >= SHIPPING_FREE_ABOVE_INR
        ? 0
        : SHIPPING_FLAT_INR;
  const tax = Math.round(subtotal * GST_RATE);
  const total = subtotal + shipping + tax;
  return { subtotal, shipping, tax, total };
}

/** Human-friendly explainer used on the cart + checkout summary panels. */
export function shippingExplainer(subtotal: number): string {
  if (subtotal === 0) return `Free over ₹${SHIPPING_FREE_ABOVE_INR.toLocaleString("en-IN")}`;
  if (subtotal >= SHIPPING_FREE_ABOVE_INR) return "Free";
  return `₹${SHIPPING_FLAT_INR.toLocaleString("en-IN")}`;
}
