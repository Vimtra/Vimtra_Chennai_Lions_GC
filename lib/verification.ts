import "server-only";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

/**
 * Email + phone verification core (M6).
 *
 * This is the only module that ever sees a raw verification token or OTP.
 * Everything it persists is a SHA-256 hash, matching the schema comment on
 * EmailVerificationToken / PhoneOtp: a leaked database row must not carry a
 * usable secret.
 *
 * WHY PLAIN SHA-256 AND NOT BCRYPT OR AN HMAC. These secrets are unlike
 * passwords in two ways that matter. They are high-entropy (256 bits for the
 * email token; the OTP's 6 digits are protected by a hard attempt cap and a
 * 10-minute expiry, not by hash cost), and they are short-lived. Against a
 * high-entropy input a slow hash buys nothing an attacker cannot already not
 * do, while costing real latency on every verification. An HMAC would add a
 * key to manage, rotate and leak; the schema comment already records that
 * decision. SHA-256 over a CSPRNG value is the right tool here.
 *
 * SINGLE-USE IS ENFORCED BY THE DATABASE, NOT BY A READ-THEN-WRITE. Both
 * consume paths use a conditional `updateMany` guarded on the not-yet-used
 * column (`usedAt: null` / `consumedAt: null`). Two concurrent requests
 * carrying the same token therefore cannot both succeed: exactly one
 * UPDATE matches a row, the other matches zero and is rejected. A
 * read-then-write would leave that race open.
 */

// ---------------------------------------------------------------------------
// Policy — all durations in milliseconds.

/** Email links are followed from an inbox, sometimes hours later. */
const EMAIL_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
/** An OTP is typed from a phone that is in the user's hand right now. */
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

/** Minimum gap between two sends, so "resend" cannot be used as a mail gun. */
const EMAIL_RESEND_COOLDOWN_MS = 60 * 1000; // 1 minute
const OTP_RESEND_COOLDOWN_MS = 60 * 1000; // 1 minute

/** Ceiling per rolling window, so a patient attacker cannot drip past the cooldown. */
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_EMAIL_TOKENS_PER_WINDOW = 5;
const MAX_OTPS_PER_WINDOW = 5;

/** Wrong codes tolerated per issued OTP before that OTP is dead. 6 digits
 *  with 5 attempts leaves a 1-in-200,000 blind-guess chance per OTP. */
const MAX_OTP_ATTEMPTS = 5;

// ---------------------------------------------------------------------------
// Primitives

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex");
}

/** 256 bits of CSPRNG entropy, hex-encoded for a URL-safe link parameter. */
function generateEmailToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * A 6-digit code from the CSPRNG. `crypto.randomInt` is used rather than
 * `Math.random()` (not cryptographically random) and rather than
 * `randomBytes % 1000000` (modulo bias): randomInt rejects-and-retries
 * internally, so every code from 000000 to 999999 is equally likely.
 */
function generateOtpCode(): string {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

/** Constant-time comparison of two hex digests of equal length. */
function hashesEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  if (ba.length !== bb.length || ba.length === 0) return false;
  return crypto.timingSafeEqual(ba, bb);
}

/**
 * Normalise a phone number to a comparable E.164-ish form.
 *
 * Stored and compared in one shape so "+91 98765 43210", "098765 43210" and
 * "9876543210" are the same number rather than three. India is assumed for
 * bare 10-digit input because the checkout address form already defaults
 * `country` to India — this is the app's existing assumption, not a new one.
 * Returns null when the input cannot be a real number, and the caller
 * rejects it rather than storing something unusable.
 */
