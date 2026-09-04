"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  verifyCredentials,
  registerUser,
  createSession,
  destroySession,
} from "@/lib/auth";
import { sendWelcomeEmail } from "@/lib/mail";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const signUpSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name."),
  email: z.string().email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

function urlWith(path: string, params: Record<string, string | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
  const q = sp.toString();
  return q ? `${path}?${q}` : path;
}

/** Only allow internal relative redirects (avoid open-redirect). */
function safeNext(next: string | undefined): string | undefined {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : undefined;
}

export async function signIn(formData: FormData) {
  const next = safeNext(String(formData.get("next") ?? ""));
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) redirect(urlWith("/sign-in", { error: "invalid", next }));

  let user;
  try {
    user = await verifyCredentials(parsed.data.email, parsed.data.password);
  } catch {
    redirect(urlWith("/sign-in", { error: "server", next }));
  }
  if (!user) redirect(urlWith("/sign-in", { error: "creds", next }));

  await createSession(user.id);
  redirect(next ?? (user.role === "ADMIN" ? "/admin" : "/profile"));
}

export async function signUp(formData: FormData) {
  const next = safeNext(String(formData.get("next") ?? ""));
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    redirect(urlWith("/sign-up", { error: parsed.error.issues[0]?.message ?? "invalid", next }));
  }

  let result;
  try {
    result = await registerUser(parsed.data);
  } catch {
    redirect(urlWith("/sign-up", { error: "Something went wrong. Try again.", next }));
  }
  if (!result.ok) redirect(urlWith("/sign-up", { error: result.error, next }));

  // Welcome email — fires exactly once, right here, only on a row that
  // registerUser() just actually created. It never runs from signIn()
  // below, and registerUser() itself only reaches `ok: true` once per
  // email address (the existing-account check above it, backed by the
  // User.email unique constraint), so there is no separate "already
  // welcomed" flag to add or forget: this call site IS the guarantee.
  // Awaited (same as the contact form's mail) so the send is given a
  // chance to complete before the function returns — but its outcome is
  // best-effort and never blocks account creation or sign-in either way.
  const siteHost = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000")
    .replace(/\/$/, "")
    .replace(/^https?:\/\//, "");
  const welcomeMail = await sendWelcomeEmail({
    name: result.user.name,
    email: result.user.email,
    siteHost,
  }).catch((err) => ({
    sent: false as const,
    reason: "error" as const,
    detail: err instanceof Error ? err.message : "Unknown error.",
  }));
  if (!welcomeMail.sent && welcomeMail.reason === "error") {
    console.error("[auth] welcome email failed:", welcomeMail.detail);
  }

  await createSession(result.user.id);
  redirect(next ?? "/profile");
}

export async function signOut() {
  await destroySession();
  redirect("/");
}
