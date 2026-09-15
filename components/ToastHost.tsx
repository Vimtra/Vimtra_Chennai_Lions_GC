"use client";

import { useToast } from "@/store/toast";

/** Single global toast outlet, mounted once in the root layout. */
export default function ToastHost() {
  const message = useToast((s) => s.message);
  return (
    <div
      className={`toast ${message ? "show" : ""}`}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
