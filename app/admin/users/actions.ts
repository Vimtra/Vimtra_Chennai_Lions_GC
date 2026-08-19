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

export async function deleteUserAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id === admin.id) return; // can't delete yourself
  await prisma.user.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/users");
}
