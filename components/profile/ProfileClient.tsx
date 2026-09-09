"use client";

import AccountSettingsForm from "@/components/profile/AccountSettingsForm";
import AccountNav from "@/components/profile/AccountNav";
import VerificationPanel from "@/components/profile/VerificationPanel";

export interface VerificationView {
  email: string;
  emailVerified: boolean;
  phone: string | null;
  phoneVerified: boolean;
  pendingPhone: string | null;
}

/**
 * Authenticated account home — personal details and password change only.
 * Fake membership / loyalty / RSVP demo blocks were removed; those features
 * do not exist in the data model.
 */
export default function ProfileClient({
  user,
  verification,
  smsAvailable = false,
}: {
  user: { name: string; email: string; role: string };
  /** Verification status, read server-side in app/profile/page.tsx. Null only
   *  if the user row vanished between the session check and the read. */
  verification?: VerificationView | null;
  smsAvailable?: boolean;
  /** Retained so /profile's existing ?saved / ?error links keep type-checking.
   *  Status is now reported inline by the form itself. */
  saved?: boolean;
  error?: string;
}) {
  return (
    <div className="profile-page acct-shell">
      <AccountNav />

      <div className="acct-body">
        <header className="acct-section-head">
          <p className="acct-kicker">Personal information</p>
          <h2 className="acct-section-title">Profile</h2>
          <p className="acct-section-lead">
            Update the name and email on your account. Leave the password
            fields empty to keep your current password.
          </p>
        </header>

        <div className="acct-panel">
          <AccountSettingsForm user={{ name: user.name, email: user.email }} />
        </div>

        {verification && (
          <VerificationPanel status={verification} smsAvailable={smsAvailable} />
        )}
      </div>
    </div>
  );
}
