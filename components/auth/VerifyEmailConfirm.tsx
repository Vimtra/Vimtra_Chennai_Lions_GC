"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Clock, RotateCcw, Loader2, MailCheck } from "lucide-react";
import { confirmEmailAction } from "@/app/verify-email/actions";

type Reason = "invalid" | "expired" | "used";

/**
 * The interactive half of /verify-email.
 *
 * The server has already peeked at the token (read-only) and passed the
 * outcome down. A live token renders a "Confirm my email" button; pressing
 * it is what consumes the token. Opening the page — by a person, a mail
 * client's link preview, or a security scanner — writes nothing.
 */
export default function VerifyEmailConfirm({
  token,
  next,
  initial,
}: {
  token: string;
  /** Internal path to continue to after confirming (validated server-side too). */
  next?: string;
  initial: { ok: true; email: string } | { ok: false; reason: Reason };
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [state, setState] = useState<
    | { kind: "ready"; email: string }
    | { kind: "done"; redirectTo: string }
    | { kind: "failed"; reason: Reason }
    | { kind: "error" }
  >(initial.ok ? { kind: "ready", email: initial.email } : { kind: "failed", reason: initial.reason });

  const confirm = () => {
    if (pending) return;
    start(async () => {
      try {
        const fd = new FormData();
        fd.set("token", token);
        if (next) fd.set("next", next);
        const r = await confirmEmailAction(fd);
        setState(r.ok ? { kind: "done", redirectTo: r.redirectTo } : { kind: "failed", reason: r.reason });
      } catch {
        setState({ kind: "error" });
      }
    });
  };

  // The account is active the moment the server says so; carry the person
  // on after a beat so the confirmation is actually seen.
  useEffect(() => {
    if (state.kind !== "done") return;
    const t = window.setTimeout(() => {
      router.push(state.redirectTo);
      router.refresh();
    }, 1400);
    return () => window.clearTimeout(t);
  }, [state, router]);

  const view =
    state.kind === "done"
      ? {
          icon: <CheckCircle2 className="vfy-icon vfy-icon-ok" aria-hidden />,
          eyebrow: "Account ready",
          heading: "Your email is confirmed.",
          body: "You're signed in and your account is active. Taking you to your account now…",
          tone: "ok" as const,
        }
      : state.kind === "ready"
        ? {
            icon: <MailCheck className="vfy-icon vfy-icon-ok" aria-hidden />,
            eyebrow: "One more step",
            heading: "Confirm this is you.",
            body: `Press the button to confirm ${state.email} as the address on your account. This link works once and expires 24 hours after it was sent.`,
            tone: "ok" as const,
          }
        : state.kind === "error"
          ? {
              icon: <XCircle className="vfy-icon vfy-icon-bad" aria-hidden />,
              eyebrow: "Something went wrong",
              heading: "We couldn't reach the server.",
              body: "Nothing was changed. Try the button again in a moment.",
              tone: "bad" as const,
            }
          : state.reason === "expired"
            ? {
                icon: <Clock className="vfy-icon vfy-icon-warn" aria-hidden />,
                eyebrow: "Link expired",
                heading: "That link has expired.",
                body: "Verification links are valid for 24 hours. Sign in and use “Send a new link” to get a fresh one.",
                tone: "warn" as const,
              }
            : state.reason === "used"
              ? {
                  icon: <RotateCcw className="vfy-icon vfy-icon-warn" aria-hidden />,
                  eyebrow: "Already used",
                  heading: "That link has already been used.",
                  body: "Each verification link works once. If your address is already confirmed there is nothing more to do — your account page will show its status.",
                  tone: "warn" as const,
                }
              : {
                  icon: <XCircle className="vfy-icon vfy-icon-bad" aria-hidden />,
                  eyebrow: "Invalid link",
                  heading: "We could not verify that link.",
                  body: "It may have been copied incompletely from your email. Sign in and use “Send a new link” to get a fresh one.",
                  tone: "bad" as const,
                };

  return (
    <div className={`vfy-panel vfy-${view.tone}`} data-rise aria-live="polite">
      {view.icon}
      <p className="vfy-eyebrow">{view.eyebrow}</p>
      <h2 className="vfy-heading">{view.heading}</h2>
      <p className="vfy-body">{view.body}</p>
      <div className="vfy-actions">
        {state.kind === "ready" || state.kind === "error" ? (
          <button type="button" className="hp-btn hp-btn-solid" onClick={confirm} disabled={pending}>
            {pending ? (
              <>
                <Loader2 size={14} className="vfy-spin" aria-hidden /> Confirming…
              </>
            ) : (
              "Confirm my email"
            )}
          </button>
        ) : state.kind === "done" ? (
          <Link href={state.redirectTo} className="hp-btn hp-btn-solid">
            Continue
          </Link>
        ) : (
          <Link href="/check-email" className="hp-btn hp-btn-solid">
            Send a new link
          </Link>
        )}
        <Link href="/shop" className="hp-btn hp-btn-text">
          Visit the shop
          <span className="hp-arrow" aria-hidden>
            →
          </span>
        </Link>
      </div>
    </div>
  );
}
