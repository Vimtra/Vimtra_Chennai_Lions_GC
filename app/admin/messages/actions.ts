"use server";

import { revalidatePath } from "next/cache";
import type { ContactStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { setContactMessageStatus, deleteContactMessage } from "@/lib/contact-messages";
import type { ActionResult } from "@/lib/admin-action-result";

const STATUSES: ContactStatus[] = ["NEW", "READ", "RESOLVED"];

function revalidate() {
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}

/**
 * One action for every status transition — a plain form submits the target
 * state, so the transition can run in either direction (an admin can
 * reopen a RESOLVED enquiry as well as resolve one).
 */
export async function setContactMessageStatusAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const raw = String(formData.get("status") ?? "").toUpperCase();
  if (!id || !(STATUSES as string[]).includes(raw)) return { ok: false, error: "That status is not valid." };
  const updated = await setContactMessageStatus(id, raw as ContactStatus);
  if (!updated) return { ok: false, error: "That enquiry no longer exists." };
  revalidate();
  return { ok: true, message: `Marked as ${raw.toLowerCase()}.` };
}

export async function deleteContactMessageAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { ok: false, error: "Missing enquiry identifier." };
  const removed = await deleteContactMessage(id);
  if (!removed) return { ok: false, error: "That enquiry could not be deleted. Reload and try again." };
  revalidate();
  return { ok: true, message: "Enquiry deleted." };
}
