import "server-only";
import crypto from "node:crypto";
import net from "node:net";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_MS = 15 * 60 * 1000;
const EMAIL_LIMIT = 5;
const IP_LIMIT = 10;

type RateLimitKind = "email" | "ip";

type RateLimitRow = {
  key: string;
  attempts: number;
  windowStart: Date;
  lockedUntil: Date | null;
};

export type LoginRateLimitState = {
  blocked: boolean;
  retryAfterSec: number;
};

export function normaliseLoginEmail(email: string): string {
  return email.trim().toLowerCase();
}

function identifierKey(kind: RateLimitKind, value: string): string {
  const digest = crypto.createHash("sha256").update(value, "utf8").digest("hex");
  return `login:${kind}:${digest}`;
}

/** Vercel overwrites this platform header with the requester's public IP. */
export function getTrustedClientIp(requestHeaders: Headers): string | null {
  const value = requestHeaders.get("x-vercel-forwarded-for")?.trim() ?? "";
  if (!value || value.includes(",") || net.isIP(value) === 0) return null;
  return value;
}

function rateLimitKeyPair(email: string, clientIp: string | null): string[] {
  const keys = [identifierKey("email", normaliseLoginEmail(email))];
  if (clientIp) keys.push(identifierKey("ip", clientIp));
  return keys;
}

function retryAfterSec(lockedUntil: Date, now: Date): number {
  return Math.max(1, Math.ceil((lockedUntil.getTime() - now.getTime()) / 1000));
}

export async function getLoginRateLimitState(
  email: string,
  clientIp: string | null,
  now = new Date()
): Promise<LoginRateLimitState> {
  const rows = await prisma.authRateLimit.findMany({
    where: { key: { in: rateLimitKeyPair(email, clientIp) } },
    select: { lockedUntil: true },
  });
  const activeLock = rows
    .map((row) => row.lockedUntil)
    .filter((value): value is Date => value !== null && value > now)
    .sort((a, b) => b.getTime() - a.getTime())[0];

  return activeLock
    ? { blocked: true, retryAfterSec: retryAfterSec(activeLock, now) }
    : { blocked: false, retryAfterSec: 0 };
}

/**
 * Atomically increments one counter. PostgreSQL serializes concurrent
 * upserts on the unique key, so parallel login failures cannot lose updates.
 */
async function recordFailure(key: string, limit: number, now: Date): Promise<RateLimitRow> {
  const windowStart = new Date(now.getTime() - WINDOW_MS);
  const lockedUntil = new Date(now.getTime() + LOCKOUT_MS);
  const rows = await prisma.$queryRaw<RateLimitRow[]>(Prisma.sql`
    INSERT INTO "AuthRateLimit" ("id", "key", "attempts", "windowStart", "createdAt", "updatedAt")
    VALUES (${crypto.randomUUID()}, ${key}, 1, ${now}, ${now}, ${now})
    ON CONFLICT ("key") DO UPDATE SET
      "attempts" = CASE
        WHEN "AuthRateLimit"."windowStart" <= ${windowStart} THEN 1
        ELSE "AuthRateLimit"."attempts" + 1
      END,
      "windowStart" = CASE
        WHEN "AuthRateLimit"."windowStart" <= ${windowStart} THEN ${now}
        ELSE "AuthRateLimit"."windowStart"
      END,
      "lockedUntil" = CASE
        WHEN "AuthRateLimit"."windowStart" <= ${windowStart} THEN NULL
        WHEN "AuthRateLimit"."attempts" + 1 >= ${limit} THEN ${lockedUntil}
        ELSE "AuthRateLimit"."lockedUntil"
      END,
      "updatedAt" = ${now}
    RETURNING "key", "attempts", "windowStart", "lockedUntil"
  `);
  return rows[0];
}

export async function recordLoginFailure(
  email: string,
  clientIp: string | null,
  now = new Date()
): Promise<LoginRateLimitState> {
  const emailRow = await recordFailure(
    identifierKey("email", normaliseLoginEmail(email)),
    EMAIL_LIMIT,
    now
  );
  const ipRow = clientIp
    ? await recordFailure(identifierKey("ip", clientIp), IP_LIMIT, now)
    : null;
  const lock = [emailRow, ipRow]
    .map((row) => row?.lockedUntil ?? null)
    .filter((value): value is Date => value !== null && value > now)
    .sort((a, b) => b.getTime() - a.getTime())[0];

  return lock
    ? { blocked: true, retryAfterSec: retryAfterSec(lock, now) }
    : { blocked: false, retryAfterSec: 0 };
}

export async function clearLoginRateLimits(email: string, clientIp: string | null): Promise<void> {
  await prisma.authRateLimit.deleteMany({ where: { key: { in: rateLimitKeyPair(email, clientIp) } } });
}