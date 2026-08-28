import type {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
} from "@prisma/client";

/**
 * Pure formatters for the commerce surface — safe on server and client.
 * Kept out of lib/orders.ts so client components can import them without
 * pulling in the server-only Prisma surface.
 */

/** Human-friendly label per order status. */
export function orderStatusLabel(s: OrderStatus): string {
  switch (s) {
    case "PENDING":
      return "Pending";
    case "PAYMENT_PENDING":
      return "Awaiting payment";
    case "PAID":
      return "Paid";
    case "PROCESSING":
      return "Processing";
    case "SHIPPED":
      return "Shipped";
    case "DELIVERED":
      return "Delivered";
    case "CANCELLED":
      return "Cancelled";
    case "REFUNDED":
      return "Refunded";
  }
}

export function paymentStatusLabel(s: PaymentStatus): string {
  switch (s) {
    case "UNPAID":
      return "Unpaid";
    case "PENDING":
      return "Payment pending";
    case "PAID":
      return "Paid";
    case "FAILED":
      return "Payment failed";
    case "REFUNDED":
      return "Refunded";
  }
}

export function paymentMethodLabel(m: PaymentMethod): string {
  switch (m) {
    case "COD":
      return "Cash on delivery";
    case "OFFLINE_INVOICE":
      return "Offline invoice (bank transfer)";
    case "ONLINE_TBD":
      return "Online payment (coming soon)";
  }
}

/** Tailwind-friendly background+colour tokens for status pills, without
 *  introducing new global CSS. Consumed inline via `style={...}` in cards. */
export function orderStatusStyle(s: OrderStatus): {
  background: string;
  color: string;
} {
  switch (s) {
    case "DELIVERED":
    case "PAID":
      return { background: "rgba(14,138,79,0.10)", color: "#0E8A4F" };
    case "SHIPPED":
      return { background: "rgba(196,32,42,0.10)", color: "#C4202A" };
    case "PROCESSING":
      return { background: "rgba(233,203,142,0.20)", color: "#3A1A06" };
    case "PENDING":
    case "PAYMENT_PENDING":
      return { background: "rgba(26,21,19,0.08)", color: "#1A1513" };
    case "CANCELLED":
    case "REFUNDED":
      return { background: "rgba(107,99,92,0.10)", color: "#6B635C" };
  }
}

export function paymentStatusStyle(s: PaymentStatus): {
  background: string;
  color: string;
} {
  switch (s) {
    case "PAID":
      return { background: "rgba(14,138,79,0.10)", color: "#0E8A4F" };
    case "PENDING":
      return { background: "rgba(233,203,142,0.20)", color: "#3A1A06" };
    case "FAILED":
      return { background: "rgba(196,32,42,0.10)", color: "#C4202A" };
    case "REFUNDED":
      return { background: "rgba(107,99,92,0.10)", color: "#6B635C" };
    default:
      return { background: "rgba(26,21,19,0.08)", color: "#1A1513" };
  }
}

/** "22 Aug 2026" — same locale rules used elsewhere in the site. */
export function formatOrderDate(d: Date | string | null | undefined): string {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return "";
  return `${dt.getUTCDate()} ${dt.toLocaleString("en-GB", {
    month: "short",
  })} ${dt.getUTCFullYear()}`;
}

/** Generate a human-friendly order number: "VCL-YYMMDD-XXXXX" where the
 *  suffix is 5 uppercase alphanumerics. Rare enough to not need a DB
 *  counter; still lookup-friendly by day for the ops team. */
export function generateOrderNumber(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const yymmdd =
    pad(now.getUTCFullYear() % 100) +
    pad(now.getUTCMonth() + 1) +
    pad(now.getUTCDate());
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no O/0/I/1
  let suffix = "";
  for (let i = 0; i < 5; i++) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `VCL-${yymmdd}-${suffix}`;
}
