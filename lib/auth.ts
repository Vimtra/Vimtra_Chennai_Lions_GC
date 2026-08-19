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
const SESSION_DAYS = 30;
const BCRYPT_ROUNDS = 10;

export interface SafeUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

function toSafe(u: { id: string; email: string; name: string; role: Role }): SafeUser {
  return { id: u.id, email: u.email, name: u.name, role: u.role };
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

/** Current signed-in user, or null. Resilient to DB errors (treats as logged-out). */
export async function getCurrentUser(): Promise<SafeUser | null> {
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

export async function requireUser(nextPath?: string): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(nextPath ? `/sign-in?next=${encodeURIComponent(nextPath)}` : "/sign-in");
  }
  return user;
}

export async function requireAdmin(): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?next=/admin");
  if (user.role !== "ADMIN") redirect("/?denied=admin");
  return user;
}
