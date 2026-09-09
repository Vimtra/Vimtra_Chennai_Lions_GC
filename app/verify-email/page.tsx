import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle, Clock, RotateCcw } from "lucide-react";
import StoryHero from "@/components/site/StoryHero";
import { Section } from "@/components/site/Section";
import { consumeEmailVerificationToken } from "@/lib/verification";

export const metadata: Metadata = {
  title: "Verify Email",
  // A one-time token lives in this URL's query string. It must never be
  // indexed, and crawlers must not follow it and burn the token.
  robots: { index: false, follow: false },
};

// The token is consumed on load, so this can never be cached or prerendered.
export const dynamic = "force-dynamic";

/**
 * Email verification landing page.
 *
 * Reached only from the link in the verification email. The token arrives
 * as a query parameter, is consumed exactly once by
 * consumeEmailVerificationToken(), and each distinct failure is reported
 * with its own message so the person knows whether to click their newest
 * link, request a fresh one, or simply carry on already-verified.
 *
 * Deliberately does NOT require a session. The link is followed from a mail
 * client, often in a different browser from the one that signed up, and the
 * token itself is the proof of ownership — 256 bits of CSPRNG entropy tied
 * to one user row. Demanding a login here would strand exactly the people
 * the flow exists to serve, without adding security the token does not
 * already provide. It also does not create, alter, or elevate a session:
 * whatever the visitor was signed in as before, they still are.
 */
export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = await consumeEmailVerificationToken(token ?? "");

  const view = result.ok
    ? {
        icon: <CheckCircle2 className="vfy-icon vfy-icon-ok" aria-hidden />,
        eyebrow: "Verified",
        heading: "Your email is confirmed.",
        body: "Thank you. We can now reach you about orders and account changes at this address.",
        tone: "ok" as const,
      }
    : result.reason === "expired"
      ? {
          icon: <Clock className="vfy-icon vfy-icon-warn" aria-hidden />,
          eyebrow: "Link expired",
          heading: "That link has expired.",
          body: "Verification links are valid for 24 hours. Open your account page and send yourself a fresh one.",
          tone: "warn" as const,
        }
      : result.reason === "used"
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
            body: "It may have been copied incompletely from your email. Open your account page to send a fresh verification link.",
            tone: "bad" as const,
          };

  return (
    <>
      <StoryHero
        eyebrow="Account"
        title={["EMAIL", "VERIFICATION"]}
        line={view.heading}
      />

      <Section surface="ivory" size="tight">
        <div className="cm-track">
          <div className={`vfy-panel vfy-${view.tone}`} data-rise>
            {view.icon}
            <p className="vfy-eyebrow">{view.eyebrow}</p>
            <h2 className="vfy-heading">{view.heading}</h2>
            <p className="vfy-body">{view.body}</p>
            <div className="vfy-actions">
              <Link href="/profile" className="hp-btn hp-btn-solid">
                Go to my account
              </Link>
              <Link href="/shop" className="hp-btn hp-btn-text">
                Visit the shop
                <span className="hp-arrow" aria-hidden>
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
