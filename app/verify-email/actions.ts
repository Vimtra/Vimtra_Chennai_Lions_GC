"use server";

import { revalidatePath } from "next/cache";
import { consumeEmailVerificationToken } from "@/lib/verification";
import { createSession, hasSessionFor, safeNextPath } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * The ONLY place a verification token is consumed.
 *
 * Reached by the "Confirm my email" button on /verify-email — a deliberate
 * POST from a person, never the GET that a mail scanner or link pre-fetcher
 * performs. The token itself is the proof of ownership (256 bits of CSPRNG
 * entropy, single-use, 24 h), which is also why confirming ACTIVATES the
 * account: on success the browser gets a session for that user if it does
 * not already hold one, and is sent to its destination. A verified address
 * lifts the verify-before-activate gate (lib/auth.ts), so the very next
 * request sees a normal signed-in account.
 *
 * `next` is re-validated here — an internal path only — so the emailed link
 * can never turn into an open redirect. The raw token is never logged.
 */
export type ConfirmEmailResult =
  | { ok: true; redirectTo: string }
  | { ok: false; reason: "invalid" | "expired" | "used" };

export async function confirmEmailAction(formData: FormData): Promise<ConfirmEmailResult> {
  const token = String(formData.get("token") ?? "");
  const next = safeNextPath(String(formData.get("next") ?? ""));

  const result = await consumeEmailVerificationToken(token);
  if (!result.ok) return result;

  // Activate: hand this browser a session for the now-verified account
  // unless it already carries one for the same user (same-browser flow).
  if (!(await hasSessionFor(result.userId))) {
    await createSession(result.userId);
  }

  revalidatePath("/profile");
  revalidatePath("/admin/users");

  const user = await prisma.user.findUnique({ where: { id: result.userId }, select: { role: true } });
  const fallback = user?.role === "ADMIN" ? "/admin" : "/profile";
  return { ok: true, redirectTo: next ?? fallback };
}
