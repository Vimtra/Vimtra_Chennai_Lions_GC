import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import type { OrderReceiptResult } from "@/lib/orders";
import {
  contactConfirmationEmail,
  contactNotificationEmail,
  type ContactConfirmationInput,
  type ContactNotificationInput,
} from "@/lib/email-templates";

/**
 * Email transport.
 *
 * Two independent senders live in this file, gated separately, on
 * purpose:
 *
 *   sendOrderReceipt — commerce. Untouched by this pass (and by the
 *                      Resend pass before it): still gated by
 *                      isConfigured() (SMTP_HOST + MAIL_FROM), still
 *                      deliberately unwired — both of its branches
 *                      return `sent: false`, so it never actually sends
 *                      regardless of what those two vars are set to.
 *                      Not in scope here; see the comment on the
 *                      function itself.
 *
 *   sendContact*      — the /contact form. Gmail SMTP via Nodemailer,
 *                      gated by isContactSmtpConfigured() (SMTP_HOST +
 *                      SMTP_USER + SMTP_PASSWORD + MAIL_FROM).
 *
 * SMTP_HOST and MAIL_FROM are read by BOTH gates above — unavoidable
 * given sendOrderReceipt predates this file's Gmail wiring and already
 * used those two names. This changes nothing about sendOrderReceipt's
 * behaviour: it is hardcoded to return `sent: false` on every path, so
 * whichever branch its isConfigured() check takes, no email leaves this
 * process from that function. The contact form's own gate additionally
 * requires SMTP_USER + SMTP_PASSWORD, which sendOrderReceipt never
 * inspects — the two remain functionally independent.
 *
 * Both senders share one rule: without their required env vars, sending
 * is skipped — never attempted, never thrown — and the caller gets back
 * a typed `not-configured` result. For /contact that is deliberate: a
 * missing mail transport must never be the reason an enquiry that
 * already saved to the database looks like it failed.
 *
 * Required env vars for the contact form (documented in .env.example,
 * configured for Gmail SMTP):
 *   SMTP_HOST             — smtp.gmail.com
 *   SMTP_PORT             — 465 (implicit TLS)
 *   SMTP_SECURE           — true for port 465
 *   SMTP_USER             — the Gmail address sending the mail
 *   SMTP_PASSWORD         — a Gmail *App Password*, never the account's
 *                          normal login password
 *   MAIL_FROM             — the From: address; normally same as SMTP_USER
 *   CONTACT_NOTIFY_EMAIL  — where enquiry notifications go; falls back
 *                          to ADMIN_EMAIL when unset
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
 *  order.
 *
 *  Deliberately untouched by the Gmail SMTP migration below: this
 *  function and its permanently-unwired behaviour are commerce, not
 *  contact-form, and out of scope here. It reads the same SMTP_HOST /
 *  MAIL_FROM names the contact form now uses for real — see the note
 *  at the top of this file for why that is safe: both of its branches
 *  below return `sent: false`, so nothing here ever actually sends. */
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

// ---------------------------------------------------------------------------
// Contact form — enquiry confirmation (to the sender) and notification
// (to the franchise), sent via Gmail SMTP. Templates live in
// lib/email-templates.ts; this file only handles transport.

export type MailResult =
  | { sent: true; provider: string }
  | { sent: false; reason: "not-configured" | "error"; detail?: string };

/** Gmail requires authentication — an unauthenticated relay is not a
 *  supported mode here, unlike the order-receipt stub's looser check.
 *  All four must be present or sending is skipped. */
function isContactSmtpConfigured(): boolean {
  const host = (process.env.SMTP_HOST ?? "").trim();
  const user = (process.env.SMTP_USER ?? "").trim();
  const pass = process.env.SMTP_PASSWORD ?? "";
  const from = (process.env.MAIL_FROM ?? "").trim();
  return Boolean(host && user && pass && from);
}

/**
 * The From: header Gmail SMTP actually accepts is the authenticated
 * account (SMTP_USER) or a verified alias of it — a MAIL_FROM that
 * differs risks an outright send rejection or a silent rewrite by
 * Gmail's own servers. MAIL_FROM is still the documented, expected
 * value (.env.example: "normally the same address as SMTP_USER"); this
 * only guards the case where an operator sets them to different
 * values, logging that mismatch — never the address values themselves,
 * never a credential — rather than letting sends fail unexplained.
 */
