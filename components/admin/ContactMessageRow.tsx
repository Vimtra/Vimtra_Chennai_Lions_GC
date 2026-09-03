"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { ContactMessage, ContactStatus } from "@prisma/client";
import { formatContactDate } from "@/lib/contact-messages-format";
import ConfirmDeleteButton from "@/components/admin/ConfirmDeleteButton";
import {
  setContactMessageStatusAction,
  deleteContactMessageAction,
} from "@/app/admin/messages/actions";

/**
 * One row of /admin/messages, plus its expand-to-read detail row.
 *
 * A real second `<tr>`, not a `<details>` wrapping one — a `<details>`
 * cannot legally contain table rows; browsers foster-parent it right out
 * of the table and the layout breaks. Local `open` state is the smallest
 * correct way to toggle a table row, and it is the same shape of client
 * leaf the rest of this admin area already uses for a delete dialog.
 *
 * Status is a full state machine, not a read/unread flag — the same
 * choice lib/orders.ts makes for order status: three explicit states
 * (NEW/READ/RESOLVED) an admin can move between in either direction,
 * shown here as the specific next steps that make sense from wherever
 * the enquiry currently sits, rather than one generic toggle.
 */

const STATUS_STYLE: Record<ContactStatus, React.CSSProperties> = {
  NEW: { background: "rgba(196,32,42,0.10)", color: "#C4202A" },
  READ: { background: "rgba(184,144,75,0.16)", color: "#8A6A2E" },
  RESOLVED: { background: "rgba(14,138,79,0.10)", color: "#0E8A4F" },
};

const NEXT_ACTIONS: Record<ContactStatus, { to: ContactStatus; label: string }[]> = {
  NEW: [
    { to: "READ", label: "Mark as read" },
    { to: "RESOLVED", label: "Mark as resolved" },
  ],
  READ: [
    { to: "RESOLVED", label: "Mark as resolved" },
    { to: "NEW", label: "Reopen as new" },
  ],
  RESOLVED: [{ to: "NEW", label: "Reopen as new" }],
};

export default function ContactMessageRow({ message }: { message: ContactMessage }) {
  const [open, setOpen] = useState(false);
  const isNew = message.status === "NEW";

  return (
    <>
      <tr style={isNew ? { background: "rgba(196,32,42,0.03)" } : undefined}>
        <td>
          <span className="tier-badge" style={STATUS_STYLE[message.status]}>
            {message.status}
          </span>
        </td>
        <td>
          <div className="font-sora font-bold text-[14px] text-ink leading-[1.3]">
            {message.name}
          </div>
          <div className="font-manrope text-[12px] text-muted mt-1 break-all">
            {message.email}
          </div>
        </td>
        <td className="font-manrope text-[12.5px] text-muted">
          <div>{message.phone || "—"}</div>
          <div className="mt-1">{message.city || "—"}</div>
        </td>
        <td>
          <span
            className="tier-badge"
            style={{ background: "rgba(26,21,19,0.08)", color: "#1A1513" }}
          >
            {message.category}
          </span>
        </td>
        <td className="font-manrope text-[12.5px] text-muted whitespace-nowrap">
          {formatContactDate(message.createdAt)}
        </td>
        <td>
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="btn-ghost"
              aria-expanded={open}
            >
              <ChevronDown
                className={`w-[13px] h-[13px] transition-transform ${open ? "rotate-180" : ""}`}
                aria-hidden
              />
              {open ? "Hide" : "View"}
            </button>
          </div>
        </td>
      </tr>

      {open && (
        <tr>
          <td colSpan={6} className="!p-0">
            <div className="bg-white border border-black/[0.07] rounded-[14px] p-5 my-3">
              <p className="font-manrope text-[14.5px] leading-[1.7] text-ink whitespace-pre-wrap">
                {message.message}
              </p>

              <div className="mt-5 flex items-center gap-2 flex-wrap justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  {NEXT_ACTIONS[message.status].map((next) => (
                    <form action={setContactMessageStatusAction} key={next.to}>
                      <input type="hidden" name="id" value={message.id} />
                      <input type="hidden" name="status" value={next.to} />
                      <button type="submit" className="btn-ghost">
                        {next.label}
                      </button>
                    </form>
                  ))}
                </div>
                <ConfirmDeleteButton
                  action={deleteContactMessageAction}
                  id={message.id}
                  label={message.name}
                  meta={message.email}
                  description="This permanently deletes the enquiry. It cannot be undone."
                />
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
