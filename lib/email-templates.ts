import "server-only";

/**
 * Branded HTML/text fragments for outbound contact-form email.
 *
 * Kept separate from lib/mail.ts (transport: the SMTP client, the
 * not-configured gate, the actual send) and from app/contact/actions.ts
 * (the caller, which only ever sees `{subject, text, html}`). Neither of
 * those files should know what an email looks like; this is the one
 * place that does, so the branded layout is defined once and reused by
 * every template function below rather than inlined per-sender.
 *
 * Colours are the site's own tokens (app/globals.css --v-ink / --v-red /
 * --v-gold / --v-ivory), not invented for email — ink #0E0B0A, crimson
 * #BD2227, gold #B8904B, ivory #F5EFE4.
 *
 * Table-based markup throughout: flexbox/grid render unreliably across
 * mail clients (Outlook's Word engine in particular), so this uses the
 * same conservative structure transactional email always does. Every
 * user-supplied value is escaped with escapeHtml before interpolation —
 * this module trusts nothing it's handed.
 */

const INK = "#0E0B0A";
const CRIMSON = "#BD2227";
const GOLD = "#B8904B";
const IVORY = "#F5EFE4";
const MUTED = "#6B635C";
const FONT = "Arial, Helvetica, sans-serif";

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function nl2br(s: string): string {
  return escapeHtml(s).replace(/\n/g, "<br />");
}

export interface RenderedEmail {
  subject: string;
  text: string;
  html: string;
}

interface ShellOptions {
  /** Shown by mail clients as the inbox preview line; never visible in the body itself. */
  preview: string;
  eyebrow: string;
  bodyHtml: string;
}

/** The one layout every outbound email shares: ink header band, white
 *  card, ivory content well, plain-text footer. */
function emailShell({ preview, eyebrow, bodyHtml }: ShellOptions): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Vimtra Chennai Lions GC</title>
  </head>
  <body style="margin:0;padding:0;background:#EFEDE9;font-family:${FONT};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preview)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EFEDE9;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="background:${INK};padding:28px 32px;">
                <div style="font-family:${FONT};font-weight:700;font-size:11px;letter-spacing:2px;color:${GOLD};text-transform:uppercase;">
                  ${escapeHtml(eyebrow)}
                </div>
                <div style="margin-top:6px;font-family:${FONT};font-weight:800;font-size:19px;letter-spacing:0.5px;color:${IVORY};">
                  VIMTRA CHENNAI LIONS GC
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px;border-top:1px solid rgba(14,11,10,0.08);">
                <div style="font-family:${FONT};font-size:11.5px;color:${MUTED};letter-spacing:0.3px;">
                  Vimtra Chennai Lions GC &middot; AM Green IGPL &middot; Season 2026
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

// ---------------------------------------------------------------------------
// Email #1 — to the person who submitted the form.

export interface ContactConfirmationInput {
  name: string;
  category: string;
  message: string;
}

/**
 * Confirms receipt and echoes back what the visitor sent, so they have a
 * record of it. Carries nothing about how the franchise operates
 * internally — no admin address, no other enquiries, no internal id or
 * status.
 *
 * Deliberately transactional, not promotional: fixed subject, no CTA,
 * no external links or images, one short paragraph before the quoted
 * message. lib/mail.ts sets this email's Reply-To to the franchise's own
 * sending address, so — unlike the closing line this template used to
 * carry — a reply from the visitor does reach someone; the copy below
 * no longer tells them otherwise.
 */
