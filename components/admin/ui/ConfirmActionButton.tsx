"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { adminToast } from "@/store/admin-toast";

/**
 * Confirmation gate for any consequential admin action — deletes, order
 * cancellation, refunds, granting admin. A real <dialog>, never
 * window.confirm(): it names the record, explains the consequence, shows
 * progress, and keeps the server's error on screen if the action fails.
 *
 * The action is awaited directly so the outcome is known here. Actions that
 * return nothing are treated as success; `{ ok: false, error }` keeps the
 * dialog open with the message.
 */
export type ConfirmResult = void | { ok: boolean; error?: string; message?: string };

export default function ConfirmActionButton({
  action,
  fields,
  title,
  description,
  confirmLabel,
  tone = "danger",
  successMessage,
  triggerClassName = "adm-btn adm-btn-sm adm-btn-danger",
  triggerTitle,
  disabled,
  redirectTo,
  children,
}: {
  action: (formData: FormData) => ConfirmResult | Promise<ConfirmResult>;
  /** Hidden fields submitted with the action. */
  fields: Record<string, string>;
  title: string;
  description?: React.ReactNode;
  confirmLabel: string;
  tone?: "danger" | "primary";
  /** Toast shown after success. Falls back to the action's own message. */
  successMessage?: string;
  triggerClassName?: string;
  triggerTitle?: string;
  disabled?: boolean;
  /** Navigate here after success (e.g. back to the list after deleting the record being edited). */
  redirectTo?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pendingRef = useRef(false);
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      cancelRef.current?.focus();
    } else if (!open && d.open) {
      d.close();
    }
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

  const dismiss = useCallback(() => {
    if (pendingRef.current) return;
    setError(null);
    setOpen(false);
  }, []);

  const confirm = useCallback(async () => {
    if (pendingRef.current) return;
    pendingRef.current = true;
    setPending(true);
    setError(null);
    try {
      const fd = new FormData();
      for (const [k, v] of Object.entries(fields)) fd.set(k, v);
      const result = await action(fd);
      if (result && typeof result === "object" && result.ok === false) {
        if (mountedRef.current) setError(result.error ?? "That didn't go through. Please try again.");
        return;
      }
      const msg =
        successMessage ??
        (result && typeof result === "object" && result.message ? result.message : "Done.");
      adminToast(msg, "ok");
      if (redirectTo) {
        router.push(redirectTo);
      }
      router.refresh();
      if (mountedRef.current) setOpen(false);
    } catch {
      if (mountedRef.current) setError("Could not reach the server. Please try again.");
    } finally {
      pendingRef.current = false;
      if (mountedRef.current) setPending(false);
    }
  }, [action, fields, router, successMessage, redirectTo]);

  // Stable across server and client render — Math.random() here caused a
  // hydration mismatch on every list page.
  const uid = useId();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={triggerClassName}
        title={triggerTitle}
        disabled={disabled}
      >
        {children}
      </button>

      <dialog
        ref={dialogRef}
        className="adm-dialog"
        role="alertdialog"
        aria-labelledby={`${uid}-t`}
        aria-describedby={`${uid}-d`}
        aria-busy={pending}
        onClick={(e) => {
          if (e.target === dialogRef.current) dismiss();
        }}
      >
        <div className="adm-dialog-head">
          <div style={{ minWidth: 0 }}>
            <h2 id={`${uid}-t`} className="adm-dialog-title">
              {title}
            </h2>
          </div>
          <button type="button" className="adm-dialog-close" onClick={dismiss} disabled={pending} aria-label="Close">
            <X />
          </button>
        </div>
        <div className="adm-dialog-body" id={`${uid}-d`}>
          {typeof description === "string" ? <p>{description}</p> : description}
          {error && (
            <div className="adm-alert" data-tone="danger" role="alert" style={{ marginTop: 14 }}>
              <AlertTriangle />
              <span>{error}</span>
            </div>
          )}
        </div>
        <div className="adm-dialog-foot">
          <button ref={cancelRef} type="button" className="adm-btn" onClick={dismiss} disabled={pending}>
            Keep as is
          </button>
          <button
            type="button"
            className={`adm-btn ${tone === "danger" ? "adm-btn-crimson" : "adm-btn-primary"}`}
            onClick={confirm}
            disabled={pending}
          >
            {pending ? (
              <>
                <Loader2 className="adm-spin" /> Working…
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </dialog>
    </>
  );
}
