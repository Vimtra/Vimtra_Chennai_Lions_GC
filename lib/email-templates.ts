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