export function contactConfirmationEmail(input: ContactConfirmationInput): RenderedEmail {
  const subject = "We received your enquiry — Vimtra Chennai Lions GC";

  const text = [
    `Hi ${input.name},`,
    "",
    `We received your ${input.category} enquiry to the Vimtra Chennai Lions GC. The franchise will be in touch within two working days.`,
    "",
    "What you sent us:",
    `"${input.message}"`,
    "",
    "— Vimtra Chennai Lions GC",
    "AM Green IGPL · Season 2026",
  ].join("\n");

  const bodyHtml = `
    <p style="margin:0 0 16px;font-family:${FONT};font-size:15px;line-height:1.6;color:${INK};">
      Hi ${escapeHtml(input.name)},
    </p>
    <p style="margin:0 0 20px;font-family:${FONT};font-size:15px;line-height:1.6;color:${INK};">
      We received your
      <strong style="color:${CRIMSON};">${escapeHtml(input.category)}</strong> enquiry to the
      Vimtra Chennai Lions GC. The franchise will be in touch within two working days.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${IVORY};border-radius:10px;">
      <tr>
        <td style="padding:16px 18px;">
          <div style="font-family:${FONT};font-weight:700;font-size:10px;letter-spacing:1.4px;color:${GOLD};text-transform:uppercase;margin-bottom:8px;">
            Your message
          </div>
          <div style="font-family:${FONT};font-size:14px;line-height:1.65;color:${MUTED};">
            ${nl2br(input.message)}
          </div>
        </td>
      </tr>
    </table>`;

  const html = emailShell({
    preview: "We received your enquiry — the franchise will be in touch soon.",
    eyebrow: "Contact enquiry confirmation",
    bodyHtml,
  });

  return { subject, text, html };
}

// ---------------------------------------------------------------------------
// Welcome email — sent once, the moment a new account is created (never on
// a routine sign-in — see app/(auth)/actions.ts's signUp for the call site).

export interface WelcomeEmailInput {
  name: string;
  email: string;
  /** Host only (no protocol) — e.g. "vimtralions.com". Used to build the
   *  two account links; the caller resolves this from NEXT_PUBLIC_SITE_URL
   *  the same way sitemap.ts/robots.ts already do, so no new env var. */
  siteHost: string;
}

export function welcomeEmail(input: WelcomeEmailInput): RenderedEmail {
  const subject = "Welcome to Vimtra Chennai Lions GC";

  const text = [
    `Hi ${input.name},`,
    "",
    `Your account is set up at ${input.email}. You can now sign in any time to check order status, save a delivery address, and manage your details.`,
    "",
    "Browse the shop: https://" + input.siteHost + "/shop",
    "Your account: https://" + input.siteHost + "/profile",
    "",
    "Questions? Reply to this email or reach golfventures@vimtra.com.",
    "",
    "— Vimtra Chennai Lions GC",
    "AM Green IGPL · Season 2026",
  ].join("\n");

  const bodyHtml = `
    <p style="margin:0 0 16px;font-family:${FONT};font-size:15px;line-height:1.6;color:${INK};">
      Hi ${escapeHtml(input.name)},
    </p>
    <p style="margin:0 0 24px;font-family:${FONT};font-size:15px;line-height:1.6;color:${INK};">
      Your account is set up at <strong>${escapeHtml(input.email)}</strong>. You can
      now sign in any time to check order status, save a delivery address, and
      manage your details.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-right:10px;">
          <a href="https://${input.siteHost}/shop"
             style="display:inline-block;padding:12px 20px;background:${CRIMSON};color:${IVORY};font-family:${FONT};font-weight:700;font-size:13px;letter-spacing:0.4px;text-decoration:none;border-radius:999px;">
            Visit the shop
          </a>
        </td>
        <td>
          <a href="https://${input.siteHost}/profile"
             style="display:inline-block;padding:12px 20px;color:${INK};font-family:${FONT};font-weight:700;font-size:13px;letter-spacing:0.4px;text-decoration:none;border:1px solid rgba(14,11,10,0.16);border-radius:999px;">
            Your account
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:24px 0 0;font-family:${FONT};font-size:13px;line-height:1.6;color:${MUTED};">
      Questions? Reply to this email or reach us at golfventures@vimtra.com.
    </p>`;

  const html = emailShell({
    preview: "Your Vimtra Chennai Lions GC account is ready.",
    eyebrow: "Account created",
    bodyHtml,
  });

  return { subject, text, html };
}

// ---------------------------------------------------------------------------
// Email #2 — to the franchise.

export interface ContactNotificationInput {
  name: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  category: string;
  message: string;
  submittedAt: Date;
}

/**
 * Full enquiry detail, category and sender called out up front. Subject
 * is a fixed string, not built from the enquiry — predictable subjects
 * are easier for the recipient (and any inbox rule) to recognise than
 * one that reads differently every time; the category, name and message
 * are all in the body a line below the header, not lost. The caller
 * sets the SMTP message's replyTo to the enquirer's address, so a reply
 * from any mail client goes straight back to them without this template
 * needing to say so beyond the one line below.
 */
