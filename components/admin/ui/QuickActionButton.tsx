"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { adminToast } from "@/store/admin-toast";

/**
 * A one-click, non-destructive server action from a list row (publish,
 * mark as read, restore…). Shows a spinner while it runs, disables itself
 * against double submits, and reports the outcome as a toast. Reversible
 * transitions only — anything destructive goes through ConfirmActionButton.
 */
export default function QuickActionButton({
  action,
  fields,
  successMessage,
  className = "adm-btn adm-btn-sm",
  title,
  children,
}: {
  action: (formData: FormData) => void | { ok: boolean; error?: string; message?: string } | Promise<void | { ok: boolean; error?: string; message?: string }>;
  fields: Record<string, string>;
  successMessage?: string;
  className?: string;
  title?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState(false);

  const run = () => {
    if (busy) return;
    setBusy(true);
    start(async () => {
      try {
        const fd = new FormData();
        for (const [k, v] of Object.entries(fields)) fd.set(k, v);
        const result = await action(fd);
        if (result && typeof result === "object" && result.ok === false) {
          adminToast(result.error ?? "That didn't go through.", "danger");
        } else {
          const fromAction = result && typeof result === "object" ? result.message : undefined;
          adminToast(successMessage ?? fromAction ?? "Saved.", "ok");
          router.refresh();
        }
      } catch {
        adminToast("Could not reach the server. Please try again.", "danger");
      } finally {
        setBusy(false);
      }
    });
  };

  const working = pending || busy;
  return (
    <button type="button" className={className} onClick={run} disabled={working} title={title} aria-busy={working}>
      {working ? <Loader2 className="adm-spin" /> : null}
      {children}
    </button>
  );
}
