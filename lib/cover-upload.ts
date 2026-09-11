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
  if (!(COVER_ACCEPTED_TYPES as readonly string[]).includes(upload.type)) {
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

  const fileName = `${randomUUID()}.${EXT[upload.type]}`;
  const bytes = Buffer.from(await upload.arrayBuffer());

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(`${folder}/${fileName}`, bytes, {
        access: "public",
        contentType: upload.type,
        token: process.env.BLOB_READ_WRITE_TOKEN,
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
