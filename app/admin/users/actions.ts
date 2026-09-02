"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function setRoleAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "");
  if (role !== "USER" && role !== "ADMIN") return;
  // Prevent admins from removing their own admin access (lockout guard).
  if (id === admin.id) return;
  await prisma.user.update({ where: { id }, data: { role } });
  revalidatePath("/admin/users");
}

/** Outcome so the confirmation dialog can report a refusal or a failure. */
export type UserActionResult = { ok: true } | { ok: false; error: string };

export async function deleteUserAction(
  formData: FormData
): Promise<UserActionResult> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { ok: false, error: "Missing user identifier." };

  // Lockout guard, unchanged — but it now says so instead of silently
  // doing nothing and looking like a success.
  if (id === admin.id) {
    return { ok: false, error: "You cannot delete your own account." };
  }

  try {
    await prisma.user.delete({ where: { id } });
  } catch (err) {
    // Previously `.catch(() => {})` swallowed this, so a failed delete
    // reported success and the row simply stayed in the table.
    console.error("[deleteUserAction]", err);
    return {
      ok: false,
      error: "That account could not be deleted. Reload and try again.",
    };
  }

  revalidatePath("/admin/users");
  return { ok: true };
}
