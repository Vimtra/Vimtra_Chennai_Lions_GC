import "server-only";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";

/**
 * Cover-image upload for the news desks (Official News and Media Coverage).
 *
 * This is the project's ONE image-storage mechanism, lifted from the product
 * catalogue rather than invented for this feature:
 *
 *   production  → Vercel Blob (public, immutable URL). The token arrives via
 *                 `BLOB_READ_WRITE_TOKEN`, which Vercel injects when a Blob
 *                 store is linked to the project. It is read here on the
 *                 server only and never reaches a client component or a
 *                 response body.
 *   local dev   → `public/uploads/` (git-ignored) when no token is set, so
 *                 the admin stays usable offline. This branch is a dev
 *                 convenience only — on Vercel the filesystem is read-only
 *                 and ephemeral, which is exactly why the Blob branch exists.
 *
 * Validation is server-side and is the source of truth; the client field
 * mirrors the same limits so the admin gets feedback before submitting.
 * Every failure is reported back as a plain-language message and the
 * calling action leaves the row unchanged.
 */

export const COVER_MAX_BYTES = 5 * 1024 * 1024;
export const COVER_ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export class CoverUploadError extends Error {}

export type SupportedImageType = (typeof COVER_ACCEPTED_TYPES)[number];

/**
 * Object-store namespaces. Products use the same mechanism as the news
 * desks — one storage path for every admin image, so the Blob/local
 * fallback rule lives in exactly one place.
 */
export type UploadFolder = "news" | "media" | "products";

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

const MIME_BY_SIGNATURE: Record<SupportedImageType, SupportedImageType> = {
  "image/jpeg": "image/jpeg",
  "image/png": "image/png",
  "image/webp": "image/webp",
  "image/avif": "image/avif",
};

function ascii(bytes: Uint8Array, start: number, length: number): string {
  return String.fromCharCode(...bytes.slice(start, start + length));
}

function hasPrefix(bytes: Uint8Array, prefix: number[]): boolean {
  return prefix.every((value, index) => bytes[index] === value);
}

function isAvif(bytes: Uint8Array): boolean {
  // ISO-BMFF files start with an ftyp box. Handle both the normal 32-bit
  // size and the extended 64-bit size without assuming a fixed byte offset.
  if (bytes.length < 16 || ascii(bytes, 4, 4) !== "ftyp") return false;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const size32 = view.getUint32(0);
  let boxStart = 8;
  let boxSize: number;
  if (size32 === 1) {
    if (bytes.length < 24) return false;
    const high = view.getUint32(8);
    const low = view.getUint32(12);
    boxSize = high * 2 ** 32 + low;
    boxStart = 16;
  } else if (size32 >= 16) {
    boxSize = size32;
  } else {
    return false;
  }
  if (!Number.isSafeInteger(boxSize) || boxSize > bytes.length || boxStart > boxSize) return false;

  const brands: string[] = [ascii(bytes, boxStart, 4)];
  for (let offset = boxStart + 8; offset + 4 <= boxSize; offset += 4) {
    brands.push(ascii(bytes, offset, 4));
  }
  return brands.some((brand) => brand === "avif" || brand === "avis" || brand === "mif1");
}

/** Detect the actual supported image format from its binary signature. */
export function detectImageType(bytes: Uint8Array): SupportedImageType | null {
  if (bytes.length >= 3 && hasPrefix(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (
    bytes.length >= 8 &&
    hasPrefix(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  ) {
    return "image/png";
  }
  if (bytes.length >= 12 && ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 4) === "WEBP") {
    return "image/webp";
  }
  if (isAvif(bytes)) return "image/avif";
  return null;
}

export function requiresBlobStorage(): boolean {
  return process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
}

/**
 * Store one uploaded cover and return its public URL / path.
 *
 * `folder` namespaces the object in the store ("news" | "media") so the two
 * content types never share a prefix and can be audited separately.
 */
export async function storeCoverImage(
  upload: File,
  folder: UploadFolder
): Promise<string> {
  const declaredType = upload.type.toLowerCase();
  if (!(COVER_ACCEPTED_TYPES as readonly string[]).includes(declaredType)) {
    throw new CoverUploadError(
      "That file type isn't supported. Upload a JPG, PNG, WebP or AVIF image."
    );
  }
  if (upload.size > COVER_MAX_BYTES) {
    throw new CoverUploadError("That image is over 5 MB. Please upload a smaller file.");
  }
  if (upload.size === 0) {
    throw new CoverUploadError("That file is empty.");
  }

  const fileName = `${randomUUID()}.${EXT[declaredType]}`;
  const bytes = Buffer.from(await upload.arrayBuffer());
  const actualType = detectImageType(bytes);
  if (!actualType) {
    throw new CoverUploadError("That file is not a valid JPG, PNG, WebP or AVIF image.");
  }
  if (actualType !== MIME_BY_SIGNATURE[declaredType as SupportedImageType]) {
    throw new CoverUploadError("The file type does not match the image contents.");
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (token) {
    try {
      const blob = await put(`${folder}/${fileName}`, bytes, {
        access: "public",
        contentType: actualType,
        token,
        addRandomSuffix: false,
      });
      return blob.url;
    } catch (err) {
      // Log the transport error for the operator; never echo it to the
      // admin, and never include the token in either.
      console.error("[storeCoverImage] blob upload failed:", err);
      throw new CoverUploadError(
        "The image could not be saved to storage. Nothing was changed — please try again."
      );
    }
  }

  if (requiresBlobStorage()) {
    throw new CoverUploadError(
      "Image storage is unavailable in this deployment. Configure Vercel Blob and try again."
    );
  }

  try {
    const dir = path.join(process.cwd(), "public", "uploads", folder);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, fileName), bytes);
    return `/uploads/${folder}/${fileName}`;
  } catch (err) {
    console.error("[storeCoverImage] local write failed:", err);
    throw new CoverUploadError(
      "The image could not be saved to storage. Nothing was changed — please try again."
    );
  }
}

/**
 * Resolve the cover for a create/update from the form's three fields:
 *
 *   coverFile        a newly chosen file (wins over everything)
 *   removeCover      "1" when the admin explicitly cleared the image
 *   currentCover     the value the row already holds
 *
 * Returns the string to store, or null to clear the column. Returning
 * `undefined` would mean "leave untouched", but every path here resolves to
 * an explicit value so the row never silently keeps a cover the admin
 * thought they removed.
 */
export async function resolveCoverImage(
  formData: FormData,
  folder: UploadFolder
): Promise<string | null> {
  const file = formData.get("coverFile");
  const remove = String(formData.get("removeCover") ?? "") === "1";
  const current = String(formData.get("currentCover") ?? "").trim() || null;

  if (file instanceof File && file.size > 0) {
    return storeCoverImage(file, folder);
  }
  if (remove) return null;
  return current;
}
