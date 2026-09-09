import "server-only";

/**
 * SMS transport.
 *
 * THERE IS NO SMS PROVIDER CONFIGURED ON THIS PROJECT. No provider
 * credentials exist in the environment and no provider SDK is installed.
 * This module therefore does exactly one honest thing today: it reports
 * `not-configured`, and the OTP flow above it refuses to claim that a
 * message was sent.
 *
 * THE ONE RULE THIS FILE EXISTS TO ENFORCE. A verification UI that says
 * "code sent" when nothing was sent is worse than no UI at all — the user
 * waits for a message that cannot arrive, and an operator reading the
 * screen believes delivery works. So `sendSms` never returns `sent: true`
 * unless a real provider actually accepted the message. There is no
 * development shortcut here, no console-log delivery, and no mock branch
 * that could survive into production by accident.
 *
 * TO ENABLE SMS. Pick a provider, install its SDK, set the variables it
 * needs, and implement the one marked branch below. The shape of
 * `sendSms` is what the rest of the app depends on; nothing outside this
 * file needs to change. See .env.example for the variable names this
 * module looks for.
 *
 *   SMS_PROVIDER        — provider id, e.g. "twilio". Unset = disabled.
 *   SMS_FROM            — sender id / originating number shown on the handset.
 *   SMS_ACCOUNT_SID     — provider account identifier.
 *   SMS_AUTH_TOKEN      — provider secret. Never logged.
 *
 * India-specific note for whoever wires this up: transactional SMS to
 * Indian handsets requires a DLT-registered sender id and a pre-approved
 * template. A provider account alone is not sufficient for delivery.
 */

export type SmsResult =
  | { sent: true; provider: string }
  | { sent: false; reason: "not-configured" }
  | { sent: false; reason: "error"; detail: string };

export interface SmsMessage {
  /** E.164 destination, as produced by normalisePhone(). */
  to: string;
  /** Message body. Callers must not put anything secret in a log line. */
  body: string;
}

/** True only when a real provider is fully configured. */
export function isSmsConfigured(): boolean {
  const provider = (process.env.SMS_PROVIDER ?? "").trim();
  if (!provider) return false;
  const from = (process.env.SMS_FROM ?? "").trim();
  const sid = (process.env.SMS_ACCOUNT_SID ?? "").trim();
  const token = (process.env.SMS_AUTH_TOKEN ?? "").trim();
  return Boolean(from && sid && token);
}

/** Provider id, or null when SMS is disabled. Safe to show an admin. */
export function smsProviderName(): string | null {
  return isSmsConfigured() ? (process.env.SMS_PROVIDER ?? "").trim() : null;
}

/**
 * Send one SMS. Never throws — every failure comes back as a typed result,
 * the same contract lib/mail.ts's sendMail() uses.
 *
 * Never logs `message.body`: for the OTP flow that body contains the code.
 */
export async function sendSms(message: SmsMessage): Promise<SmsResult> {
  if (!isSmsConfigured()) return { sent: false, reason: "not-configured" };

  const provider = (process.env.SMS_PROVIDER ?? "").trim();
  try {
    switch (provider) {
      // ---------------------------------------------------------------
      // IMPLEMENT YOUR PROVIDER HERE.
      //
      // Install its SDK, call it with SMS_ACCOUNT_SID / SMS_AUTH_TOKEN /
      // SMS_FROM and `message.to` / `message.body`, and return
      // `{ sent: true, provider }` only once the provider has actually
      // accepted the message for delivery.
      //
      // case "twilio": {
      //   const client = twilio(process.env.SMS_ACCOUNT_SID, process.env.SMS_AUTH_TOKEN);
      //   await client.messages.create({
      //     to: message.to,
      //     from: process.env.SMS_FROM,
      //     body: message.body,
      //   });
      //   return { sent: true, provider };
      // }
      // ---------------------------------------------------------------
      default:
        // Configured with a provider name this build does not implement.
        // Reported as an error, never as a success.
        return {
          sent: false,
          reason: "error",
          detail: `SMS_PROVIDER "${provider}" is set but no transport is implemented for it in lib/sms.ts.`,
        };
    }
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Unknown SMS transport error.";
    // Provider error text only. Never the body, never the credentials.
    console.error("[sms] send failed:", detail);
    return { sent: false, reason: "error", detail };
  }
}
