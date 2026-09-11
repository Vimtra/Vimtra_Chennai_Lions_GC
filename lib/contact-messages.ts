import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ContactMessage, ContactStatus } from "@prisma/client";

/**
 * Contact enquiry data layer — mirrors lib/media-coverage.ts's shape.
 *
 * One row per /contact submission. The public form only ever calls
 * createContactMessage(); everything else here is admin-only, consumed
 * from /admin/messages via lib/auth's requireAdmin() gate at the page
 * level, not in this file — same division of responsibility as every
 * other data-layer module in lib/.
 */

export type { ContactMessage, ContactStatus };
export { formatContactDate } from "./contact-messages-format";

export interface ContactMessageInput {
  name: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  category: string;
  message: string;
}

/** Called only from the public contact form's server action. */
export async function createContactMessage(
  input: ContactMessageInput
): Promise<ContactMessage> {
  return prisma.contactMessage.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone ?? null,
      city: input.city ?? null,
      category: input.category,
      message: input.message,
    },
  });
}

/** Newest first — the only ordering /admin/messages ever needs. */
export async function listContactMessages(): Promise<ContactMessage[]> {
  return prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Paged, filterable admin listing. `q` matches name, email, phone, city and
 * the message body (case-insensitive). Newest first.
 */
export async function searchContactMessages(opts: {
  status?: ContactStatus;
  q?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ rows: ContactMessage[]; total: number }> {
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, opts.pageSize ?? 25));
  const q = opts.q?.trim();
  const where: Prisma.ContactMessageWhereInput = {
    ...(opts.status ? { status: opts.status } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q } },
            { city: { contains: q, mode: "insensitive" } },
            { category: { contains: q, mode: "insensitive" } },
            { message: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const [rows, total] = await Promise.all([
    prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.contactMessage.count({ where }),
  ]);
  return { rows, total };
}

/** Powers the "N new" indicator on /admin and /admin/messages. */
export async function countNewContactMessages(): Promise<number> {
  return prisma.contactMessage.count({ where: { status: "NEW" } });
}

export async function getContactMessage(
  id: string
): Promise<ContactMessage | null> {
  return prisma.contactMessage.findUnique({ where: { id } });
}

export async function setContactMessageStatus(
  id: string,
  status: ContactStatus
): Promise<ContactMessage | null> {
  try {
    return await prisma.contactMessage.update({ where: { id }, data: { status } });
  } catch {
    return null;
  }
}

export async function deleteContactMessage(id: string): Promise<boolean> {
  try {
    await prisma.contactMessage.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
