import type { Metadata } from "next";
import StoryHero from "@/components/site/StoryHero";
import { Section } from "@/components/site/Section";
import VerifyEmailConfirm from "@/components/auth/VerifyEmailConfirm";
import { peekEmailVerificationToken } from "@/lib/verification";
import { safeNextPath } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Verify Email",
  // A one-time token lives in this URL's query string. It must never be
  // indexed, and crawlers must not follow it.
  robots: { index: false, follow: false },
};

// Never cached or prerendered — the token's state can change at any moment.
export const dynamic = "force-dynamic";

/**
 * Email verification landing page.
 *
 * Reached from the link in the verification email. Rendering this page
 * WRITES NOTHING: the token is only peeked at (read-only) so the right
 * message can be shown, and the actual consumption happens when the person
 * presses "Confirm my email" (app/verify-email/actions.ts). That is what
 * keeps corporate mail scanners and link pre-fetchers — which open every
 * link in an email without anyone present — from burning the token before
 * the recipient ever sees it.
 *
 * Deliberately does NOT require a session. The link is followed from a mail
 * client, often in a different browser from the one that signed up, and the
 * token itself is the proof of ownership — 256 bits of CSPRNG entropy tied
 * to one user row. It also does not create, alter, or elevate a session.
 */
export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; next?: string }>;
}) {
  const { token, next } = await searchParams;
  const raw = (token ?? "").trim();
  const safeNext = safeNextPath(next);
  const peek = await peekEmailVerificationToken(raw);
  // Shown to the link holder only in masked form — the mailbox owner knows
  // their own address, and a leaked URL should not hand it out in full.
  const masked = peek.ok ? maskEmail(peek.email) : "";

  const line = peek.ok
    ? "Confirm this is you."
    : peek.reason === "expired"
      ? "That link has expired."
      : peek.reason === "used"
        ? "That link has already been used."
        : "We could not verify that link.";

  return (
    <>
      <StoryHero eyebrow="Account" title={["EMAIL", "VERIFICATION"]} line={line} />

      <Section surface="ivory" size="tight">
        <div className="cm-track">
          <VerifyEmailConfirm
            token={raw}
            next={safeNext}
            initial={peek.ok ? { ok: true, email: masked } : { ok: false, reason: peek.reason }}
          />
        </div>
      </Section>
    </>
  );
}

/** "j•••@example.com" — enough to recognise, not enough to harvest. */
function maskEmail(email: string): string {
  const at = email.indexOf("@");
  if (at <= 0) return "your address";
  const local = email.slice(0, at);
  const domain = email.slice(at);
  return `${local.slice(0, 1)}${"•".repeat(Math.max(2, Math.min(local.length - 1, 5)))}${domain}`;
}
