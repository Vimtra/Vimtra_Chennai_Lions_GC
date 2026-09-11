import "server-only";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

/**
 * Account system: bcrypt-hashed passwords + database-backed sessions.
 *
 * - Sessions are random opaque tokens stored in the Session table; the token
 *   lives in an httpOnly cookie. Deleting the row signs the user out everywhere.
 * - Authorization is role-based (USER / ADMIN). requireAdmin() gates the admin
 *   area; middleware.ts does a coarse cookie-presence pre-check at the edge.
 */

const COOKIE = "lions_session";
// Was 30 days. A merch/fan account carries no payment-instrument or
// admin-by-default risk on its own (role is checked separately by
// requireAdmin() on every request, not cached in the session), so a
// longer "stay signed in" window trades a little session lifetime for
// meaningfully fewer forced re-logins — 90 days, not indefinite: it
// still expires, and getCurrentUser() still rejects an expired row on
// every read regardless of the cookie's own lifetime.
const SESSION_DAYS = 90;
const BCRYPT_ROUNDS = 10;

export interface SafeUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  /** True once the address on the account has been confirmed by link. */
  emailVerified: boolean;
  /** True when this account may not use the signed-in experience until it verifies. */
  verificationRequired: boolean;
}

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: Role;
  emailVerifiedAt: Date | null;
  createdAt: Date;
};

/**
 * VERIFY-BEFORE-ACTIVATE — the one rule that decides who is gated.
 *
 * Accounts created on or after this instant must confirm their email before
 * the signed-in experience opens (profile, checkout, orders, admin). Legacy
 * accounts created before it keep the behaviour they always had — sign-in
 * works, verification stays optional and is offered on /profile — so no
 * existing member (or the pre-existing unverified admin) is locked out by
 * this rule landing. A date rather than a new column so no migration is
 * needed; the schema already records createdAt and emailVerifiedAt.
 *
 * Note the rule is evaluated on every request from the database row, never
 * from anything the client sends: a verified user who changes their address
 * becomes unverified again (see lib/verification.ts changeUserEmail) and is
 * gated until the new address is confirmed.
 */
export const VERIFICATION_REQUIRED_SINCE = new Date("2026-09-11T12:00:00Z");

export function isVerificationRequired(u: Pick<UserRow, "emailVerifiedAt" | "createdAt">): boolean {
  return u.emailVerifiedAt === null && u.createdAt >= VERIFICATION_REQUIRED_SINCE;
}

function toSafe(u: UserRow): SafeUser {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    emailVerified: u.emailVerifiedAt !== null,
    verificationRequired: isVerificationRequired(u),
  };
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export async function registerUser(
  input: RegisterInput
): Promise<{ ok: true; user: SafeUser } | { ok: false; error: string }> {
  const email = input.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { ok: false, error: "An account with this email already exists." };
  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: { name: input.name.trim(), email, passwordHash },
  });
  return { ok: true, user: toSafe(user) };
}

/** Returns the user if email+password match, else null (constant-ish time). */
export async function verifyCredentials(
  email: string,
  password: string
): Promise<SafeUser | null> {
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user) {
    // Compare against a dummy hash to reduce user-enumeration timing leaks.
    await bcrypt.compare(password, "$2a$10$CwTycUXWue0Thq9StjUM0uJ8.Q9wY9X1aXf7y8m2H3i9oVqXjQ1bC");
    return null;
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? toSafe(user) : null;
}

/** True when a session cookie for this user is already present and valid. */
export async function hasSessionFor(userId: string): Promise<boolean> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;
  try {
    const s = await prisma.session.findUnique({ where: { token }, select: { userId: true, expiresAt: true } });
    return Boolean(s && s.userId === userId && s.expiresAt >= new Date());
  } catch {
    return false;
  }
}

export async function createSession(userId: string): Promise<void> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { token, userId, expiresAt } });
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) {
    try {
      await prisma.session.deleteMany({ where: { token } });
    } catch {
      // ignore — cookie is cleared regardless
    }
  }
  store.delete(COOKIE);
}

/**
 * The user behind the session cookie, whatever their verification state.
 * Only the check-your-email surface (and the gate helpers below) should
 * use this; everything else goes through getCurrentUser(), which hides
 * gated accounts. Resilient to DB errors (treats as logged-out).
 */
export async function getPendingUser(): Promise<SafeUser | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });
    if (!session || session.expiresAt < new Date()) return null;
    return toSafe(session.user);
  } catch {
    return null;
  }
}

/**
 * Current signed-in user, or null. An account that still has to verify its
 * email (see VERIFICATION_REQUIRED_SINCE) is reported as null here, so the
 * nav, checkout, orders, profile and admin all treat it as signed out until
 * the address is confirmed. Its session row exists only so /check-email can
 * offer resend / change-address and so verifying in the same browser lands
 * straight in the account.
 */
export async function getCurrentUser(): Promise<SafeUser | null> {
  const user = await getPendingUser();
  if (!user || user.verificationRequired) return null;
  return user;
}

export async function requireUser(nextPath?: string): Promise<SafeUser> {
  const pending = await getPendingUser();
  if (pending?.verificationRequired) {
    // Signed in but not yet allowed in: send them to the verification state,
    // keeping where they were headed so it survives the round trip.
    redirect(nextPath ? `/check-email?next=${encodeURIComponent(nextPath)}` : "/check-email");
  }
  if (!pending) {
    redirect(nextPath ? `/sign-in?next=${encodeURIComponent(nextPath)}` : "/sign-in");
  }
  return pending;
}

export async function requireAdmin(): Promise<SafeUser> {
  const pending = await getPendingUser();
  if (pending?.verificationRequired) redirect("/check-email?next=%2Fadmin");
  if (!pending) redirect("/sign-in?next=/admin");
  if (pending.role !== "ADMIN") redirect("/?denied=admin");
  return pending;
}

/** Only internal, relative destinations — never a host, never protocol-relative. */
export function safeNextPath(next: string | null | undefined): string | undefined {
  if (!next) return undefined;
  return next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : undefined;
}
