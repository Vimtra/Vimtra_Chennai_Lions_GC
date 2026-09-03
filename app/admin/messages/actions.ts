"use server";

import { revalidatePath } from "next/cache";
import type { ContactStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { setContactMessageStatus, deleteContactMessage } from "@/lib/contact-messages";
import type { DeleteActionResult } from "@/components/admin/ConfirmDeleteButton";

const STATUSES: ContactStatus[] = ["NEW", "READ", "RESOLVED"];

/**
 * One action for every status transition — same shape as
 * app/admin/users/actions.ts's setRoleAction: a plain form submits the
 * target state as a hidden field, so no separate markRead/markResolved
 * action pair is needed and the transition can run in either direction
 * (an admin can reopen a RESOLVED enquiry as well as resolve one).
 */
export async function setContactMessageStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const raw = String(formData.get("status") ?? "").toUpperCase();
  if (!id || !(STATUSES as string[]).includes(raw)) return;
  await setContactMessageStatus(id, raw as ContactStatus);
  revalidatePath("/admin/messages");
}

export async function deleteContactMessageAction(
  formData: FormData
): Promise<DeleteActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { ok: false, error: "Missing enquiry identifier." };

  const removed = await deleteContactMessage(id);
  if (!removed) {
    return {
      ok: false,
      error: "That enquiry could not be deleted. Reload and try again.",
    };
  }
  revalidatePath("/admin/messages");
  return { ok: true };
}
