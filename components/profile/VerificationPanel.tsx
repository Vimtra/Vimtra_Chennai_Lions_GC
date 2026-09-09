"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2, ShieldAlert } from "lucide-react";
import {
  resendVerificationEmailAction,
  requestPhoneOtpAction,
  verifyPhoneOtpAction,
  type VerificationActionResult,
} from "@/app/profile/verification-actions";

/**
 * Email + phone verification status and actions for the account page.
 *
 * Follows AccountSettingsForm's pattern exactly — call the server action
 * directly, keep the pending/success/error state here, and report inline —
 * so this reads as part of the same account surface rather than a new
 * mechanism. Uses the existing `.acct-*` / `.hp-btn` design-system classes;
 * no unrelated page is touched.
 *
 * `smsAvailable` is resolved on the server and passed down. When SMS is not
 * configured the phone form is not rendered at all: offering a "Send code"
 * button that cannot send is precisely the false affordance the brief
 * forbids, so the panel says plainly that the channel is unavailable.
 */
export default function VerificationPanel({
  status,
  smsAvailable,
}: {
  status: {
    email: string;
    emailVerified: boolean;
    phone: string | null;
    phoneVerified: boolean;
    pendingPhone: string | null;
  };
  smsAvailable: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<null | "email" | "otp-request" | "otp-verify">(null);
  const [msg, setMsg] = useState<{ tone: "ok" | "bad"; text: string } | null>(null);

  const run = useCallback(
    async (key: "email" | "otp-request" | "otp-verify", fn: () => Promise<VerificationActionResult>) => {
      if (busy) return;
      setBusy(key);
      setMsg(null);
      try {
        const res = await fn();
        setMsg(res.ok ? { tone: "ok", text: res.message } : { tone: "bad", text: res.error });
        if (res.ok) router.refresh();
      } catch {
        setMsg({ tone: "bad", text: "Something went wrong. Please try again." });
      } finally {
        setBusy(null);
      }
    },
    [busy, router]
  );

  const Badge = ({ verified }: { verified: boolean }) => (
    <span className={`vfy-badge ${verified ? "is-ok" : "is-pending"}`}>
      {verified ? <CheckCircle2 size={13} aria-hidden /> : <ShieldAlert size={13} aria-hidden />}
      {verified ? "Verified" : "Not verified"}
    </span>
  );

  return (
    <div className="acct-panel vfy-card">
      <h3 className="acct-panel-title">Verification</h3>

      {msg && (
        <p className={`vfy-msg ${msg.tone === "ok" ? "is-ok" : "is-bad"}`} role="status">
          {msg.tone === "ok" ? <CheckCircle2 size={15} aria-hidden /> : <AlertCircle size={15} aria-hidden />}
          {msg.text}
        </p>
      )}

      {/* ---------------- Email ---------------- */}
      <div className="vfy-row">
        <div className="vfy-row-head">
          <p className="vfy-row-label">Email</p>
          <Badge verified={status.emailVerified} />
        </div>
        <p className="vfy-row-value">{status.email}</p>

        {status.emailVerified ? (
          <p className="vfy-row-note">
            This address is confirmed. We use it for order updates and account changes.
          </p>
        ) : (
          <>
            <p className="vfy-row-note">
              We sent a link when your account was created. It is valid for 24 hours and
              can be used once.
            </p>
            <button
              type="button"
              className="hp-btn hp-btn-solid vfy-btn"
              disabled={busy !== null}
              onClick={() => run("email", resendVerificationEmailAction)}
            >
              {busy === "email" ? (
                <>
                  <Loader2 size={14} className="vfy-spin" aria-hidden /> Sending…
                </>
              ) : (
                "Send verification link"
              )}
            </button>
          </>
        )}
      </div>

      {/* ---------------- Phone ---------------- */}
      <div className="vfy-row">
        <div className="vfy-row-head">
          <p className="vfy-row-label">Mobile</p>
          <Badge verified={status.phoneVerified} />
        </div>
        <p className="vfy-row-value">{status.phone ?? "No number added"}</p>

        {status.phoneVerified ? (
          <p className="vfy-row-note">This number is confirmed.</p>
        ) : !smsAvailable ? (
          /* No provider configured. Say so — never render a Send button that
             cannot actually deliver anything. */
          <p className="vfy-row-note vfy-unavailable">
            Phone verification is not available yet — no SMS provider is configured on
            this deployment. Nothing will be sent until one is set up.
          </p>
        ) : (
          <>
            <form
              className="vfy-form"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                run("otp-request", () => requestPhoneOtpAction(fd));
              }}
            >
              <label className="vfy-label" htmlFor="vfy-phone">
                Mobile number
              </label>
              <div className="vfy-inline">
                <input
                  id="vfy-phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={20}
                  required
                  defaultValue={status.pendingPhone ?? status.phone ?? ""}
                  placeholder="+91 98765 43210"
                />
                <button type="submit" className="hp-btn hp-btn-solid vfy-btn" disabled={busy !== null}>
                  {busy === "otp-request" ? (
                    <>
                      <Loader2 size={14} className="vfy-spin" aria-hidden /> Sending…
                    </>
                  ) : (
                    "Send code"
                  )}
                </button>
              </div>
            </form>

            {status.pendingPhone && (
              <form
                className="vfy-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  run("otp-verify", () => verifyPhoneOtpAction(fd));
                }}
              >
                <label className="vfy-label" htmlFor="vfy-code">
                  Enter the 6-digit code sent to {status.pendingPhone}
                </label>
                <div className="vfy-inline">
                  <input
                    id="vfy-code"
                    name="code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    required
                    placeholder="000000"
                    className="vfy-code-input"
                  />
                  <button type="submit" className="hp-btn hp-btn-solid vfy-btn" disabled={busy !== null}>
                    {busy === "otp-verify" ? (
                      <>
                        <Loader2 size={14} className="vfy-spin" aria-hidden /> Checking…
                      </>
                    ) : (
                      "Verify code"
                    )}
                  </button>
                </div>
                <p className="vfy-row-note">
                  Codes expire after 10 minutes. Five incorrect attempts void the code.
                </p>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
