"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { CONTACT_TOPICS } from "@/components/contact/topics";
import { createContactMessage } from "@/lib/contact-messages";
import {
  sendContactConfirmationToUser,
  sendContactNotificationToAdmin,
} from "@/lib/mail";

/**
 * Contact form Server Action.
 *
 * Flow: validate → persist → best-effort email. Each step is isolated
 * from the next so a failure downstream never erases work already done:
 * a submission that fails validation never reaches the database; once it
 * saves, the two emails run independently of each other and of the
 * database write that already succeeded — an email failure is logged
 * (never with the submitted content) and reported back as a normal
 * success, because the enquiry itself was not lost. That is the whole
 * point of storing it before mailing anything.
 *
 * Nothing here logs name, email, phone, city or message — the previous
 * version's `console.log("[contact]", {...})` on every submission put
 * the entire enquiry, PII included, into server logs. Failures now log
 * only a non-identifying diagnostic.
 */

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Please add your name.")
    .max(120, "Name is too long (120 characters max)."),
  email: z
    .string()
    .trim()
    .min(1, "Please add your email.")
    .max(254, "Email is too long.")
    .email("Enter a valid email address."),
  phone: z
    .string()
    .trim()
    .max(32, "Phone number is too long.")
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .trim()
    .max(120, "City is too long.")
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a little more — at least 10 characters.")
    .max(4000, "Message is too long (4,000 characters max)."),
});

type ContactFieldErrors = Partial<
  Record<"name" | "email" | "phone" | "city" | "message", string>
>;

export interface ContactResult {
  ok: boolean;
  message: string;
  fieldErrors?: ContactFieldErrors;
}

function toCategory(raw: FormDataEntryValue | null): string {
  const s = String(raw ?? "").trim();
  const match = (CONTACT_TOPICS as readonly string[]).find(
    (t) => t.toLowerCase() === s.toLowerCase()
  );
  return match ?? CONTACT_TOPICS[0];
}

export async function submitContact(formData: FormData): Promise<ContactResult> {
  const category = toCategory(formData.get("topic"));

  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    city: formData.get("city"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    const fieldErrors: ContactFieldErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof ContactFieldErrors;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      ok: false,
      message: "Please check the highlighted fields and try again.",
      fieldErrors,
    };
  }

  const { name, email, message } = parsed.data;
  const phone = parsed.data.phone?.trim() || null;
  const city = parsed.data.city?.trim() || null;

  let saved;
  try {
    saved = await createContactMessage({ name, email, phone, city, category, message });
  } catch (err) {
    // Never log the submitted fields — only that the write failed.
    console.error(
      "[contact] failed to save enquiry:",
      err instanceof Error ? err.message : "unknown error"
    );
    return {
      ok: false,
      message: "Something went wrong on our end. Please try again in a moment.",
    };
  }

  // Best-effort, independent of each other and of the save above, which
  // has already succeeded by this point. Neither result changes what is
  // returned to the visitor.
  const mailInput = {
    name,
    email,
    phone,
    city,
    category,
    message,
    submittedAt: saved.createdAt,
  };
  const [userMail, adminMail] = await Promise.allSettled([
    sendContactConfirmationToUser(mailInput),
    sendContactNotificationToAdmin(mailInput),
  ]);
  for (const [label, outcome] of [
    ["confirmation", userMail],
    ["notification", adminMail],
  ] as const) {
    if (outcome.status === "rejected") {
      console.error(`[contact] ${label} email threw:`, String(outcome.reason));
    } else if (!outcome.value.sent && outcome.value.reason === "error") {
      console.error(`[contact] ${label} email failed:`, outcome.value.detail);
    }
    // reason === "not-configured" is expected when SMTP isn't set up and
    // is not logged as an error.
  }

  revalidatePath("/admin/messages");

  return {
    ok: true,
    message: "Roger. We'll be back to you within two working days.",
  };
}
