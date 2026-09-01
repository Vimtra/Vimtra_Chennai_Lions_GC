"use client";

import { useRef } from "react";
import { Pencil, Plus, X } from "lucide-react";
import type { Product } from "@/lib/products";
import ProductForm from "@/components/admin/ProductForm";

export default function ProductModalButton({ product, action }: { product?: Product; action: (formData: FormData) => void | Promise<void> }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const editing = Boolean(product);
  return <>
    <button type="button" onClick={() => dialog.current?.showModal()} className={editing ? "btn-ghost" : "btn-dark"}>
      {editing ? <><Pencil className="w-[13px] h-[13px]" /> Edit</> : <><Plus className="w-4 h-4" /> Add product</>}
    </button>
    <dialog ref={dialog} className="m-auto max-h-[90vh] w-[min(94vw,760px)] overflow-y-auto rounded-[18px] border border-black/10 bg-cream-50 p-0 text-ink shadow-2xl backdrop:bg-black/50">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/10 bg-cream-50 px-6 py-4"><h2 className="font-sora text-[22px] font-extrabold">{editing ? "Edit product" : "Add product"}</h2><button type="button" onClick={() => dialog.current?.close()} className="text-muted" aria-label="Close"><X className="h-5 w-5" /></button></div>
      <div className="p-6"><ProductForm action={action} product={product} submitLabel={editing ? "Save changes" : "Add product"} onCancel={() => dialog.current?.close()} /></div>
    </dialog>
  </>;
}
