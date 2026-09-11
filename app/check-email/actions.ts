"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getPendingUser, safeNextPath } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/mail";
import { changeUserEmail, issueEmailVerificationToken } from "@/lib/verification";

/**
 * Actions for the "check your email" state.
 *
 * Both act only on the account behind the session cookie — never on an id
 * or address the client names — and only while that account is still
 * gated. Once verified there is nothing here to do and each returns a
 * result that sends the person on.
 */
export type CheckEmailResult =
  | { ok: true; message: string; email?: string }
  | { ok: false; error: string; retryAfterSec?: number; verified?: boolean };

/** Human-friendly seconds → "in 45 seconds" / "in 2 minutes". */
function retryLabel(sec?: number): string {
  if (!sec || sec <= 0) return "shortly";
  if (sec < 60) return `in ${sec} second${sec === 1 ? "" : "s"}`;
  const mins = Math.ceil(sec / 60);
  return `in ${mins} minute${mins === 1 ? "" : "s"}`;
}

async function issueAndSend(user: { id: string; name: string; email: string }, next?: string): Promise<CheckEmailResult> {
  const issued = await issueEmailVerificationToken(user.id);
  if (!issued.ok) {
    if (issued.reason === "already-verified") {
      return { ok: false, error: "This address is already verified.", verified: true };
    }
    if (issued.reason === "cooldown") {
      return {
        ok: false,
        error: `A link was just sent. You can request another ${retryLabel(issued.retryAfterSec)}.`,
        retryAfterSec: issued.retryAfterSec,
      };
    }
    return { ok: false, error: "Too many verification emails requested. Please try again in an hour." };
  }
  const mail = await sendVerificationEmail({
    name: user.name,
    email: user.email,
    token: issued.token,
    expiresInLabel: "24 hours",
    next,
  }).catch(() => ({ sent: false as const, reason: "error" as const }));
  if (!mail.sent) {
    return {
      ok: false,
      error:
        mail.reason === "not-configured"
          ? "Email is not configured on this deployment, so no message was sent."
          : "We could not send the verification email just now. Please try again shortly.",
    };
  }
  return { ok: true, message: `A new verification link is on its way to ${user.email}. It expires in 24 hours.` };
}

export async function resendPendingVerificationAction(formData: FormData): Promise<CheckEmailResult> {
  const user = await getPendingUser();
  if (!user) return { ok: false, error: "Your session has ended. Please sign in again." };
  if (!user.verificationRequired) return { ok: false, error: "This address is already verified.", verified: true };
  return issueAndSend(user, safeNextPath(String(formData.get("next") ?? "")));
}

const emailSchema = z.string().trim().toLowerCase().email();

/**
 * Fix a mistyped address before it is ever verified. Goes through
 * changeUserEmail() — the same transactional path the account page uses —
 * so every live token for the old address is retired and the new one gets
 * its own link. Uniqueness is enforced exactly as on sign-up.
 */
export async function changePendingEmailAction(formData: FormData): Promise<CheckEmailResult> {
  const user = await getPendingUser();
  if (!user) return { ok: false, error: "Your session has ended. Please sign in again." };
  if (!user.verificationRequired) return { ok: false, error: "This address is already verified.", verified: true };

  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) return { ok: false, error: "Enter a valid email address." };
  const email = parsed.data;
  if (email === user.email) return { ok: false, error: "That is already the address on your account." };

  const taken = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (taken) return { ok: false, error: "That email is already in use." };

  await changeUserEmail(user.id, email);
  const sent = await issueAndSend({ id: user.id, name: user.name, email }, safeNextPath(String(formData.get("next") ?? "")));
  if (!sent.ok) {
    // The address IS changed; only the mail failed. Say both.
    return { ok: false, error: `Address updated to ${email}, but: ${sent.error}`, retryAfterSec: sent.retryAfterSec };
  }
  return { ok: true, message: `Address updated. ${sent.message}`, email };
}
