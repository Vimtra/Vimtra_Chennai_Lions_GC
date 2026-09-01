"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pencil, Plus, X } from "lucide-react";
import type { Product } from "@/lib/products";
import type { ProductActionResult } from "@/app/admin/products/actions";
import ProductForm from "@/components/admin/ProductForm";

/**
 * Add / edit product, in a modal.
 *
 * The dialog is driven from React state rather than by calling showModal()
 * on a ref, so open/closed has one source of truth and the form can be
 * remounted on each open — that is what makes Cancel actually discard: an
 * abandoned draft is gone the next time the modal opens, rather than
 * reappearing half-typed.
 *
 * While a save is in flight the modal cannot be dismissed by Esc, the
 * backdrop or the close button, so a half-written record can't be orphaned
 * by a stray click.
 */
export default function ProductModalButton({
  product,
  action,
}: {
  product?: Product;
  action: (formData: FormData) => Promise<ProductActionResult>;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  // Bumped on every open so <ProductForm> remounts with clean defaults.
  const [instance, setInstance] = useState(0);

  const pendingRef = useRef(false);
  useEffect(() => {
    pendingRef.current = pending;
  }, [pending]);

  const editing = Boolean(product);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    else if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    const onClose = () => setOpen(false);
    const onCancel = (e: Event) => {
      if (pendingRef.current) e.preventDefault();
    };
    d.addEventListener("close", onClose);
    d.addEventListener("cancel", onCancel);
    return () => {
      d.removeEventListener("close", onClose);
      d.removeEventListener("cancel", onCancel);
    };
  }, []);

  const openModal = useCallback(() => {
    setInstance((n) => n + 1);
    setPending(false);
    setOpen(true);
  }, []);

  const dismiss = useCallback(() => {
    if (pendingRef.current) return;
    setOpen(false);
  }, []);

  const titleId = `product-modal-title-${product?.id ?? "new"}`;

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className={editing ? "btn-ghost" : "btn-dark"}
      >
        {editing ? (
          <>
            <Pencil className="w-[13px] h-[13px]" /> Edit
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" /> Add product
          </>
        )}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClick={(e) => {
          if (e.target === dialogRef.current) dismiss();
        }}
        className="m-auto max-h-[92vh] w-[min(94vw,760px)] overflow-y-auto rounded-[18px] border border-black/10 bg-cream-50 p-0 text-ink shadow-2xl backdrop:bg-black/50"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-black/10 bg-cream-50 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2
              id={titleId}
              className="font-sora text-[19px] sm:text-[22px] font-extrabold leading-snug"
            >
              {editing ? "Edit product" : "Add product"}
            </h2>
            {editing && (
              <p className="mt-0.5 truncate font-manrope text-[12.5px] text-muted">
                {product!.name} · {product!.id}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={dismiss}
            disabled={pending}
            className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center text-muted disabled:opacity-40"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {open && (
            <ProductForm
              key={instance}
              action={action}
              product={product}
              submitLabel={editing ? "Save changes" : "Add product"}
              onCancel={dismiss}
              onSuccess={() => setOpen(false)}
              onPendingChange={setPending}
            />
          )}
        </div>
      </dialog>
    </>
  );
}