export function contactNotificationEmail(input: ContactNotificationInput): RenderedEmail {
  const subject = "New Contact Enquiry — Vimtra Chennai Lions GC";
  const submitted = input.submittedAt.toISOString();

  const text = [
    "New website contact enquiry.",
    "",
    `Category: ${input.category}`,
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `Phone: ${input.phone || "—"}`,
    `City: ${input.city || "—"}`,
    `Submitted: ${submitted}`,
    "",
    "Message:",
    input.message,
    "",
    `Reply to this email to respond to ${input.name} directly.`,
    "Full record: /admin/messages",
  ].join("\n");

  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:6px 0;font-family:${FONT};font-size:11px;letter-spacing:0.6px;color:${GOLD};text-transform:uppercase;width:96px;vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:6px 0;font-family:${FONT};font-size:14px;color:${INK};">${escapeHtml(value)}</td>
    </tr>`;

  const bodyHtml = `
    <p style="margin:0 0 16px;font-family:${FONT};font-weight:700;font-size:15px;color:${CRIMSON};">
      New website contact enquiry
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:4px;">
      ${row("Category", input.category)}
      ${row("Name", input.name)}
      ${row("Email", input.email)}
      ${row("Phone", input.phone || "—")}
      ${row("City", input.city || "—")}
      ${row("Submitted", submitted)}
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${IVORY};border-radius:10px;margin-top:18px;">
      <tr>
        <td style="padding:16px 18px;">
          <div style="font-family:${FONT};font-weight:700;font-size:10px;letter-spacing:1.4px;color:${GOLD};text-transform:uppercase;margin-bottom:8px;">
            Message
          </div>
          <div style="font-family:${FONT};font-size:14px;line-height:1.65;color:${INK};">
            ${nl2br(input.message)}
          </div>
        </td>
      </tr>
    </table>
    <p style="margin:20px 0 0;font-family:${FONT};font-size:13px;line-height:1.6;color:${MUTED};">
      Reply to this email to respond to ${escapeHtml(input.name)} directly, or open the full
      record in <strong style="color:${INK};">/admin/messages</strong>.
    </p>`;

  const html = emailShell({
    preview: `New ${input.category} enquiry from ${input.name}`,
    eyebrow: "Admin notification",
    bodyHtml,
  });

  return { subject, text, html };
}

// ---------------------------------------------------------------------------
// Cash on Delivery order emails — confirmation (to the buyer) and
// notification (to the admin). Both are sourced entirely from the Order +
// OrderItem rows the placeOrder() transaction already wrote — nothing here
// is recalculated or estimated; every figure and line is exactly what is
// stored, passed in by the caller (see app/checkout/actions.ts).

/** ₹ with Indian digit grouping — mirrors lib/products.ts's inr() exactly.
 *  Duplicated rather than imported so this module keeps its existing rule
 *  of depending on nothing but its own inputs (see the file header). */
function inr(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}

export interface OrderEmailLine {
  productName: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderEmailAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

function addressLines(a: OrderEmailAddress): string {
  return [
    a.fullName,
    [a.line1, a.line2].filter(Boolean).join(", "),
    `${a.city}, ${a.state} ${a.postalCode}`,
    a.country,
    `Phone: ${a.phone}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function itemsTextBlock(items: OrderEmailLine[]): string {
  return items
    .map((i) => `- ${i.productName} × ${i.qty} — ${inr(i.unitPrice)} each = ${inr(i.lineTotal)}`)
    .join("\n");
}

function itemsTableHtml(items: OrderEmailLine[]): string {
  const rows = items
    .map(
      (i) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid rgba(14,11,10,0.08);font-family:${FONT};font-size:14px;color:${INK};">${escapeHtml(i.productName)}</td>
      <td style="padding:10px 0;border-bottom:1px solid rgba(14,11,10,0.08);font-family:${FONT};font-size:14px;color:${MUTED};text-align:center;">${i.qty}</td>
      <td style="padding:10px 0;border-bottom:1px solid rgba(14,11,10,0.08);font-family:${FONT};font-size:14px;color:${MUTED};text-align:right;">${escapeHtml(inr(i.unitPrice))}</td>
      <td style="padding:10px 0;border-bottom:1px solid rgba(14,11,10,0.08);font-family:${FONT};font-size:14px;color:${INK};font-weight:700;text-align:right;">${escapeHtml(inr(i.lineTotal))}</td>
    </tr>`
    )
    .join("");
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:0 0 8px;font-family:${FONT};font-weight:700;font-size:10px;letter-spacing:1.2px;color:${GOLD};text-transform:uppercase;">Item</td>
        <td style="padding:0 0 8px;font-family:${FONT};font-weight:700;font-size:10px;letter-spacing:1.2px;color:${GOLD};text-transform:uppercase;text-align:center;">Qty</td>
        <td style="padding:0 0 8px;font-family:${FONT};font-weight:700;font-size:10px;letter-spacing:1.2px;color:${GOLD};text-transform:uppercase;text-align:right;">Price</td>
        <td style="padding:0 0 8px;font-family:${FONT};font-weight:700;font-size:10px;letter-spacing:1.2px;color:${GOLD};text-transform:uppercase;text-align:right;">Total</td>
      </tr>
      ${rows}
    </table>`;
}

function addressBlockHtml(label: string, a: OrderEmailAddress): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${IVORY};border-radius:10px;margin-top:18px;">
      <tr>
        <td style="padding:16px 18px;">
          <div style="font-family:${FONT};font-weight:700;font-size:10px;letter-spacing:1.4px;color:${GOLD};text-transform:uppercase;margin-bottom:8px;">
            ${escapeHtml(label)}
          </div>
          <div style="font-family:${FONT};font-size:14px;line-height:1.65;color:${INK};">
            ${escapeHtml(a.fullName)}<br />
            ${escapeHtml([a.line1, a.line2].filter(Boolean).join(", "))}<br />
            ${escapeHtml(`${a.city}, ${a.state} ${a.postalCode}`)}<br />
            ${escapeHtml(a.country)}<br />
            Phone: ${escapeHtml(a.phone)}
          </div>
        </td>
      </tr>
    </table>`;
}

// ---------------------------------------------------------------------------
// Email #1 — to the buyer. Confirms the order and states, unambiguously,
// that the payment method is Cash on Delivery — this template is only ever
// used for COD orders (see app/checkout/actions.ts), so nothing here is
// conditional on payment method.

export interface CodOrderConfirmationInput {
  customerName: string;
  /** Recipient address — sendCodOrderConfirmationToUser sends `to` this. */
  customerEmail: string;
  orderNumber: string;
  orderId: string;
  items: OrderEmailLine[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: OrderEmailAddress;
  /** Host only (no protocol) — resolved by the caller from
   *  NEXT_PUBLIC_SITE_URL, same convention as welcomeEmail's siteHost. */
  siteHost: string;
}

export function codOrderConfirmationEmail(input: CodOrderConfirmationInput): RenderedEmail {
  const subject = `Order ${input.orderNumber} confirmed — Cash on Delivery`;
  const orderUrl = `https://${input.siteHost}/orders/${input.orderId}`;

  const text = [
    `Hi ${input.customerName},`,
    "",
    `Your order ${input.orderNumber} has been placed. Payment method: Cash on Delivery — pay when your order is delivered.`,
    "",
    "Order summary:",
    itemsTextBlock(input.items),
    "",
    `Subtotal: ${inr(input.subtotal)}`,
    `Shipping: ${input.shipping > 0 ? inr(input.shipping) : "Free"}`,
    ...(input.tax > 0 ? [`Tax: ${inr(input.tax)}`] : []),
    `Total (payable on delivery): ${inr(input.total)}`,
    "",
    "Delivering to:",
    addressLines(input.shippingAddress),
    "",
    `View your order: ${orderUrl}`,
    "",
    "— Vimtra Chennai Lions GC",
    "AM Green IGPL · Season 2026",
  ].join("\n");

  const bodyHtml = `
    <p style="margin:0 0 16px;font-family:${FONT};font-size:15px;line-height:1.6;color:${INK};">
      Hi ${escapeHtml(input.customerName)},
    </p>
    <p style="margin:0 0 8px;font-family:${FONT};font-size:15px;line-height:1.6;color:${INK};">
      Your order <strong>${escapeHtml(input.orderNumber)}</strong> has been placed.
    </p>
    <p style="margin:0 0 24px;">
      <span style="display:inline-block;padding:6px 14px;background:${CRIMSON};color:${IVORY};font-family:${FONT};font-weight:700;font-size:11px;letter-spacing:1px;text-transform:uppercase;border-radius:999px;">
        Payment method: Cash on Delivery
      </span>
    </p>
    ${itemsTableHtml(input.items)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;">
      <tr>
        <td style="padding:4px 0;font-family:${FONT};font-size:13px;color:${MUTED};">Subtotal</td>
        <td style="padding:4px 0;font-family:${FONT};font-size:13px;color:${MUTED};text-align:right;">${escapeHtml(inr(input.subtotal))}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;font-family:${FONT};font-size:13px;color:${MUTED};">Shipping</td>
        <td style="padding:4px 0;font-family:${FONT};font-size:13px;color:${MUTED};text-align:right;">${input.shipping > 0 ? escapeHtml(inr(input.shipping)) : "Free"}</td>
      </tr>
      ${
        input.tax > 0
          ? `<tr>
        <td style="padding:4px 0;font-family:${FONT};font-size:13px;color:${MUTED};">Tax</td>
        <td style="padding:4px 0;font-family:${FONT};font-size:13px;color:${MUTED};text-align:right;">${escapeHtml(inr(input.tax))}</td>
      </tr>`
          : ""
      }
      <tr>
        <td style="padding:10px 0 0;font-family:${FONT};font-weight:700;font-size:15px;color:${INK};border-top:1px solid rgba(14,11,10,0.12);">Total payable on delivery</td>
        <td style="padding:10px 0 0;font-family:${FONT};font-weight:700;font-size:15px;color:${CRIMSON};text-align:right;border-top:1px solid rgba(14,11,10,0.12);">${escapeHtml(inr(input.total))}</td>
      </tr>
    </table>
    ${addressBlockHtml("Delivering to", input.shippingAddress)}
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:24px;">
      <tr>
        <td>
          <a href="${orderUrl}"
             style="display:inline-block;padding:12px 20px;background:${CRIMSON};color:${IVORY};font-family:${FONT};font-weight:700;font-size:13px;letter-spacing:0.4px;text-decoration:none;border-radius:999px;">
            View your order
          </a>
        </td>
      </tr>
    </table>`;

  const html = emailShell({
    preview: `Order ${input.orderNumber} confirmed — pay ${inr(input.total)} on delivery.`,
    eyebrow: "Order confirmation",
    bodyHtml,
  });

  return { subject, text, html };
}

// ---------------------------------------------------------------------------
// Email #2 — to the admin. Same order, admin-facing detail (customer
// contact info, delivery address, link to the admin order view), with the
// Cash on Delivery status made visually unmissable at the top of the email.

export interface CodOrderNotificationInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderNumber: string;
  orderId: string;
  items: OrderEmailLine[];
  total: number;
  shippingAddress: OrderEmailAddress;
  siteHost: string;
}

