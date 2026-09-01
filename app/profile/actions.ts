"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser, hashPassword } from "@/lib/auth";

const schema = z.object({
  name: z.string().trim().min(2),
  email: z.string().email(),
  password: z.string().min(8).optional().or(z.literal("")),
  confirmPassword: z.string().optional(),
});

export async function updateProfile(formData: FormData) {
  const user = await requireUser("/profile");
  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password") ?? "",
    confirmPassword: formData.get("confirmPassword") ?? "",
  });
  if (!parsed.success) redirect("/profile?error=invalid");
  if (parsed.data.password !== parsed.data.confirmPassword) redirect("/profile?error=password-mismatch");

  const email = parsed.data.email.trim().toLowerCase();

  // Guard email uniqueness when changing it.
  if (email !== user.email) {
    const taken = await prisma.user.findUnique({ where: { email } });
    if (taken) redirect("/profile?error=email-taken");
  }

  const data: { name: string; email: string; passwordHash?: string } = {
    name: parsed.data.name,
    email,
  };
  if (parsed.data.password) data.passwordHash = await hashPassword(parsed.data.password);

  await prisma.user.update({ where: { id: user.id }, data });
  revalidatePath("/profile");
  redirect("/profile?saved=1");
}
