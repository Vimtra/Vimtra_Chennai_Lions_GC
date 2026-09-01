"use client";

import { useRef } from "react";
import { Trash2, X } from "lucide-react";

export default function ConfirmDeleteButton({ action, id, label }: { action: (formData: FormData) => void | Promise<void>; id: string; label: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  return <>
    <button type="button" onClick={() => dialog.current?.showModal()} className="btn-ghost btn-danger"><Trash2 className="w-[13px] h-[13px]" /> Delete</button>
    <dialog ref={dialog} className="m-auto w-[min(92vw,430px)] rounded-[18px] border border-black/10 bg-cream-50 p-0 text-ink shadow-2xl backdrop:bg-black/50">
      <form action={action} className="p-6"><input type="hidden" name="id" value={id} />
        <div className="flex items-start justify-between gap-4"><div><p className="font-sora text-[20px] font-extrabold">Delete {label}?</p><p className="mt-2 font-manrope text-[14px] leading-6 text-muted">This action cannot be undone. Please confirm before deleting.</p></div><button type="button" onClick={() => dialog.current?.close()} aria-label="Close" className="text-muted"><X className="h-5 w-5" /></button></div>
        <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => dialog.current?.close()} className="btn-ghost">Cancel</button><button type="submit" className="btn-ghost btn-danger"><Trash2 className="w-[13px] h-[13px]" /> Delete</button></div>
      </form>
    </dialog>
  </>;
}
