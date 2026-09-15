"use client";

import type { ReactNode } from "react";
import { create } from "zustand";

interface ToastState {
  message: ReactNode | null;
  show: (message: ReactNode) => void;
  hide: () => void;
}

let timer: ReturnType<typeof setTimeout> | undefined;

export const useToast = create<ToastState>((set) => ({
  message: null,
  show: (message) => {
    set({ message });
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => set({ message: null }), 2200);
  },
  hide: () => set({ message: null }),
}));
