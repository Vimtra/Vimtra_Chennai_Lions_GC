"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/mail";
import { isSmsConfigured, sendSms, smsProviderName } from "@/lib/sms";
import {
  issueEmailVerificationToken,
  issuePhoneOtp,
  verifyPhoneOtp,
  VERIFICATION_POLICY,
} from "@/lib/verification";

/**
 * Verification server actions for the account page.
 *
 * Every action begins with requireUser() and acts ONLY on that session's own
 * user id. No action accepts a user id from the client, so one signed-in
 * person can never issue or consume verification state for another.
 *
 * No action here writes anything to User directly — the two writes that do
 * (emailVerifiedAt, and phone + phoneVerifiedAt) live in lib/verification.ts
 * and happen only after a token or code has actually been proven. Nothing in
 * this file touches Orders, Products, Sessions, passwords or roles.
 */

export type VerificationActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

/** Human-friendly seconds → "in 45 seconds" / "in 2 minutes". */
function retryLabel(sec?: number): string {
  if (!sec || sec <= 0) return "shortly";
  if (sec < 60) return `in ${sec} second${sec === 1 ? "" : "s"}`;
  const mins = Math.ceil(sec / 60);
  return `in ${mins} minute${mins === 1 ? "" : "s"}`;
}

/**
 * Send (or resend) the email-verification link to the signed-in user's own
 * address. Never takes an address from the form — using the session's own
 * email is what stops this from being turned into a way to probe whether
 * some other address has an account, or into a relay for mailing strangers.
 */
export async function resendVerificationEmailAction(): Promise<VerificationActionResult> {
  const user = await requireUser("/profile");

  const issued = await issueEmailVerificationToken(user.id);
  if (!issued.ok) {
    if (issued.reason === "already-verified") {
      return { ok: false, error: "That address is already verified." };
    }
    if (issued.reason === "cooldown") {
      return {
        ok: false,
        error: `A link was just sent. You can request another ${retryLabel(issued.retryAfterSec)}.`,
      };
    }
    return {
      ok: false,
      error: "Too many verification emails requested. Please try again in an hour.",
    };
  }

  const mail = await sendVerificationEmail({
    name: user.name,
    email: user.email,
    token: issued.token,
    expiresInLabel: "24 hours",
  }).catch(() => ({ sent: false as const, reason: "error" as const, detail: "send threw" }));

  if (!mail.sent) {
    // The token exists but no mail left the building. Say so plainly rather
    // than claiming a delivery that did not happen — the token expires on
    // its own and the User row was never touched, so nothing is left broken.
    if (mail.reason === "not-configured") {
      return {
        ok: false,
        error: "Email is not configured on this deployment, so no message was sent.",
      };
    }
    return {
      ok: false,
      error: "We could not send the verification email just now. Please try again shortly.",
    };
  }

  revalidatePath("/profile");
  return {
    ok: true,
    message: `Verification link sent to ${user.email}. It expires in 24 hours.`,
  };
}

/**
 * Issue an OTP for a phone number and attempt delivery.
 *
 * THE HARD RULE HERE: this never reports success unless an SMS was actually
 * accepted by a provider. With no provider configured — the current state of
 * this project — it returns a plain "not configured" error. It does not say
 * "code sent", does not print the code to a log, and does not return it to
 * the browser. A verification UI that fakes delivery is worse than none.
 */
export async function requestPhoneOtpAction(
  formData: FormData
): Promise<VerificationActionResult> {
  const user = await requireUser("/profile");
  const phone = String(formData.get("phone") ?? "");

  // Checked before an OTP is minted, so a disabled transport cannot burn a
  // user's hourly quota on codes that could never be delivered.
  if (!isSmsConfigured()) {
    return {
      ok: false,
      error:
        "Phone verification is not available yet — no SMS provider is configured on this deployment. No code was sent.",
    };
  }

  const issued = await issuePhoneOtp(user.id, phone);
  if (!issued.ok) {
    if (issued.reason === "invalid-phone") {
      return { ok: false, error: "Enter a valid mobile number, including country code." };
    }
    if (issued.reason === "already-verified") {
      return { ok: false, error: "That number is already verified on your account." };
    }
    if (issued.reason === "cooldown") {
      return {
        ok: false,
        error: `A code was just sent. You can request another ${retryLabel(issued.retryAfterSec)}.`,
      };
    }
    return { ok: false, error: "Too many codes requested. Please try again in an hour." };
  }

  const sms = await sendSms({
    to: issued.phone,
    body: `${issued.code} is your Vimtra Chennai Lions GC verification code. It expires in 10 minutes. Do not share it with anyone.`,
  });

  if (!sms.sent) {
    // Delivery failed after the code was stored. The code is unusable to
    // anyone (it was never transmitted) and expires in 10 minutes; the User
    // row is untouched. Report the failure honestly.
    return {
      ok: false,
      error:
        sms.reason === "not-configured"
          ? "Phone verification is not available yet — no SMS provider is configured. No code was sent."
          : "We could not send the code just now. Please try again shortly.",
    };
  }

  revalidatePath("/profile");
  const mins = Math.round(VERIFICATION_POLICY.OTP_TTL_MS / 60000);
  return {
    ok: true,
    message: `Code sent to ${issued.phone} via ${smsProviderName()}. It expires in ${mins} minutes.`,
  };
}

/** Verify a submitted OTP against the signed-in user's pending code. */
export async function verifyPhoneOtpAction(
  formData: FormData
): Promise<VerificationActionResult> {
  const user = await requireUser("/profile");
  const code = String(formData.get("code") ?? "");

  const result = await verifyPhoneOtp(user.id, code);
  if (!result.ok) {
    if (result.reason === "no-pending") {
      return { ok: false, error: "No code is waiting to be verified. Request a new one." };
    }
    if (result.reason === "expired") {
      return { ok: false, error: "That code has expired. Request a new one." };
    }
    if (result.reason === "too-many-attempts") {
      return {
        ok: false,
        error: "Too many incorrect attempts. That code is now void — request a new one.",
      };
    }
    return {
      ok: false,
      error: `That code is not correct. ${result.attemptsLeft ?? 0} attempt${
        result.attemptsLeft === 1 ? "" : "s"
      } remaining.`,
    };
  }

  revalidatePath("/profile");
  return { ok: true, message: `${result.phone} is now verified.` };
}
