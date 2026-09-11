"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ImagePlus, Loader2, Replace, Trash2, Undo2 } from "lucide-react";
import type { Product } from "@/lib/products";
import { webSrc } from "@/lib/image-src";
import type { ProductActionResult } from "@/app/admin/products/actions";
import { adminToast } from "@/store/admin-toast";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Add / edit product form.
 *
 * Calls the server action directly (not `<form action>`) so the outcome is
 * known here: a spinner while it runs, the server's message inline on
 * failure — with every typed value still in place — and a toast on success.
 *
 * Progressive disclosure: the essentials sit first; inventory, visibility
 * and identifiers are a second group so a quick edit stays quick.
 */
export default function ProductForm({
  action,
  product,
  submitLabel,
  onCancel,
  onSuccess,
  onPendingChange,
  redirectOnSuccess,
  categories = [],
}: {
  action: (formData: FormData) => Promise<ProductActionResult>;
  product?: Product;
  submitLabel: string;
  /** Existing category names, offered as suggestions. */
  categories?: string[];
  onCancel?: () => void;
  onSuccess?: () => void;
  /** Lets a wrapping modal block dismissal while a save is in flight. */
  onPendingChange?: (pending: boolean) => void;
  /** Where to go after a successful save when there is no modal to close. */
  redirectOnSuccess?: string;
}) {
  const router = useRouter();
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

  const fileRef = useRef<HTMLInputElement>(null);
  const [picked, setPicked] = useState<{ url: string; name: string; size: number } | null>(null);
  const [removed, setRemoved] = useState(false);
  const [drag, setDrag] = useState(false);

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

  const takeFile = useCallback(
    (file: File | undefined) => {
      if (!file) {
        clearPicked();
        return;
      }
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
        return { url: URL.createObjectURL(file), name: file.name, size: file.size };
      });
    },
    [clearPicked]
  );

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => takeFile(e.target.files?.[0]);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files?.[0];
    if (file && fileRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileRef.current.files = dt.files;
    }
    takeFile(file);
  };

  const removeImage = useCallback(() => {
    clearPicked();
    setRemoved(true);
    setError(null);
  }, [clearPicked]);

  const effectiveImg = picked ? picked.url : removed ? "" : webSrc(currentImg);
  const showingUpload = Boolean(picked);

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (pendingRef.current) return;
      const form = e.currentTarget;
      if (!form.reportValidity()) return;
      const formData = new FormData(form);

      const file = formData.get("image");
      if (file instanceof File && file.size > 0) {
        if (!ACCEPTED.includes(file.type)) return setError("Please upload a JPG, PNG, WebP or AVIF image.");
        if (file.size > MAX_BYTES) return setError("That image is over 5 MB. Please upload a smaller file.");
      }

      pendingRef.current = true;
      setPending(true);
      setError(null);
      try {
        const result = await action(formData);
        if (!mountedRef.current) return;
        if (result?.ok) {
          setDone(true);
          adminToast(result.message ?? (product ? "Changes saved." : "Product added."), "ok");
          if (redirectOnSuccess) {
            router.push(redirectOnSuccess);
            router.refresh();
          } else {
            router.refresh();
            window.setTimeout(() => {
              if (mountedRef.current) onSuccess?.();
            }, 350);
          }
        } else {
          setError(result?.error ?? "Something went wrong. Please try again.");
        }
      } catch {
        if (mountedRef.current) setError("Could not reach the server. Please try again.");
      } finally {
        pendingRef.current = false;
        if (mountedRef.current) setPending(false);
      }
    },
    [action, onSuccess, product, redirectOnSuccess, router]
  );

  const busy = pending || done;

  return (
    <form onSubmit={onSubmit} className="adm-form">
      {product && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="currentImg" value={currentImg} />
      {removed && !picked && <input type="hidden" name="removeImage" value="1" />}
      <input type="hidden" name="activeSubmitted" value="1" />
      {categories.length > 0 && (
        <datalist id="pf-cats">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      )}

      <fieldset disabled={busy} className="adm-fieldset">
        <legend className="adm-fieldset-legend">Listing</legend>
        <div className="adm-row adm-row-2">
          <div className="adm-field">
            <label className="adm-label" htmlFor="pf-name">
              Name
            </label>
            <input id="pf-name" name="name" required maxLength={120} defaultValue={product?.name} placeholder="Official Lions T-Shirt" />
          </div>
          <div className="adm-field">
            <label className="adm-label" htmlFor="pf-cat">
              Category
            </label>
            <input id="pf-cat" name="cat" required maxLength={60} defaultValue={product?.cat} placeholder="Apparel" list="pf-cats" />
          </div>
          <div className="adm-field">
            <label className="adm-label" htmlFor="pf-price">
              Price (₹)
            </label>
            <input id="pf-price" name="price" type="number" min="0" step="1" required defaultValue={product?.price} inputMode="numeric" />
          </div>
          <div className="adm-field">
            <label className="adm-label" htmlFor="pf-glyph">
              Glyph <span className="adm-opt">3 letters, shown when there is no image</span>
            </label>
            <input id="pf-glyph" name="glyph" maxLength={3} defaultValue={product?.glyph} placeholder="TEE" style={{ textTransform: "uppercase" }} />
          </div>
        </div>

        <div className="adm-field">
          <label className="adm-label" htmlFor="pf-desc">
            Description
          </label>
          <textarea id="pf-desc" name="desc" rows={4} defaultValue={product?.desc} placeholder="Materials, fit, finish…" />
        </div>

        <div className="adm-field">
          <label className="adm-label" htmlFor="pf-range">
            Order range <span className="adm-opt">corporate bulk quantities</span>
          </label>
          <input id="pf-range" name="range" defaultValue={product?.range} placeholder="100 to 500 units" />
        </div>
      </fieldset>

      <fieldset disabled={busy} className="adm-fieldset">
        <legend className="adm-fieldset-legend">Image</legend>
        <div className="adm-field">
          {effectiveImg ? (
            <div className="adm-upload-preview">
              <span className="adm-upload-img is-square is-contain">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={effectiveImg} alt={showingUpload ? "Selected image preview" : "Current product image"} />
              </span>
              <div className="adm-upload-meta">
                <div className="adm-kicker">{showingUpload ? "New image · not saved yet" : "Current image"}</div>
                <div className="adm-upload-name">
                  {showingUpload ? `${picked!.name} · ${(picked!.size / 1024).toFixed(0)} KB` : currentImg}
                </div>
                <div className="adm-actions">
                  <button type="button" onClick={() => fileRef.current?.click()} className="adm-btn adm-btn-sm">
                    <Replace /> {showingUpload ? "Choose another" : "Replace"}
                  </button>
                  {showingUpload ? (
                    <button type="button" onClick={clearPicked} className="adm-btn adm-btn-sm adm-btn-ghost">
                      Discard selection
                    </button>
                  ) : (
                    <button type="button" onClick={removeImage} className="adm-btn adm-btn-sm adm-btn-danger">
                      <Trash2 /> Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDrag(true);
                }}
                onDragLeave={() => setDrag(false)}
                onDrop={onDrop}
                className={`adm-upload-zone ${drag ? "is-drag" : ""}`}
              >
                <ImagePlus />
                <strong>Upload product image</strong>
                <span>JPG, PNG, WebP or AVIF · up to 5 MB · drag and drop works too</span>
              </button>
              {removed && currentImg ? (
                <div className="adm-alert" data-tone="warn" style={{ marginTop: 8 }}>
                  <span>The current image will be removed when you save. The team crest is shown instead.</span>
                  <button type="button" className="adm-btn adm-btn-sm" onClick={() => setRemoved(false)} style={{ marginLeft: "auto" }}>
                    <Undo2 /> Undo
                  </button>
                </div>
              ) : (
                <p className="adm-hint" style={{ marginTop: 6 }}>
                  Optional. Without an image the shop shows the team crest on a crimson tile.
                </p>
              )}
            </div>
          )}
          <input
            ref={fileRef}
            id="pf-image"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={onPickFile}
            className="adm-sr"
            tabIndex={-1}
          />
        </div>
      </fieldset>

      <fieldset disabled={busy} className="adm-fieldset">
        <legend className="adm-fieldset-legend">Inventory &amp; visibility</legend>
        <div className="adm-row adm-row-3">
          <div className="adm-field">
            <label className="adm-label" htmlFor="pf-stock">
              Stock on hand
            </label>
            <input id="pf-stock" name="stock" type="number" min="0" step="1" max="1000000" defaultValue={product?.stock ?? 0} inputMode="numeric" />
            <span className="adm-hint">0 means the shop shows it as sold out.</span>
          </div>
          <div className="adm-field">
            <label className="adm-label" htmlFor="pf-sku">
              SKU <span className="adm-opt">optional</span>
            </label>
            <input id="pf-sku" name="sku" maxLength={60} defaultValue={product?.sku ?? ""} placeholder="VCL-TEE-001" />
          </div>
          <div className="adm-field">
            <label className="adm-label" htmlFor="pf-weight">
              Weight (g) <span className="adm-opt">optional</span>
            </label>
            <input id="pf-weight" name="weightGrams" type="number" min="0" step="1" defaultValue={product?.weightGrams ?? ""} inputMode="numeric" />
          </div>
        </div>
        <label className="adm-check">
          <input type="checkbox" name="active" value="1" defaultChecked={product?.active ?? true} />
          <span>
            <strong>Visible on the shop</strong>
            <span>Untick to hide it without deleting — existing orders keep their history.</span>
          </span>
        </label>
      </fieldset>

      {error && (
        <div className="adm-alert" data-tone="danger" role="alert">
          <AlertCircle />
          <span>{error}</span>
        </div>
      )}

      <div className="adm-form-actions">
        <button type="submit" disabled={busy} className="adm-btn adm-btn-primary">
          {pending ? (
            <>
              <Loader2 className="adm-spin" /> Saving…
            </>
          ) : (
            submitLabel
          )}
        </button>
        <button
          type="button"
          onClick={() => (onCancel ? onCancel() : router.push("/admin/products"))}
          disabled={pending}
          className="adm-btn"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
