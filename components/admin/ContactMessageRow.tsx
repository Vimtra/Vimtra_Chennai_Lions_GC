"use client";

import { useState } from "react";
import { ChevronDown, Mail, Phone } from "lucide-react";
import type { ContactMessage, ContactStatus } from "@prisma/client";
import { formatContactDate } from "@/lib/contact-messages-format";
import ConfirmDeleteButton from "@/components/admin/ConfirmDeleteButton";
import QuickActionButton from "@/components/admin/ui/QuickActionButton";
import { ContactPill, StatusPill } from "@/components/admin/ui/StatusPill";
import { setContactMessageStatusAction, deleteContactMessageAction } from "@/app/admin/messages/actions";

/**
 * One row of /admin/messages plus its expand-to-read detail row (a real
 * second <tr> — a <details> cannot legally contain table rows).
 *
 * Status is a small state machine (NEW → READ → RESOLVED, reversible), so
 * the actions offered are the specific next steps from wherever the
 * enquiry sits. Opening a NEW enquiry does not silently mark it read — the
 * admin decides.
 */
const NEXT_ACTIONS: Record<ContactStatus, { to: ContactStatus; label: string; primary?: boolean }[]> = {
  NEW: [
    { to: "READ", label: "Mark as read", primary: true },
    { to: "RESOLVED", label: "Resolve" },
  ],
  READ: [
    { to: "RESOLVED", label: "Resolve", primary: true },
    { to: "NEW", label: "Mark unread" },
  ],
  RESOLVED: [{ to: "NEW", label: "Reopen" }],
};

export default function ContactMessageRow({
  message,
  initiallyOpen = false,
}: {
  message: ContactMessage;
  initiallyOpen?: boolean;
}) {
  const [open, setOpen] = useState(initiallyOpen);
  const isNew = message.status === "NEW";
  const preview = message.message.length > 110 ? message.message.slice(0, 110).trimEnd() + "…" : message.message;

  return (
    <>
      <tr className={isNew ? "is-highlight" : undefined}>
        <td className="adm-td-primary">
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="adm-cell-title">{message.name}</div>
              <div className="adm-cell-sub">{message.email}</div>
              {!open && <div className="adm-cell-sub" style={{ marginTop: 6, color: "var(--adm-text-3)" }}>{preview}</div>}
            </div>
          </div>
        </td>
        <td data-label="Status">
          <ContactPill status={message.status} />
        </td>
        <td data-label="Topic">
          <StatusPill tone="neutral" dotless>
            {message.category}
          </StatusPill>
        </td>
        <td data-label="Phone / City" className="adm-td-muted">
          <div>{message.phone || "—"}</div>
          <div>{message.city || "—"}</div>
        </td>
        <td data-label="Received" className="adm-td-muted adm-td-nowrap">
          {formatContactDate(message.createdAt)}
        </td>
        <td className="adm-td-actions">
          <div className="adm-actions">
            <button type="button" onClick={() => setOpen((v) => !v)} className="adm-btn adm-btn-sm" aria-expanded={open}>
              <ChevronDown style={{ transform: open ? "rotate(180deg)" : undefined, transition: "transform 140ms" }} aria-hidden />
              {open ? "Hide" : "Read"}
            </button>
          </div>
        </td>
      </tr>

      {open && (
        <tr className="adm-row-detail">
          <td colSpan={6} style={{ padding: 0, background: "var(--adm-panel-2)" }}>
            <div style={{ padding: "16px clamp(14px, 2vw, 20px) 18px", borderTop: "1px solid var(--adm-hair)", borderBottom: "1px solid var(--adm-hair)" }}>
              <p className="adm-prose">{message.message}</p>
              <div className="adm-inline" style={{ marginTop: 14, gap: 12 }}>
                <a href={`mailto:${message.email}`} className="adm-btn adm-btn-sm">
                  <Mail /> Reply by email
                </a>
                {message.phone && (
                  <a href={`tel:${message.phone}`} className="adm-btn adm-btn-sm">
                    <Phone /> Call
                  </a>
                )}
                <span className="adm-spacer" style={{ flex: 1 }} />
                {NEXT_ACTIONS[message.status].map((next) => (
                  <QuickActionButton
                    key={next.to}
                    action={setContactMessageStatusAction}
                    fields={{ id: message.id, status: next.to }}
                    className={`adm-btn adm-btn-sm ${next.primary ? "adm-btn-primary" : ""}`}
                  >
                    {next.label}
                  </QuickActionButton>
                ))}
                <ConfirmDeleteButton
                  action={deleteContactMessageAction}
                  id={message.id}
                  label={message.name}
                  meta={message.email}
                  description="Permanently deletes this enquiry and the personal details it contains. It cannot be recovered."
                  triggerClassName="adm-btn adm-btn-sm adm-btn-ghost adm-tone-danger"
                />
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
