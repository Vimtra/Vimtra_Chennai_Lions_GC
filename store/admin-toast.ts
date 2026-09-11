"use client";

import { create } from "zustand";

/**
 * Admin-console toasts. Separate from store/toast.ts on purpose: the public
 * store renders its message as HTML (it is built from product names we
 * control), whereas admin toasts carry server-returned text that may quote
 * admin input, so they are always rendered as plain text.
 */
export type AdminToastTone = "ok" | "danger" | "info";

export interface AdminToast {
  id: number;
  tone: AdminToastTone;
  message: string;
}

interface AdminToastState {
  toasts: AdminToast[];
  push: (message: string, tone?: AdminToastTone) => void;
  dismiss: (id: number) => void;
}

let seq = 0;

export const useAdminToast = create<AdminToastState>((set, get) => ({
  toasts: [],
  push: (message, tone = "ok") => {
    const id = ++seq;
    set({ toasts: [...get().toasts, { id, tone, message }] });
    setTimeout(() => get().dismiss(id), tone === "danger" ? 6500 : 3800);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));

/** Convenience for non-hook callers (event handlers already inside components). */
export function adminToast(message: string, tone: AdminToastTone = "ok") {
  useAdminToast.getState().push(message, tone);
}
