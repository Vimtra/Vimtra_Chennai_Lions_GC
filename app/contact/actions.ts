"use server";

export interface ContactResult {
  ok: boolean;
  message: string;
}

/**
 * Contact form Server Action. For now it validates and logs server-side;
 * wire this to email/DB (see CLAUDE.md → Admin/data layer) when available.
 */
export async function submitContact(formData: FormData): Promise<ContactResult> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const topic = String(formData.get("topic") ?? "Membership");

  if (!name || !email || !message) {
    return { ok: false, message: "Please add your name, email, and a message." };
  }

  console.log("[contact]", {
    topic,
    name,
    email,
    phone: formData.get("phone"),
    city: formData.get("city"),
    message,
  });

  return {
    ok: true,
    message: "Roger. We'll be back to you within two working days.",
  };
}
