"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import type { Product } from "@/lib/products";
import type { ProductActionResult } from "@/app/admin/products/actions";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Add / edit product form.
 *
 * Submits through the server action directly rather than as a `<form action>`
 * so the outcome is known here: a spinner while it runs, the server's own
 * error message on failure, and a confirmed success before the modal closes.
 *
 * Every field, default and validation rule from the original form is kept.
 * Existing values are preserved by pre-filling from `product`, and the image
 * is carried through the hidden `currentImg` field — leaving the file input
 * empty keeps whatever image the product already has.
 */
export default function ProductForm({
  action,
  product,
  submitLabel,
  onCancel,
  onSuccess,
  /** Lets a wrapping modal block dismissal while a save is in flight. */
  onPendingChange,
  /** Where to go after a successful save when there is no modal to close. */
  redirectOnSuccess,
}: {
  action: (formData: FormData) => Promise<ProductActionResult>;
  product?: Product;
  submitLabel: string;
  onCancel?: () => void;
  onSuccess?: () => void;
  onPendingChange?: (pending: boolean) => void;
  redirectOnSuccess?: string;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const pendingRef = useRef(false);
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    onPendingChange?.(pending || done);
  }, [pending, done, onPendingChange]);

  const currentImg = product?.img ?? product?.images?.[0] ?? "";

  // Image picker state. `picked` is the file chosen in this session (with an
  // object URL for preview); `removed` means the admin cleared the existing
  // image and expects it gone on save.
  const fileRef = useRef<HTMLInputElement>(null);
  const [picked, setPicked] = useState<{
    url: string;
    name: string;
    size: number;
  } | null>(null);
  const [removed, setRemoved] = useState(false);

  // Object URLs must be released or the blob is held for the page's lifetime.
  useEffect(() => {
    return () => {
      if (picked) URL.revokeObjectURL(picked.url);
    };
  }, [picked]);

  const clearPicked = useCallback(() => {
    setPicked((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return null;
    });
    if (fileRef.current) fileRef.current.value = "";
  }, []);

  const onPickFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) {
        clearPicked();
        return;
      }
      // Validate on selection so the admin finds out now, not after saving.
      if (!ACCEPTED.includes(file.type)) {
        setError("Please choose a JPG, PNG, WebP or AVIF image.");
        clearPicked();
        return;
      }
      if (file.size > MAX_BYTES) {
        setError("That image is over 5 MB. Please choose a smaller file.");
        clearPicked();
        return;
      }
      setError(null);
      setRemoved(false);
      setPicked((prev) => {
        if (prev) URL.revokeObjectURL(prev.url);
        return {
          url: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
        };
      });
    },
    [clearPicked]
  );

  const removeImage = useCallback(() => {
    clearPicked();
    setRemoved(true);
    setError(null);
  }, [clearPicked]);

  // What the product will actually have once saved.
  const effectiveImg = picked ? picked.url : removed ? "" : currentImg;
  const showingUpload = Boolean(picked);

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (pendingRef.current) return; // no double submits

      const form = e.currentTarget;
      // Keep the browser's own required/type checks.
      if (!form.reportValidity()) return;

      const formData = new FormData(form);

      // Check the upload before spending a round trip on it. The server
      // enforces the same rule regardless.
      const file = formData.get("image");
      if (file instanceof File && file.size > 0) {
        if (!ACCEPTED.includes(file.type)) {
          setError("Please upload a JPG, PNG, WebP or AVIF image.");
          return;
        }
        if (file.size > MAX_BYTES) {
          setError("That image is over 5 MB. Please upload a smaller file.");
          return;
        }
      }

      pendingRef.current = true;
      setPending(true);
      setError(null);

      try {
        const result = await action(formData);
        if (!mountedRef.current) return;
        if (result?.ok) {
          setDone(true);
          if (redirectOnSuccess) {
            router.push(redirectOnSuccess);
          } else {
            // The action revalidates the cache, but with no navigation the
            // router keeps serving the payload it already has — so the new
            // or edited row would not appear until a manual reload. Ask for
            // the refetch explicitly, then close once it is confirmed.
            router.refresh();
            window.setTimeout(() => {
              if (mountedRef.current) onSuccess?.();
            }, 550);
          }
        } else {
          setError(result?.error ?? "Something went wrong. Please try again.");
        }
      } catch {
        if (mountedRef.current) {
          setError("Could not reach the server. Please try again.");
        }
      } finally {
        pendingRef.current = false;
        if (mountedRef.current) setPending(false);
      }
    },
    [action, onSuccess, redirectOnSuccess, router]
  );

  const busy = pending || done;

  return (
    <form ref={formRef} onSubmit={onSubmit} className="grid gap-4" noValidate={false}>
      {product && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="currentImg" value={currentImg} />
      {removed && !picked && <input type="hidden" name="removeImage" value="1" />}

      <fieldset disabled={busy} className="grid gap-4 border-0 p-0 m-0 disabled:opacity-60">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="field">
            <label htmlFor="pf-name">Name</label>
            <input
              id="pf-name"
              name="name"
              required
              defaultValue={product?.name}
              placeholder="Official Lions T-Shirt"
            />
          </div>
          <div className="field">
            <label htmlFor="pf-cat">Category</label>
            <input
              id="pf-cat"
              name="cat"
              required
              defaultValue={product?.cat}
              placeholder="Apparel"
            />
          </div>
          <div className="field">
            <label htmlFor="pf-price">Price (₹)</label>
            <input
              id="pf-price"
              name="price"
              type="number"
              min="0"
              step="1"
              required
              defaultValue={product?.price}
            />
          </div>
          <div className="field">
            <label htmlFor="pf-glyph">Glyph (3 letters)</label>
            <input
              id="pf-glyph"
              name="glyph"
              maxLength={3}
              defaultValue={product?.glyph}
              placeholder="TEE"
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="pf-image">Product image (optional)</label>

          {effectiveImg ? (
            <span className="mb-3 flex items-start gap-3 rounded-[12px] border border-black/10 bg-white p-3">
              <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[10px] border border-black/[0.07] bg-cream-100">
                {showingUpload ? (
                  // A blob: URL cannot be optimized, so this one is a plain img.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={effectiveImg}
                    alt="Selected image preview"
                    className="absolute inset-0 h-full w-full object-contain"
                  />
                ) : (
                  <Image
                    src={effectiveImg}
                    alt="Current product image"
                    fill
                    sizes="64px"
                    className="object-contain"
                  />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-manrope text-[11px] font-bold uppercase tracking-[0.12em] text-crimson-600">
                  {showingUpload ? "New image · not saved yet" : "Current image"}
                </span>
                <span className="mt-1 block truncate font-manrope text-[12.5px] text-muted">
                  {showingUpload
                    ? `${picked!.name} · ${(picked!.size / 1024).toFixed(0)} KB`
                    : effectiveImg}
                </span>
                <span className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="btn-ghost min-h-[36px] text-[12px] py-1 px-2.5"
                  >
                    {showingUpload ? "Choose another" : "Replace"}
                  </button>
                  {showingUpload ? (
                    <button
                      type="button"
                      onClick={clearPicked}
                      className="btn-ghost min-h-[36px] text-[12px] py-1 px-2.5"
                    >
                      Discard selection
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="btn-ghost btn-danger min-h-[36px] text-[12px] py-1 px-2.5"
                    >
                      Remove image
                    </button>
                  )}
                </span>
              </span>
            </span>
          ) : (
            <span className="mb-3 block rounded-[12px] border border-dashed border-black/15 bg-white px-3 py-4 font-manrope text-[12.5px] leading-5 text-muted">
              {removed && currentImg
                ? "Image will be removed on save. The team logo will be shown instead."
                : "No image — the team logo will be shown instead."}
              {removed && currentImg && (
                <button
                  type="button"
                  onClick={() => setRemoved(false)}
                  className="btn-ghost min-h-[36px] ml-0 mt-2 block text-[12px] py-1 px-2.5"
                >
                  Undo remove
                </button>
              )}
            </span>
          )}

          <input
            ref={fileRef}
            id="pf-image"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={onPickFile}
          />
          <span className="mt-1 font-manrope text-[12px] text-muted">
            JPG, PNG, WebP or AVIF, up to 5 MB.
          </span>
        </div>

        <div className="field">
          <label htmlFor="pf-range">Order range</label>
          <input
            id="pf-range"
            name="range"
            defaultValue={product?.range}
            placeholder="100 to 500 units"
          />
        </div>

        <div className="field">
          <label htmlFor="pf-desc">Description</label>
          <textarea
            id="pf-desc"
            name="desc"
            defaultValue={product?.desc}
            placeholder="Materials, fit, finish…"
          />
        </div>
      </fieldset>

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-[10px] border border-crimson-600/25 bg-crimson-600/[0.06] px-3 py-2 font-manrope text-[13px] leading-5 text-crimson-600"
        >
          <AlertCircle className="mt-[2px] h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      {done && (
        <p
          role="status"
          className="flex items-center gap-2 rounded-[10px] border border-emerald-600/25 bg-emerald-600/[0.07] px-3 py-2 font-manrope text-[13px] leading-5 text-emerald-700"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {product ? "Changes saved." : "Product added."}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:gap-3">
        <button
          type="submit"
          disabled={busy}
          className="btn-dark press min-h-[44px] justify-center disabled:opacity-70"
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving…
            </>
          ) : (
            submitLabel
          )}
        </button>
        <button
          type="button"
          onClick={() => (onCancel ? onCancel() : router.push("/admin/products"))}
          disabled={pending}
          className="btn-ghost min-h-[44px] justify-center disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
