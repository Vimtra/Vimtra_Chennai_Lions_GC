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
      // Message is built from product names we control (no user input).
      dangerouslySetInnerHTML={{ __html: message ?? "" }}
    />
  );
}
