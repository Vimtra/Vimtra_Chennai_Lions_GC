import "server-only";
import { prisma } from "@/lib/prisma";
import type { Address } from "@prisma/client";

/**
 * Address book — one buyer can save multiple delivery addresses; one
 * (at most) can be marked as `isDefault`. The checkout flow reads the
 * default first, or the most-recently-updated address if none are
 * flagged.
 */

export type { Address };

export interface AddressInput {
  label?: string | null;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  isDefault?: boolean;
}

export async function listAddresses(userId: string): Promise<Address[]> {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
  });
}

export async function getAddress(
  userId: string,
  id: string
): Promise<Address | null> {
  const row = await prisma.address.findUnique({ where: { id } });
  return row && row.userId === userId ? row : null;
}

/** Returns the buyer's preferred default address, or the most recently
 *  updated one if none are flagged, or null if the address book is empty. */
export async function getDefaultAddress(userId: string): Promise<Address | null> {
  const preferred = await prisma.address.findFirst({
    where: { userId, isDefault: true },
    orderBy: { updatedAt: "desc" },
  });
  if (preferred) return preferred;
  return prisma.address.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
}

function sanitizeInput(input: AddressInput) {
  return {
    label: input.label?.trim() || null,
    fullName: input.fullName.trim(),
    phone: input.phone.trim(),
    line1: input.line1.trim(),
    line2: input.line2?.trim() || null,
    city: input.city.trim(),
    state: input.state.trim(),
    postalCode: input.postalCode.trim(),
    country: (input.country?.trim() || "India"),
    isDefault: !!input.isDefault,
  };
}

export async function createAddress(
  userId: string,
  input: AddressInput
): Promise<Address> {
  const data = sanitizeInput(input);
  // If the new row is marked default, unflag other rows first — enforced
  // as a transaction so we never leave two rows with isDefault=true.
  return prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      await tx.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }
    return tx.address.create({ data: { ...data, userId } });
  });
}

export async function updateAddress(
  userId: string,
  id: string,
  input: AddressInput
): Promise<Address | null> {
  const existing = await getAddress(userId, id);
  if (!existing) return null;
  const data = sanitizeInput(input);
  return prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      await tx.address.updateMany({
        where: { userId, isDefault: true, NOT: { id } },
        data: { isDefault: false },
      });
    }
    return tx.address.update({ where: { id }, data });
  });
}

export async function setDefaultAddress(
  userId: string,
  id: string
): Promise<boolean> {
  const existing = await getAddress(userId, id);
  if (!existing) return false;
  await prisma.$transaction(async (tx) => {
    await tx.address.updateMany({
      where: { userId, isDefault: true, NOT: { id } },
      data: { isDefault: false },
    });
    await tx.address.update({ where: { id }, data: { isDefault: true } });
  });
  return true;
}

export async function deleteAddress(
  userId: string,
  id: string
): Promise<boolean> {
  const existing = await getAddress(userId, id);
  if (!existing) return false;
  // Order.shippingAddressId is ON DELETE SET NULL, so historical orders
  // keep their frozen shippingSnapshot and lose only the soft FK.
  await prisma.address.delete({ where: { id } });
  return true;
}

/** Return a JSON-serialisable snapshot suitable for storing on Order.shippingSnapshot. */
export function addressToSnapshot(a: Address): Record<string, string | null> {
  return {
    label: a.label,
    fullName: a.fullName,
    phone: a.phone,
    line1: a.line1,
    line2: a.line2,
    city: a.city,
    state: a.state,
    postalCode: a.postalCode,
    country: a.country,
  };
}
