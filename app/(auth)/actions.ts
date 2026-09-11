"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  verifyCredentials,
  registerUser,
  createSession,
  destroySession,
  safeNextPath,
} from "@/lib/auth";
import { sendWelcomeEmail, sendVerificationEmail } from "@/lib/mail";
import { issueEmailVerificationToken } from "@/lib/verification";
import { getSiteHost } from "@/lib/site-url";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const signUpSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name."),
  email: z.string().email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

function urlWith(path: string, params: Record<string, string | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
  const q = sp.toString();
  return q ? `${path}?${q}` : path;
}

/** Only allow internal relative redirects (avoid open-redirect). */
const safeNext = safeNextPath;

/** Where a gated (unverified, post-cutoff) account goes after sign-in / sign-up. */
function checkEmailUrl(next: string | undefined): string {
  return urlWith("/check-email", { next });
}

export async function signIn(formData: FormData) {
  const next = safeNext(String(formData.get("next") ?? ""));
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) redirect(urlWith("/sign-in", { error: "invalid", next }));

  let user;
  try {
    user = await verifyCredentials(parsed.data.email, parsed.data.password);
  } catch {
    redirect(urlWith("/sign-in", { error: "server", next }));
  }
  if (!user) redirect(urlWith("/sign-in", { error: "creds", next }));

  await createSession(user.id);
  // Verify-before-activate: an account that still has to confirm its email
  // gets a session (so /check-email can act for it) but is sent to the
  // verification state, not into the app. getCurrentUser() hides it
  // everywhere else until emailVerifiedAt is set.
  if (user.verificationRequired) redirect(checkEmailUrl(next));
  redirect(next ?? (user.role === "ADMIN" ? "/admin" : "/profile"));
}

export async function signUp(formData: FormData) {
  const next = safeNext(String(formData.get("next") ?? ""));
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    redirect(urlWith("/sign-up", { error: parsed.error.issues[0]?.message ?? "invalid", next }));
  }

  let result;
  try {
    result = await registerUser(parsed.data);
  } catch {
    redirect(urlWith("/sign-up", { error: "Something went wrong. Try again.", next }));
  }
  if (!result.ok) redirect(urlWith("/sign-up", { error: result.error, next }));

  // Welcome email — fires exactly once, right here, only on a row that
  // registerUser() just actually created. It never runs from signIn()
  // below, and registerUser() itself only reaches `ok: true` once per
  // email address (the existing-account check above it, backed by the
  // User.email unique constraint), so there is no separate "already
  // welcomed" flag to add or forget: this call site IS the guarantee.
  // Awaited (same as the contact form's mail) so the send is given a
  // chance to complete before the function returns — but its outcome is
  // best-effort and never blocks account creation or sign-in either way.
  const siteHost = getSiteHost();
  const welcomeMail = await sendWelcomeEmail({
    name: result.user.name,
    email: result.user.email,
    siteHost,
  }).catch((err) => ({
    sent: false as const,
    reason: "error" as const,
    detail: err instanceof Error ? err.message : "Unknown error.",
  }));
  if (!welcomeMail.sent && welcomeMail.reason === "error") {
    console.error("[auth] welcome email failed:", welcomeMail.detail);
  }

  // Email verification (M6). Issued and sent here, at account creation, and
  // never from signIn() below.
  //
  // Best-effort exactly like the welcome mail above, and for the same
  // reason: the account row already exists and is usable, so a mail
  // failure must not fail signup or leave the person without an account.
  // If the send fails, the token simply goes unused and expires — the
  // profile page offers a resend, so there is no state here that can get
  // stuck. Nothing about the User row is written by this block.
  // The outcome is carried to the check-your-email page as
  // `?verify=sent|failed` so it can say honestly whether a link is in the
  // inbox. No token, no address — the page reads the session's own email.
  let verifyOutcome: "sent" | "failed" = "failed";
  try {
    const issued = await issueEmailVerificationToken(result.user.id);
    if (issued.ok) {
      const verifyMail = await sendVerificationEmail({
        name: result.user.name,
        email: result.user.email,
        token: issued.token,
        expiresInLabel: "24 hours",
        // Carried inside the emailed link so verifying lands where the
        // person was originally headed (validated again on the way out).
        next,
      }).catch((err) => ({
        sent: false as const,
        reason: "error" as const,
        detail: err instanceof Error ? err.message : "Unknown error.",
      }));
      if (verifyMail.sent) verifyOutcome = "sent";
      else if (verifyMail.reason === "error") {
        console.error("[auth] verification email failed:", verifyMail.detail);
      }
    }
  } catch (err) {
    // Never block account creation on verification plumbing.
    console.error(
      "[auth] could not issue verification token:",
      err instanceof Error ? err.message : "Unknown error."
    );
  }

  // The session is created now but the account is NOT active: the new row
  // has emailVerifiedAt = NULL and is past VERIFICATION_REQUIRED_SINCE, so
  // getCurrentUser() reports it as signed out until the link is confirmed.
  // The cookie exists only so /check-email can resend or change the address
  // for this account, and so confirming in this browser opens the account.
  await createSession(result.user.id);
  if (result.user.verificationRequired) {
    redirect(urlWith("/check-email", { next, verify: verifyOutcome }));
  }
  redirect(next ?? "/profile");
}

export async function signOut() {
  await destroySession();
  redirect("/");
}