export function codOrderNotificationEmail(input: CodOrderNotificationInput): RenderedEmail {
  const subject = `CASH ON DELIVERY — New order ${input.orderNumber}`;
  const adminUrl = `https://${input.siteHost}/admin/orders/${input.orderId}`;

  const text = [
    "*** CASH ON DELIVERY ORDER ***",
    "",
    `Order: ${input.orderNumber}`,
    `Customer: ${input.customerName}`,
    `Email: ${input.customerEmail}`,
    `Phone: ${input.customerPhone}`,
    "",
    "Items:",
    itemsTextBlock(input.items),
    "",
    `Total to collect on delivery: ${inr(input.total)}`,
    "",
    "Deliver to:",
    addressLines(input.shippingAddress),
    "",
    `Full record: ${adminUrl}`,
  ].join("\n");

  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:6px 0;font-family:${FONT};font-size:11px;letter-spacing:0.6px;color:${GOLD};text-transform:uppercase;width:110px;vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:6px 0;font-family:${FONT};font-size:14px;color:${INK};">${escapeHtml(value)}</td>
    </tr>`;

  const bodyHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CRIMSON};border-radius:10px;margin-bottom:20px;">
      <tr>
        <td style="padding:14px 18px;font-family:${FONT};font-weight:800;font-size:14px;letter-spacing:1.4px;color:${IVORY};text-transform:uppercase;text-align:center;">
          Cash on Delivery — payment collected at delivery
        </td>
      </tr>
    </table>
    <p style="margin:0 0 16px;font-family:${FONT};font-weight:700;font-size:15px;color:${INK};">
      New order ${escapeHtml(input.orderNumber)}
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${row("Customer", input.customerName)}
      ${row("Email", input.customerEmail)}
      ${row("Phone", input.customerPhone)}
    </table>
    <div style="margin-top:18px;">${itemsTableHtml(input.items)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;">
      <tr>
        <td style="padding:10px 0 0;font-family:${FONT};font-weight:700;font-size:15px;color:${INK};border-top:1px solid rgba(14,11,10,0.12);">Total to collect on delivery</td>
        <td style="padding:10px 0 0;font-family:${FONT};font-weight:700;font-size:15px;color:${CRIMSON};text-align:right;border-top:1px solid rgba(14,11,10,0.12);">${escapeHtml(inr(input.total))}</td>
      </tr>
    </table>
    ${addressBlockHtml("Deliver to", input.shippingAddress)}
    <p style="margin:20px 0 0;font-family:${FONT};font-size:13px;line-height:1.6;color:${MUTED};">
      Full record: <a href="${adminUrl}" style="color:${INK};">${escapeHtml(adminUrl)}</a>
    </p>`;

  const html = emailShell({
    preview: `CASH ON DELIVERY — order ${input.orderNumber} from ${input.customerName}`,
    eyebrow: "Admin notification · Cash on Delivery",
    bodyHtml,
  });

  return { subject, text, html };
}

