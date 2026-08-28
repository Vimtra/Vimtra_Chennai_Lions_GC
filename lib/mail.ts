import "server-only";
import type { OrderReceiptResult } from "@/lib/orders";

/**
 * Email transport stub.
 *
 * Phase 5.3 requires an env-gated receipt sender that MUST NOT block or
 * throw when transport env vars are absent. Today's implementation is a
 * no-op: when SMTP_HOST is missing (the operator's stated signal), the
 * receipt is skipped silently and the caller receives a typed
 * `not-configured` result. When SMTP_HOST is present but no real
 * transport client has been wired yet, we still return "not-configured"
 * with a clarifying detail — a future implementation swaps in nodemailer
 * or Resend without changing any caller.
 *
 * Deliberately no runtime dependency on nodemailer/Resend today — keeps
 * the bundle lean and avoids importing a transport we can't actually
 * exercise until the Phase 5.6 production credentials land.
 */

export interface OrderReceiptInput {
  to: string;
  orderNumber: string;
  totalRupees: number;
  itemCount: number;
  contactName?: string;
}

function isConfigured(): boolean {
  const host = (process.env.SMTP_HOST ?? "").trim();
  const from = (process.env.MAIL_FROM ?? "").trim();
  return Boolean(host && from);
}

/** Send the buyer their order-receipt email. Returns a typed result;
 *  never throws. Callers should log the result at info level and
 *  continue their transaction — receipt failure MUST NOT abort the
 *  order. */
export async function sendOrderReceipt(
  input: OrderReceiptInput
): Promise<OrderReceiptResult> {
  if (!isConfigured()) {
    return { sent: false, reason: "not-configured" };
  }
  // Transport not wired yet — the env is present but we deliberately
  // haven't imported a live SMTP client. Once nodemailer / Resend
  // lands, replace the body of this branch. The typed result shape
  // stays stable so no caller needs to change.
  return {
    sent: false,
    reason: "not-configured",
    detail: "SMTP_HOST is set but no transport client is wired in this build yet.",
  };
}
