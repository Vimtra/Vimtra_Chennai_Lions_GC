"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser, hashPassword } from "@/lib/auth";
import { changeUserEmail, issueEmailVerificationToken } from "@/lib/verification";
import { isVerificationRequired } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/mail";

/**
 * Account settings.
 *
 * Security rules are unchanged: the same zod schema, the same 8-character
 * minimum, the same bcrypt `hashPassword`, the same email-uniqueness guard.
 * The existing password is never read, returned or displayed — only
 * overwritten with a fresh hash when a new one is supplied.
 *
 * What changed is only how the outcome is reported. This used to
 * `redirect("/profile?error=…")`, which meant a full navigation and an error
 * carried in the URL, with no way to show a loading, inline-validation or
 * success state on the form itself. It now returns a result.
 */

const schema = z.object({
  name: z.string().trim().min(2),
  email: z.string().email(),
  password: z.string().min(8).optional().or(z.literal("")),
  confirmPassword: z.string().optional(),
});

/**
 * `emailChanged` is set when the address was replaced. The new address is
 * always unverified at that point; `verification` says whether the fresh
 * link actually went out, so the form can tell the person what to do next
 * instead of implying a delivery that did not happen.
 */
export type ProfileActionResult =
  | {
      ok: true;
      passwordChanged: boolean;
      emailChanged: boolean;
      verification?: "sent" | "cooldown" | "not-configured" | "error";
      retryAfterSec?: number;
      /** True when the account is now gated and must confirm the new address before continuing. */
      verificationRequired?: boolean;
    }
  | { ok: false; error: string; field?: "name" | "email" | "password" };

export async function updateProfile(
  formData: FormData
): Promise<ProfileActionResult> {
  const user = await requireUser("/profile");

  const rawPassword = String(formData.get("password") ?? "");
  const rawConfirm = String(formData.get("confirmPassword") ?? "");

  // Changing the password is opt-in: leaving both boxes empty keeps the
  // current one, exactly as before. But once either box is touched, both
  // are required — a half-filled pair is always a mistake.
  const wantsPasswordChange = rawPassword !== "" || rawConfirm !== "";
  if (wantsPasswordChange) {
    if (!rawPassword || !rawConfirm) {
      return {
        ok: false,
        field: "password",
        error: "Enter the new password in both fields.",
      };
    }
    if (rawPassword !== rawConfirm) {
      return {
        ok: false,
        field: "password",
        error: "New password and confirmation do not match.",
      };
    }
    if (rawPassword.length < 8) {
      return {
        ok: false,
        field: "password",
        error: "Password must be at least 8 characters.",
      };
    }
  }

  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: rawPassword,
    confirmPassword: rawConfirm,
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const path = issue?.path?.[0];
    if (path === "email") {
      return { ok: false, field: "email", error: "Enter a valid email address." };
    }
    if (path === "name") {
      return { ok: false, field: "name", error: "Name must be at least 2 characters." };
    }
    if (path === "password") {
      return {
        ok: false,
        field: "password",
        error: "Password must be at least 8 characters.",
      };
    }
    return { ok: false, error: "Please check your details and try again." };
  }

  const email = parsed.data.email.trim().toLowerCase();

  // Guard email uniqueness when changing it.
  if (email !== user.email) {
    const taken = await prisma.user.findUnique({ where: { email } });
    if (taken) {
      return { ok: false, field: "email", error: "That email is already in use." };
    }
  }

  const passwordHash =
    wantsPasswordChange && parsed.data.password ? await hashPassword(parsed.data.password) : undefined;
  const emailChanged = email !== user.email;

  try {
    if (emailChanged) {
      // A changed address is a NEW, unverified address. changeUserEmail()
      // writes the email and clears emailVerifiedAt in one transaction and
      // retires every live token, so a link that went to the old inbox can
      // no longer verify anything. Verified status never carries across.
      await changeUserEmail(user.id, email, { name: parsed.data.name, passwordHash });
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { name: parsed.data.name, ...(passwordHash ? { passwordHash } : {}) },
      });
    }
  } catch (err) {
    console.error("[updateProfile]", err);
    return { ok: false, error: "Could not save your changes. Please try again." };
  }

  revalidatePath("/profile");

  if (!emailChanged) {
    return { ok: true, passwordChanged: wantsPasswordChange, emailChanged: false };
  }

  // Fresh link to the NEW address only. Subject to the same cooldown and
  // hourly cap as every other issue — the address change itself is already
  // saved and unverified regardless of what happens here.
  let verification: "sent" | "cooldown" | "not-configured" | "error" = "error";
  let retryAfterSec: number | undefined;
  try {
    const issued = await issueEmailVerificationToken(user.id);
    if (!issued.ok) {
      verification = issued.reason === "cooldown" ? "cooldown" : "error";
      retryAfterSec = issued.retryAfterSec;
    } else {
      const mail = await sendVerificationEmail({
        name: parsed.data.name,
        email,
        token: issued.token,
        expiresInLabel: "24 hours",
      });
      verification = mail.sent ? "sent" : mail.reason === "not-configured" ? "not-configured" : "error";
    }
  } catch (err) {
    console.error("[updateProfile] verification mail:", err instanceof Error ? err.message : "Unknown error.");
  }

  const row = await prisma.user.findUnique({ where: { id: user.id }, select: { emailVerifiedAt: true, createdAt: true } });
  const verificationRequired = row ? isVerificationRequired(row) : false;
  return { ok: true, passwordChanged: wantsPasswordChange, emailChanged: true, verification, retryAfterSec, verificationRequired };
}