// ---------------------------------------------------------------------------
// Email verification (M6).
//
// Unlike welcomeEmail above, this template takes a fully-formed absolute
// `verifyUrl` rather than a bare host. The link has to be followed from an
// external mail client, so it cannot be rebuilt here from a host fragment
// and an assumed protocol — the caller resolves it once from
// NEXT_PUBLIC_SITE_URL (see lib/mail.ts) and passes the finished URL in.
// Nothing about localhost or any production domain is written here.

export interface VerificationEmailInput {
  name: string;
  email: string;
  /** Absolute, already-built verification URL including the token. */
  verifyUrl: string;
  /** Human-readable lifetime, e.g. "24 hours". */
  expiresInLabel: string;
}

export function emailVerificationEmail(input: VerificationEmailInput): RenderedEmail {
  const subject = "Verify your email · Vimtra Chennai Lions GC";

  const text = [
    `Hi ${input.name},`,
    "",
    `Confirm that ${input.email} is your address by opening the link below.`,
    "",
    input.verifyUrl,
    "",
    `This link expires in ${input.expiresInLabel} and can only be used once.`,
    "",
    "If you did not create an account with us, you can ignore this email — nothing will change.",
    "",
    "— Vimtra Chennai Lions GC",
    "AM Green IGPL · Season 2026",
  ].join("\n");

  const bodyHtml = `
    <p style="margin:0 0 16px;font-family:${FONT};font-size:15px;line-height:1.6;color:${INK};">
      Hi ${escapeHtml(input.name)},
    </p>
    <p style="margin:0 0 24px;font-family:${FONT};font-size:15px;line-height:1.6;color:${INK};">
      Confirm that <strong>${escapeHtml(input.email)}</strong> is your address so we
      can reach you about orders and account changes.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr>
        <td>
          <a href="${escapeHtml(input.verifyUrl)}"
             style="display:inline-block;padding:13px 24px;background:${CRIMSON};color:${IVORY};font-family:${FONT};font-weight:700;font-size:13px;letter-spacing:0.4px;text-decoration:none;border-radius:999px;">
            Verify my email
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:24px 0 0;font-family:${FONT};font-size:13px;line-height:1.6;color:${MUTED};">
      This link expires in ${escapeHtml(input.expiresInLabel)} and can only be used once.
    </p>
    <p style="margin:12px 0 0;font-family:${FONT};font-size:13px;line-height:1.6;color:${MUTED};">
      If the button does not work, paste this address into your browser:<br />
      <span style="color:${GOLD};word-break:break-all;">${escapeHtml(input.verifyUrl)}</span>
    </p>
    <p style="margin:20px 0 0;font-family:${FONT};font-size:13px;line-height:1.6;color:${MUTED};">
      If you did not create an account with us, ignore this email — nothing will change.
    </p>`;

  const html = emailShell({
    preview: "Confirm your email address for Vimtra Chennai Lions GC.",
    eyebrow: "Verify your email",
    bodyHtml,
  });

  return { subject, text, html };
}
