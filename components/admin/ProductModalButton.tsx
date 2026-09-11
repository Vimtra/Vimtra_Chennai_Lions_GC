"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pencil, Plus, X } from "lucide-react";
import type { Product } from "@/lib/products";
import type { ProductActionResult } from "@/app/admin/products/actions";
import ProductForm from "@/components/admin/ProductForm";

/**
 * Add / edit product in a modal. Driven from React state so open/closed has
 * one source of truth and the form remounts on every open (Cancel really
 * discards). While a save is in flight the dialog cannot be dismissed.
 */
export default function ProductModalButton({
  product,
  action,
  categories,
  triggerClassName,
}: {
  product?: Product;
  action: (formData: FormData) => Promise<ProductActionResult>;
  categories?: string[];
  triggerClassName?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
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
        className={triggerClassName ?? (editing ? "adm-btn adm-btn-sm" : "adm-btn adm-btn-primary")}
      >
        {editing ? (
          <>
            <Pencil /> Edit
          </>
        ) : (
          <>
            <Plus /> Add product
          </>
        )}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClick={(e) => {
          if (e.target === dialogRef.current) dismiss();
        }}
        className="adm-dialog is-wide"
      >
        <div className="adm-dialog-head">
          <div style={{ minWidth: 0 }}>
            <h2 id={titleId} className="adm-dialog-title">
              {editing ? "Edit product" : "Add product"}
            </h2>
            {editing && (
              <p className="adm-sub adm-truncate">
                {product!.name} · {product!.id}
              </p>
            )}
          </div>
          <button type="button" onClick={dismiss} disabled={pending} className="adm-dialog-close" aria-label="Close">
            <X />
          </button>
        </div>
        <div className="adm-dialog-body">
          {open && (
            <ProductForm
              key={instance}
              action={action}
              product={product}
              categories={categories}
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
