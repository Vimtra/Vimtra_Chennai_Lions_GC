"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2, MailOpen, Pencil, X } from "lucide-react";
import { resendPendingVerificationAction, changePendingEmailAction, type CheckEmailResult } from "@/app/check-email/actions";

/**
 * The "check your email" state shown between sign-up and first sign-in.
 *
 * Everything here acts on the session's own pending account through server
 * actions; nothing about verification is decided in the browser. The
 * countdown mirrors the server's cooldown so the button re-enables when a
 * resend will actually be accepted.
 */
export default function CheckEmailPanel({
  email,
  next,
  signupOutcome,
  signOut,
}: {
  /** Full address — shown only to the account holder's own session. */
  email: string;
  next?: string;
  /** "sent" / "failed" right after sign-up; null when arriving from sign-in. */
  signupOutcome: "sent" | "failed" | null;
  signOut: () => Promise<void>;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<null | "resend" | "change">(null);
  const [msg, setMsg] = useState<{ tone: "ok" | "bad"; text: string } | null>(
    signupOutcome === "failed"
      ? { tone: "bad", text: "We couldn't send the verification email just now. Use “Send a new link” below to try again." }
      : null
  );
  const [cooldown, setCooldown] = useState(0);
  const [editing, setEditing] = useState(false);
  const [shownEmail, setShownEmail] = useState(email);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => window.clearInterval(t);
  }, [cooldown]);

  const handle = (r: CheckEmailResult) => {
    if (r.ok) {
      setMsg({ tone: "ok", text: r.message });
      if (r.email) {
        setShownEmail(r.email);
        setEditing(false);
      }
      // A successful send starts the server's 60 s cooldown.
      setCooldown(60);
    } else {
      if (r.verified) {
        // Already verified (e.g. confirmed in another tab) — move on.
        router.push(next ?? "/profile");
        router.refresh();
        return;
      }
      setMsg({ tone: "bad", text: r.error });
      if (r.retryAfterSec) setCooldown(r.retryAfterSec);
    }
  };

  const run = (key: "resend" | "change", fn: () => Promise<CheckEmailResult>) => {
    if (busy) return;
    setBusy(key);
    setMsg(null);
    start(async () => {
      try {
        handle(await fn());
      } catch {
        setMsg({ tone: "bad", text: "Something went wrong. Please try again." });
      } finally {
        setBusy(null);
      }
    });
  };

  const masked = maskEmail(shownEmail);

  return (
    <div className="hp-auth-card" style={{ maxWidth: 520 }}>
      <ol className="vfy-steps" aria-label="Sign-up progress">
        <li className="is-done">Account created</li>
        <li className="is-current">Check your email</li>
        <li>Verify</li>
        <li>Account ready</li>
      </ol>

      <div className="flex items-start gap-3 mt-6 mb-5">
        <span className="vfy-mail-icon" aria-hidden>
          <MailOpen size={22} />
        </span>
        <div>
          <h1 className="font-sora font-extrabold text-[22px] tracking-[-0.02em] text-ink leading-tight">Check your email</h1>
          <p className="font-manrope text-[14px] text-muted mt-2 leading-relaxed">
            We sent a verification link to <strong className="text-ink">{masked}</strong>. Open it and press{" "}
            <strong className="text-ink">Confirm my email</strong> to activate your account. The link works once and
            expires in 24 hours.
          </p>
        </div>
      </div>

      {msg && (
        <p className={`vfy-msg ${msg.tone === "ok" ? "is-ok" : "is-bad"}`} role="status">
          {msg.tone === "ok" ? <CheckCircle2 size={15} aria-hidden /> : <AlertCircle size={15} aria-hidden />}
          {msg.text}
        </p>
      )}

      <div className="grid gap-3">
        <button
          type="button"
          className="cta-gold press justify-center"
          style={{ padding: 13 }}
          disabled={busy !== null || pending || cooldown > 0}
          onClick={() => {
            const fd = new FormData();
            if (next) fd.set("next", next);
            run("resend", () => resendPendingVerificationAction(fd));
          }}
        >
          {busy === "resend" ? (
            <>
              <Loader2 size={14} className="vfy-spin" aria-hidden /> SENDING…
            </>
          ) : cooldown > 0 ? (
            `SEND A NEW LINK (${cooldown}s)`
          ) : (
            "SEND A NEW LINK"
          )}
        </button>

        {!editing ? (
          <button type="button" className="vfy-link-btn" onClick={() => setEditing(true)} disabled={busy !== null}>
            <Pencil size={13} aria-hidden /> Wrong address? Change it
          </button>
        ) : (
          <form
            className="grid gap-3 rounded-[12px] p-4"
            style={{ background: "rgba(14,11,10,0.35)", border: "1px solid var(--hp-hair-dark)" }}
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              if (next) fd.set("next", next);
              run("change", () => changePendingEmailAction(fd));
            }}
          >
            <div className="field !mb-0">
              <label htmlFor="ce-email">New email address</label>
              <input id="ce-email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button type="submit" className="cta-gold press justify-center" style={{ padding: "10px 16px" }} disabled={busy !== null}>
                {busy === "change" ? "UPDATING…" : "UPDATE & RESEND"}
              </button>
              <button type="button" className="vfy-link-btn" onClick={() => setEditing(false)} disabled={busy !== null}>
                <X size={13} aria-hidden /> Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <p className="mt-6 font-manrope text-[12.5px] text-muted leading-relaxed">
        Can&rsquo;t find it? Check your spam or promotions folder. Already confirmed the link on another device?{" "}
        <button
          type="button"
          className="text-crimson-600 font-semibold underline-offset-2 hover:underline"
          onClick={() => {
            router.push(next ?? "/profile");
            router.refresh();
          }}
        >
          Continue
        </button>
        .
      </p>
      <form action={signOut} className="mt-3">
        <button type="submit" className="vfy-link-btn">
          Not you? Sign out
        </button>
      </form>
    </div>
  );
}

/** "j•••••@example.com" — recognisable to the owner, useless to a shoulder-surfer. */
function maskEmail(email: string): string {
  const at = email.indexOf("@");
  if (at <= 0) return email;
  const local = email.slice(0, at);
  return `${local.slice(0, 1)}${"•".repeat(Math.max(2, Math.min(local.length - 1, 5)))}${email.slice(at)}`;
}
