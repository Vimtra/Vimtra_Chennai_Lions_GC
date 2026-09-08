"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

/** "This user cannot be deleted because they have existing orders." plus a
 *  count, used both by the pre-check and by the race-condition catch below
 *  so the two paths can never disagree on wording. */
function existingOrdersError(count: number): string {
  return `This user cannot be deleted because they have existing orders. (${count} order${count === 1 ? "" : "s"})`;
}

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

  // Order.userId is a deliberate RESTRICT relation (see Order in
  // prisma/schema.prisma) — a customer's order history must never be
  // deleted or orphaned just because their account is removed. Checked
  // first so the common case (no orders) never has to round-trip through
  // a failing delete: prisma.user.delete() would otherwise hit Postgres
  // error 23001 (restrict_violation) on Order_userId_fkey and throw.
  const orderCount = await prisma.order.count({ where: { userId: id } });
  if (orderCount > 0) {
    return { ok: false, error: existingOrdersError(orderCount) };
  }

  try {
    await prisma.user.delete({ where: { id } });
  } catch (err) {
    // Race guard: an order placed between the count above and this call
    // hits the exact same RESTRICT constraint, which Prisma surfaces as
    // P2003 ("Foreign key constraint failed"). Every other FK pointing at
    // User (Session, Address) cascades on delete (see schema) — so a
    // P2003 here can only be Order_userId_fkey, and gets the identical
    // user-facing message the pre-check above would have given.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      const recount = await prisma.order.count({ where: { userId: id } }).catch(() => 1);
      console.error(
        "[deleteUserAction] blocked by existing orders (created after the pre-check):",
        id
      );
      return { ok: false, error: existingOrdersError(Math.max(recount, 1)) };
    }
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