function resolveFromAddress(): string {
  const mailFrom = (process.env.MAIL_FROM ?? "").trim();
  const smtpUser = (process.env.SMTP_USER ?? "").trim();
  if (mailFrom && smtpUser && mailFrom !== smtpUser) {
    console.error(
      "[mail] MAIL_FROM does not match SMTP_USER — Gmail may reject or rewrite the sender; using SMTP_USER."
    );
    return smtpUser;
  }
  return mailFrom || smtpUser;
}

let cachedTransporter: Transporter | null = null;

/** One transporter per server process, built only once the contact
 *  form's SMTP config is confirmed present — never constructed (and so
 *  never validated) when it isn't. Defaults match Gmail's documented
 *  SMTP settings: port 465 with implicit TLS. */
function getContactTransporter(): Transporter {
  if (cachedTransporter) return cachedTransporter;
  const port = Number(process.env.SMTP_PORT ?? 465);
  const secure = (process.env.SMTP_SECURE ?? "true").trim().toLowerCase() !== "false";
  cachedTransporter = nodemailer.createTransport({
    host: (process.env.SMTP_HOST ?? "").trim(),
    port,
    secure,
    auth: {
      user: (process.env.SMTP_USER ?? "").trim(),
      // Never logged — see sendMail's catch block below.
      pass: process.env.SMTP_PASSWORD ?? "",
    },
  });
  return cachedTransporter;
}

interface SendMailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
  /** The confirmation email sets this to the franchise's own address; the
   *  admin notification sets it to the enquirer's — see each sender
   *  function below for why. */
  replyTo?: string;
}

/** Shared SMTP send path. Never throws — every failure, auth or
 *  network, returns a typed `error` result instead. Never logs the
 *  message body, recipient, the App Password, or any other submitted
 *  or secret field: only the transport's own error message (e.g.
 *  "Invalid login: 535-5.7.8 Username and Password not accepted"),
 *  which Gmail's SMTP server itself never echoes the password back
 *  into. The visitor never sees this — app/contact/actions.ts always
 *  reports success once the database write has succeeded, regardless
 *  of what happens here. */
async function sendMail(opts: SendMailOptions): Promise<MailResult> {
  if (!isContactSmtpConfigured()) return { sent: false, reason: "not-configured" };
  try {
    await getContactTransporter().sendMail({
      from: resolveFromAddress(),
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
      replyTo: opts.replyTo,
    });
    return { sent: true, provider: "smtp" };
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Unknown transport error.";
    console.error("[mail] send failed:", detail);
    return { sent: false, reason: "error", detail };
  }
}

export type ContactEnquiryMailInput = ContactNotificationInput;

/**
 * Email #1 — to the person who submitted the form. See
 * lib/email-templates.ts's contactConfirmationEmail for the actual
 * content; this function is transport only. Reply-To is the franchise's
 * own sending address (resolveFromAddress() — same guarantee as the
 * From: header), so a visitor who hits Reply reaches a real inbox
 * rather than bouncing off a no-reply-shaped address.
 */
export async function sendContactConfirmationToUser(
  input: ContactEnquiryMailInput
): Promise<MailResult> {
  const { subject, text, html } = contactConfirmationEmail(
    input as ContactConfirmationInput
  );
  return sendMail({ to: input.email, subject, text, html, replyTo: resolveFromAddress() });
}

/**
 * Email #2 — to the franchise. Recipient is CONTACT_NOTIFY_EMAIL,
 * falling back to ADMIN_EMAIL when unset — unchanged resolution.
 * `replyTo` is set to the enquirer so a reply from any mail client goes
 * straight back to them.
 */
export async function sendContactNotificationToAdmin(
  input: ContactEnquiryMailInput
): Promise<MailResult> {
  const to = (process.env.CONTACT_NOTIFY_EMAIL ?? process.env.ADMIN_EMAIL ?? "").trim();
  if (!to) {
    return {
      sent: false,
      reason: "not-configured",
      detail: "Neither CONTACT_NOTIFY_EMAIL nor ADMIN_EMAIL is set.",
    };
  }
  const { subject, text, html } = contactNotificationEmail(input);
  return sendMail({ to, subject, text, html, replyTo: input.email });
}
