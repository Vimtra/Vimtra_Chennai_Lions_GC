"use client";

import { Trash2 } from "lucide-react";
import ConfirmActionButton from "@/components/admin/ui/ConfirmActionButton";

/**
 * Delete with confirmation — a thin preset over ConfirmActionButton that
 * every list in the console uses, so a delete always names the record,
 * states the consequence and reports failure instead of closing quietly.
 */
export type DeleteActionResult = void | { ok: boolean; error?: string; message?: string };

export default function ConfirmDeleteButton({
  action,
  id,
  label,
  meta,
  description,
  triggerClassName = "adm-btn adm-btn-sm adm-btn-danger",
  triggerLabel = "Delete",
  triggerTitle,
  successMessage,
  extraFields,
  redirectTo,
}: {
  action: (formData: FormData) => DeleteActionResult | Promise<DeleteActionResult>;
  id: string;
  /** The record's own name — shown so the admin can see what they are about to remove. */
  label: string;
  /** A second identifier (email, SKU) where the name alone may be ambiguous. */
  meta?: string;
  /** What deletion actually does here. Defaults to a generic permanence warning. */
  description?: React.ReactNode;
  triggerClassName?: string;
  triggerLabel?: string;
  triggerTitle?: string;
  successMessage?: string;
  extraFields?: Record<string, string>;
  redirectTo?: string;
}) {
  return (
    <ConfirmActionButton
      action={action}
      fields={{ id, ...(extraFields ?? {}) }}
      title={`Delete “${label}”?`}
      description={
        <>
          {meta && <p style={{ fontWeight: 600 }}>{meta}</p>}
          <p>{description ?? "This is permanent and cannot be undone."}</p>
        </>
      }
      confirmLabel="Delete"
      tone="danger"
      successMessage={successMessage ?? "Deleted."}
      triggerClassName={triggerClassName}
      triggerTitle={triggerTitle}
      redirectTo={redirectTo}
    >
      <Trash2 /> {triggerLabel}
    </ConfirmActionButton>
  );
}
