import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPendingUser, safeNextPath } from "@/lib/auth";
import CheckEmailPanel from "@/components/auth/CheckEmailPanel";
import { signOut } from "@/app/(auth)/actions";

export const metadata: Metadata = {
  title: "Check your email",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Verify-before-activate holding state.
 *
 *   sign up → account created (emailVerifiedAt NULL) → THIS PAGE →
 *   link in inbox → /verify-email "Confirm my email" → account active →
 *   /profile (or the original destination)
 *
 * Who lands here: an account that is signed in at the cookie level but
 * gated by lib/auth's VERIFICATION_REQUIRED_SINCE rule. requireUser() sends
 * such accounts here from every protected page, and sign-in / sign-up
 * redirect here directly. Nobody else has a reason to be on this page:
 * no session → sign in; verified → straight on to the destination.
 *
 * The full address is rendered only to the account's own session (masked
 * in the copy); no token ever appears here.
 */
export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; verify?: string }>;
}) {
  const { next, verify } = await searchParams;
  const safeNext = safeNextPath(next);
  const user = await getPendingUser();

  if (!user) {
    redirect(safeNext ? `/sign-in?next=${encodeURIComponent(safeNext)}` : "/sign-in");
  }
  if (!user.verificationRequired) {
    redirect(safeNext ?? (user.role === "ADMIN" ? "/admin" : "/profile"));
  }

  const signupOutcome: "sent" | "failed" | null =
    verify === "sent" ? "sent" : verify === "failed" ? "failed" : null;

  return (
    <div className="admin-page hp-auth">
      <CheckEmailPanel email={user.email} next={safeNext} signupOutcome={signupOutcome} signOut={signOut} />
    </div>
  );
}