export function normalisePhone(raw: string): string | null {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return null;
  const hadPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;

  if (hadPlus) {
    // Already international — 8..15 digits per E.164.
    return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
  }
  if (digits.length === 10) return `+91${digits}`; // bare Indian mobile
  if (digits.length === 11 && digits.startsWith("0")) return `+91${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
}

// ---------------------------------------------------------------------------
// Result types — callers never receive a raw secret except `issueEmailToken`,
// which hands the token straight to the mail layer and nowhere else.

export type IssueResult =
  | { ok: true; token: string; expiresAt: Date }
  | { ok: false; reason: "already-verified" | "cooldown" | "rate-limited"; retryAfterSec?: number };

export type OtpIssueResult =
  | { ok: true; code: string; phone: string; expiresAt: Date }
  | {
      ok: false;
      reason: "already-verified" | "cooldown" | "rate-limited" | "invalid-phone";
      retryAfterSec?: number;
    };

export type ConsumeResult =
  | { ok: true; userId: string }
  | { ok: false; reason: "invalid" | "expired" | "used" };

export type OtpVerifyResult =
  | { ok: true; phone: string }
  | { ok: false; reason: "invalid" | "expired" | "no-pending" | "too-many-attempts"; attemptsLeft?: number };

// ---------------------------------------------------------------------------
// Email verification

/**
 * Issue an email-verification token for a user.
 *
 * Returns the RAW token exactly once, to be placed in the emailed link. Only
 * its hash is written. Refuses when the address is already verified (no point
 * minting a secret nobody needs), when the last send was under a minute ago,
 * and when this user has already been issued the per-hour maximum.
 */
export async function issueEmailVerificationToken(userId: string): Promise<IssueResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, emailVerifiedAt: true },
  });
  if (!user) return { ok: false, reason: "already-verified" }; // never confirm existence
  if (user.emailVerifiedAt) return { ok: false, reason: "already-verified" };

  const now = new Date();
  const windowStart = new Date(now.getTime() - RATE_WINDOW_MS);

  const recent = await prisma.emailVerificationToken.findMany({
    where: { userId, createdAt: { gte: windowStart } },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  if (recent.length > 0) {
    const sinceLast = now.getTime() - recent[0].createdAt.getTime();
    if (sinceLast < EMAIL_RESEND_COOLDOWN_MS) {
      return {
        ok: false,
        reason: "cooldown",
        retryAfterSec: Math.ceil((EMAIL_RESEND_COOLDOWN_MS - sinceLast) / 1000),
      };
    }
  }
  if (recent.length >= MAX_EMAIL_TOKENS_PER_WINDOW) {
    return { ok: false, reason: "rate-limited", retryAfterSec: 60 * 60 };
  }

  const token = generateEmailToken();
  const expiresAt = new Date(now.getTime() + EMAIL_TOKEN_TTL_MS);
  await prisma.emailVerificationToken.create({
    data: { userId, tokenHash: sha256(token), expiresAt },
  });
  return { ok: true, token, expiresAt };
}

/**
 * Consume a token from a verification link and mark the address verified.
 *
 * Ordering matters: the token is claimed FIRST via a conditional update, and
 * only a claim that actually matched a row goes on to touch User. That makes
 * the link single-use even if it is opened twice simultaneously (email
 * scanners routinely pre-fetch links), because the second claim matches no
 * row. Expiry is checked before claiming so an expired link reports
 * "expired" rather than being silently burned.
 */
export async function consumeEmailVerificationToken(rawToken: string): Promise<ConsumeResult> {
  const token = (rawToken ?? "").trim();
  if (!token) return { ok: false, reason: "invalid" };

  const row = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash: sha256(token) },
    select: { id: true, userId: true, expiresAt: true, usedAt: true },
  });
  if (!row) return { ok: false, reason: "invalid" };
  if (row.usedAt) return { ok: false, reason: "used" };
  if (row.expiresAt < new Date()) return { ok: false, reason: "expired" };

  const claimed = await prisma.emailVerificationToken.updateMany({
    where: { id: row.id, usedAt: null },
    data: { usedAt: new Date() },
  });
  if (claimed.count !== 1) return { ok: false, reason: "used" }; // lost the race

  // Only the winner writes to User, and only this one column.
  await prisma.user.update({
    where: { id: row.userId },
    data: { emailVerifiedAt: new Date() },
  });

  // Any other live token for this user is now pointless — retire them so a
  // second link sitting in the inbox cannot be replayed later.
  await prisma.emailVerificationToken.updateMany({
    where: { userId: row.userId, usedAt: null },
    data: { usedAt: new Date() },
  });

  return { ok: true, userId: row.userId };
}

// ---------------------------------------------------------------------------
// Phone verification

/**
 * Issue an OTP for a phone number.
 *
 * Returns the RAW code exactly once, for the SMS layer alone. Callers MUST
 * NOT log it, return it to the browser, or put it in an error message.
 *
 * Deliberately does not tell the caller whether another account already uses
 * this number: enumerating "is this phone registered" is exactly the leak
 * the requirement forbids. A duplicate number simply cannot end up verified
 * on two accounts, which is enforced at the verify step.
 */
export async function issuePhoneOtp(userId: string, rawPhone: string): Promise<OtpIssueResult> {
  const phone = normalisePhone(rawPhone);
  if (!phone) return { ok: false, reason: "invalid-phone" };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, phone: true, phoneVerifiedAt: true },
  });
  if (!user) return { ok: false, reason: "already-verified" };
  if (user.phoneVerifiedAt && user.phone === phone) {
    return { ok: false, reason: "already-verified" };
  }

  const now = new Date();
  const windowStart = new Date(now.getTime() - RATE_WINDOW_MS);
  const recent = await prisma.phoneOtp.findMany({
    where: { userId, createdAt: { gte: windowStart } },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  if (recent.length > 0) {
    const sinceLast = now.getTime() - recent[0].createdAt.getTime();
    if (sinceLast < OTP_RESEND_COOLDOWN_MS) {
      return {
        ok: false,
        reason: "cooldown",
        retryAfterSec: Math.ceil((OTP_RESEND_COOLDOWN_MS - sinceLast) / 1000),
      };
    }
  }
  if (recent.length >= MAX_OTPS_PER_WINDOW) {
    return { ok: false, reason: "rate-limited", retryAfterSec: 60 * 60 };
  }

  const code = generateOtpCode();
  const expiresAt = new Date(now.getTime() + OTP_TTL_MS);

  // Retire any still-live code for this user before minting a new one, so
  // only the most recent OTP can ever be used.
  await prisma.phoneOtp.updateMany({
    where: { userId, consumedAt: null },
    data: { consumedAt: now },
  });

  await prisma.phoneOtp.create({
    data: { userId, phone, codeHash: sha256(code), expiresAt },
  });

  return { ok: true, code, phone, expiresAt };
}

/**
 * Verify a submitted OTP.
 *
 * A wrong code increments `attempts` on the pending row; once the cap is hit
 * the row is consumed outright, so brute force costs a fresh request (which
 * is itself cooldown- and rate-limited) rather than another free guess.
 *
 * `phoneVerifiedAt` and `phone` are written together in one update so the
 * pair can never disagree — a verified timestamp always describes the number
 * stored beside it.
 */
export async function verifyPhoneOtp(userId: string, rawCode: string): Promise<OtpVerifyResult> {
  const code = (rawCode ?? "").replace(/\D/g, "");

  const row = await prisma.phoneOtp.findFirst({
    where: { userId, consumedAt: null },
    orderBy: { createdAt: "desc" },
    select: { id: true, phone: true, codeHash: true, attempts: true, expiresAt: true },
  });
  if (!row) return { ok: false, reason: "no-pending" };

  if (row.expiresAt < new Date()) {
    await prisma.phoneOtp.updateMany({
      where: { id: row.id, consumedAt: null },
      data: { consumedAt: new Date() },
    });
    return { ok: false, reason: "expired" };
  }

  if (code.length !== 6 || !hashesEqual(sha256(code), row.codeHash)) {
    const attempts = row.attempts + 1;
    if (attempts >= MAX_OTP_ATTEMPTS) {
      await prisma.phoneOtp.updateMany({
        where: { id: row.id, consumedAt: null },
        data: { attempts, consumedAt: new Date() },
      });
      return { ok: false, reason: "too-many-attempts", attemptsLeft: 0 };
    }
    await prisma.phoneOtp.update({ where: { id: row.id }, data: { attempts } });
    return { ok: false, reason: "invalid", attemptsLeft: MAX_OTP_ATTEMPTS - attempts };
  }

  // Correct code — claim the row conditionally so a double submit cannot
  // consume it twice.
  const claimed = await prisma.phoneOtp.updateMany({
    where: { id: row.id, consumedAt: null },
    data: { consumedAt: new Date() },
  });
  if (claimed.count !== 1) return { ok: false, reason: "no-pending" };

  await prisma.user.update({
    where: { id: userId },
    data: { phone: row.phone, phoneVerifiedAt: new Date() },
  });

  return { ok: true, phone: row.phone };
}

// ---------------------------------------------------------------------------
// Status — what the profile page renders.

export interface VerificationStatus {
  email: string;
  emailVerified: boolean;
  phone: string | null;
  phoneVerified: boolean;
  /** A code is outstanding for this number and has not expired. */
  pendingPhone: string | null;
}

export async function getVerificationStatus(userId: string): Promise<VerificationStatus | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, emailVerifiedAt: true, phone: true, phoneVerifiedAt: true },
  });
  if (!user) return null;

  const pending = await prisma.phoneOtp.findFirst({
    where: { userId, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    select: { phone: true },
  });

  return {
    email: user.email,
    emailVerified: Boolean(user.emailVerifiedAt),
    phone: user.phone,
    phoneVerified: Boolean(user.phoneVerifiedAt),
    pendingPhone: pending?.phone ?? null,
  };
}

export const VERIFICATION_POLICY = {
  EMAIL_TOKEN_TTL_MS,
  OTP_TTL_MS,
  EMAIL_RESEND_COOLDOWN_MS,
  OTP_RESEND_COOLDOWN_MS,
  RATE_WINDOW_MS,
  MAX_EMAIL_TOKENS_PER_WINDOW,
  MAX_OTPS_PER_WINDOW,
  MAX_OTP_ATTEMPTS,
} as const;
