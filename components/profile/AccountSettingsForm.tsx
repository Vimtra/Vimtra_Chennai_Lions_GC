"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { updateProfile } from "@/app/profile/actions";
import PasswordField from "@/components/profile/PasswordField";

/**
 * Account settings — name, email and an optional password change.
 *
 * Submits the existing `updateProfile` server action directly so the result
 * is known here: inline validation before the round trip, a spinner during
 * it, and a confirmed success or the server's own message after. The action
 * keeps every security rule it had (8-character minimum, bcrypt hashing,
 * email-uniqueness guard).
 *
 * Password change is opt-in — both boxes empty means "keep my current
 * password", which is the behaviour this form has always had. The moment
 * either box is touched, both become required and must match.
 */
export default function AccountSettingsForm({
  user,
}: {
  user: { name: string; email: string };
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const pendingRef = useRef(false);

  // Clear a stale message as soon as the person starts fixing things.
  const onEdit = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (pendingRef.current) return; // no double submits

      const form = e.currentTarget;
      if (!form.reportValidity()) return;

      const formData = new FormData(form);
      const pw = String(formData.get("password") ?? "");
      const confirm = String(formData.get("confirmPassword") ?? "");

      // Inline validation first — a mismatch never reaches the server.
      if (pw || confirm) {
        if (!pw || !confirm) {
          setSuccess(null);
          setError("Enter the new password in both fields.");
          return;
        }
        if (pw.length < 8) {
          setSuccess(null);
          setError("Password must be at least 8 characters.");
          return;
        }
        if (pw !== confirm) {
          setSuccess(null);
          setError("New password and confirmation do not match.");
          return;
        }
      }

      pendingRef.current = true;
      setPending(true);
      setError(null);
      setSuccess(null);

      try {
        const result = await updateProfile(formData);
        if (result.ok) {
          setSuccess(
            result.passwordChanged
              ? "Password updated. Your profile has been saved."
              : "Profile updated."
          );
          // Never leave a typed password sitting in the DOM.
          const pwInput = form.querySelector<HTMLInputElement>('[name="password"]');
          const cfInput = form.querySelector<HTMLInputElement>('[name="confirmPassword"]');
          if (pwInput) pwInput.value = "";
          if (cfInput) cfInput.value = "";
          router.refresh();
        } else {
          setError(result.error);
        }
      } catch {
        setError("Could not reach the server. Please try again.");
      } finally {
        pendingRef.current = false;
        setPending(false);
      }
    },
    [router]
  );

  return (
    <form ref={formRef} onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {success && (
        <div
          role="status"
          className="sm:col-span-2 flex items-center gap-2 rounded-[12px] border border-emerald-600/25 bg-emerald-600/[0.08] px-3 py-2.5 font-manrope text-[13.5px] font-semibold text-emerald-700"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {success}
        </div>
      )}
      {error && (
        <div
          id="account-error"
          role="alert"
          className="sm:col-span-2 flex items-start gap-2 rounded-[12px] border border-crimson-600/25 bg-crimson-600/[0.08] px-3 py-2.5 font-manrope text-[13.5px] font-semibold text-crimson-600"
        >
          <AlertCircle className="mt-[2px] h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <fieldset
        disabled={pending}
        className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 border-0 p-0 m-0 disabled:opacity-60"
      >
        <div className="field">
          <label htmlFor="acct-name">Full Name</label>
          <input
            id="acct-name"
            type="text"
            name="name"
            required
            minLength={2}
            defaultValue={user.name}
            onChange={onEdit}
          />
        </div>
        <div className="field">
          <label htmlFor="acct-email">Email</label>
          <input
            id="acct-email"
            type="email"
            name="email"
            required
            defaultValue={user.email}
            onChange={onEdit}
          />
        </div>

        <PasswordField
          name="password"
          label="New Password"
          placeholder="Leave blank to keep current"
          minLength={8}
          invalid={Boolean(error)}
          describedBy={error ? "account-error" : undefined}
          onChange={onEdit}
        />
        <PasswordField
          name="confirmPassword"
          label="Confirm New Password"
          placeholder="Re-enter new password"
          minLength={8}
          invalid={Boolean(error)}
          describedBy={error ? "account-error" : undefined}
          onChange={onEdit}
        />

        <p className="sm:col-span-2 -mt-1 font-manrope text-[12.5px] text-muted">
          Leave both password fields empty to keep your current password.
          New passwords must be at least 8 characters.
        </p>
      </fieldset>

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="cta-gold press min-h-[44px] justify-center disabled:opacity-70"
          style={{ padding: "13px 22px" }}
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> SAVING…
            </>
          ) : (
            "SAVE CHANGES"
          )}
        </button>
      </div>
    </form>
  );
}
