"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { issueEmailVerificationToken } from "@/lib/verification";
import { sendVerificationEmail } from "@/lib/mail";
import type { ActionResult } from "@/lib/admin-action-result";

function existingOrdersError(count: number): string {
  return `This user cannot be deleted because they have existing orders. (${count} order${count === 1 ? "" : "s"})`;
}

/**
 * Grant or revoke ADMIN. Guards:
 *  - never on your own account (lockout guard)
 *  - never demote the last remaining admin
 * Role is read from the database on every request (requireAdmin), so a
 * demoted admin loses access on their next request without a sign-out.
 */
export async function setRoleAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const role = String(formData.get("role") ?? "");
  if (role !== "USER" && role !== "ADMIN") return { ok: false, error: "That role is not valid." };
  if (!id) return { ok: false, error: "Missing user identifier." };
  if (id === admin.id) return { ok: false, error: "You cannot change your own role." };

  const target = await prisma.user.findUnique({ where: { id }, select: { id: true, name: true, role: true } });
  if (!target) return { ok: false, error: "That account no longer exists." };
  if (target.role === role) return { ok: true, message: `${target.name} is already ${role.toLowerCase()}.` };

  if (role === "USER") {
    const admins = await prisma.user.count({ where: { role: "ADMIN" } });
    if (admins <= 1) return { ok: false, error: "There must always be at least one admin." };
  }

  await prisma.user.update({ where: { id }, data: { role } });
  revalidatePath("/admin/users");
  return {
    ok: true,
    message: role === "ADMIN" ? `${target.name} can now access the admin console.` : `${target.name} no longer has admin access.`,
  };
}

/** Sign a user out everywhere by deleting their sessions. Reversible (they sign in again). */
export async function revokeSessionsAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { ok: false, error: "Missing user identifier." };
  if (id === admin.id) return { ok: false, error: "Use Sign out to end your own sessions." };
  const target = await prisma.user.findUnique({ where: { id }, select: { name: true } });
  if (!target) return { ok: false, error: "That account no longer exists." };
  const { count } = await prisma.session.deleteMany({ where: { userId: id } });
  revalidatePath("/admin/users");
  return { ok: true, message: count === 0 ? `${target.name} had no active sessions.` : `Signed ${target.name} out of ${count} session${count === 1 ? "" : "s"}.` };
}

export async function deleteUserAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { ok: false, error: "Missing user identifier." };

  if (id === admin.id) {
    return { ok: false, error: "You cannot delete your own account." };
  }

  // Order.userId is a deliberate RESTRICT relation — a customer's order
  // history must never be deleted or orphaned because their account is
  // removed. Checked first so the common case never round-trips a failing
  // delete; the catch still handles the race.
  const orderCount = await prisma.order.count({ where: { userId: id } });
  if (orderCount > 0) {
    return { ok: false, error: existingOrdersError(orderCount) };
  }

  try {
    await prisma.user.delete({ where: { id } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      const recount = await prisma.order.count({ where: { userId: id } }).catch(() => 1);
      console.error("[deleteUserAction] blocked by existing orders (created after the pre-check):", id);
      return { ok: false, error: existingOrdersError(Math.max(recount, 1)) };
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return { ok: false, error: "That account no longer exists." };
    }
    console.error("[deleteUserAction]", err);
    return { ok: false, error: "That account could not be deleted. Reload and try again." };
  }

  revalidatePath("/admin/users");
  return { ok: true, message: "Account deleted." };
}

/**
 * Send a verification link to ONE user's own stored address.
 *
 * The address is read from the database row — never from the client — so
 * this cannot be turned into a way to mail arbitrary addresses. It goes
 * through issueEmailVerificationToken(), so the same per-user cooldown and
 * hourly cap apply as for the user's own resend, and an already-verified
 * address is refused. There is deliberately NO action that sets
 * emailVerifiedAt directly: an admin can prompt verification, not bypass it.
 */
export async function sendVerificationLinkAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { ok: false, error: "Missing user identifier." };
  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, emailVerifiedAt: true },
  });
  if (!target) return { ok: false, error: "That account no longer exists." };
  if (target.emailVerifiedAt) return { ok: false, error: `${target.email} is already verified.` };

  const issued = await issueEmailVerificationToken(target.id);
  if (!issued.ok) {
    if (issued.reason === "cooldown") {
      return { ok: false, error: `A link was sent to this user less than a minute ago. Try again in ${issued.retryAfterSec ?? 60}s.` };
    }
    if (issued.reason === "rate-limited") {
      return { ok: false, error: "This user has hit the hourly limit for verification emails. Try again later." };
    }
    return { ok: false, error: `${target.email} is already verified.` };
  }

  const mail = await sendVerificationEmail({
    name: target.name,
    email: target.email,
    token: issued.token,
    expiresInLabel: "24 hours",
  }).catch(() => ({ sent: false as const, reason: "error" as const }));

  if (!mail.sent) {
    return {
      ok: false,
      error:
        mail.reason === "not-configured"
          ? "Email is not configured on this deployment, so no link was sent."
          : "The verification email could not be sent. Check the server log and try again.",
    };
  }
  revalidatePath("/admin/users");
  return { ok: true, message: `Verification link sent to ${target.email}.` };
}
