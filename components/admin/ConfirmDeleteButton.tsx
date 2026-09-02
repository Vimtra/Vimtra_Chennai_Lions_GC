"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, X } from "lucide-react";

/**
 * Destructive-action confirmation.
 *
 * A real dialog, never `window.confirm()` — the native prompt cannot carry
 * the record's name, cannot be styled to the admin, and gives no way to show
 * progress or an error.
 *
 * The server action is awaited directly rather than submitted as a form, so
 * the component knows whether the delete actually succeeded. That is what
 * makes the rest possible: a spinner while it runs, a guard against a second
 * submit, the dialog closing itself on success, and the error staying on
 * screen when it fails instead of the row silently surviving.
 *
 * Every delete action this is used with revalidates its own list path, so a
 * successful delete refreshes the table underneath and the row disappears.
 */
/**
 * A delete action may report an outcome. Actions that return nothing are
 * treated as success, so existing callers are unaffected.
 */
export type DeleteActionResult = void | { ok: boolean; error?: string };

export default function ConfirmDeleteButton({
  action,
  id,
  label,
  meta,
  description,
  triggerClassName = "btn-ghost btn-danger",
  triggerLabel = "Delete",
  triggerTitle,
}: {
  action: (
    formData: FormData
  ) => DeleteActionResult | Promise<DeleteActionResult>;
  id: string;
  /** The record's own name — shown so the admin can see what they are about to remove. */
  label: string;
  /** A second identifier (email, SKU) where the name alone may be ambiguous. */
  meta?: string;
  /** What deletion actually does here. Defaults to a generic permanence warning. */
  description?: string;
  triggerClassName?: string;
  triggerLabel?: string;
  triggerTitle?: string;
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Read inside native event listeners, which are registered once and would
  // otherwise close over a stale `pending`.
  const pendingRef = useRef(false);
  // A successful delete revalidates the list, which unmounts this row while
  // the promise is still settling.
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Drive the native dialog from React state so there is a single source of
  // truth for whether it is open.
  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      // Focus the safe choice, not the destructive one.
      cancelRef.current?.focus();
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    const onClose = () => setOpen(false);
    // Esc must not abandon an in-flight delete.
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
    // Double-submit guard. The ref is checked and set synchronously, so a
    // second click landing in the same tick still bounces off it.
    if (pendingRef.current) return;
    pendingRef.current = true;
    setPending(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.set("id", id);
      const result = await action(formData);

      // A refusal (self-delete, missing row) must keep the dialog open and
      // say why, rather than closing as though it had worked.
      if (result && typeof result === "object" && result.ok === false) {
        if (mountedRef.current) {
          setError(result.error ?? "That didn't go through. Please try again.");
        }
        return;
      }

      // The action revalidates the cache, but without a navigation the router
      // keeps serving the payload it already holds — so the deleted row would
      // linger in the table until a manual reload. Ask for the refetch.
      router.refresh();
      if (mountedRef.current) setOpen(false);
    } catch {
      if (mountedRef.current) {
        setError("That didn't go through. Please try again.");
      }
    } finally {
      pendingRef.current = false;
      if (mountedRef.current) setPending(false);
    }
  }, [action, id, router]);

  const titleId = `confirm-delete-title-${id}`;
  const descId = `confirm-delete-desc-${id}`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={triggerClassName}
        title={triggerTitle}
      >
        <Trash2 className="w-[13px] h-[13px]" /> {triggerLabel}
      </button>

      <dialog
        ref={dialogRef}
        role="alertdialog"
        aria-labelledby={titleId}
        aria-describedby={descId}
        aria-busy={pending}
        // Clicking the backdrop lands on the dialog element itself.
        onClick={(e) => {
          if (e.target === dialogRef.current) dismiss();
        }}
        className="m-auto w-[min(94vw,440px)] rounded-[18px] border border-black/10 bg-cream-50 p-0 text-ink shadow-2xl backdrop:bg-black/50"
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p
                id={titleId}
                className="font-sora text-[19px] sm:text-[20px] font-extrabold leading-snug break-words"
              >
                Delete &ldquo;{label}&rdquo;?
              </p>
              {meta && (
                <p className="mt-1 truncate font-manrope text-[13px] text-muted">
                  {meta}
                </p>
              )}
              <p
                id={descId}
                className="mt-2 font-manrope text-[14px] leading-6 text-muted"
              >
                {description ??
                  "This is permanent and cannot be undone."}
              </p>
            </div>
            <button
              type="button"
              onClick={dismiss}
              disabled={pending}
              aria-label="Close"
              className="-mr-2 -mt-2 flex h-11 w-11 shrink-0 items-center justify-center text-muted disabled:opacity-40"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-[10px] border border-crimson-600/25 bg-crimson-600/[0.06] px-3 py-2 font-manrope text-[13px] leading-5 text-crimson-600"
            >
              {error}
            </p>
          )}

          {/* Reversed on mobile so the destructive action is not under the
              thumb's resting position. */}
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <button
              ref={cancelRef}
              type="button"
              onClick={dismiss}
              disabled={pending}
              className="btn-ghost min-h-[44px] justify-center disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirm}
              disabled={pending}
              className="btn-ghost btn-danger min-h-[44px] justify-center disabled:opacity-70"
            >
              {pending ? (
                <>
                  <Loader2 className="w-[13px] h-[13px] animate-spin" />
                  Deleting…
                </>
              ) : (
                <>
                  <Trash2 className="w-[13px] h-[13px]" /> Delete
                </>
              )}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
