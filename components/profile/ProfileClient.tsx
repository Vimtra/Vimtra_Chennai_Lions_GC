"use client";

import AccountSettingsForm from "@/components/profile/AccountSettingsForm";
import AccountNav from "@/components/profile/AccountNav";

/**
 * Authenticated account home — personal details and password change only.
 * Fake membership / loyalty / RSVP demo blocks were removed; those features
 * do not exist in the data model.
 */
export default function ProfileClient({
  user,
}: {
  user: { name: string; email: string; role: string };
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
      </div>
    </div>
  );
}
