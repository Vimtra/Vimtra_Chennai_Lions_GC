import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";
import ContactMessageRow from "@/components/admin/ContactMessageRow";
import { listContactMessages } from "@/lib/contact-messages";

export const metadata: Metadata = {
  title: "Messages · Lions Admin",
  robots: { index: false, follow: false },
};

export default async function AdminMessagesPage() {
  const user = await requireAdmin();
  const messages = await listContactMessages();
  const newCount = messages.filter((m) => m.status === "NEW").length;

  return (
    <AdminShell email={user.email} active="messages">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-sora font-extrabold text-[34px] tracking-[-0.02em] text-ink">
            Messages
          </h1>
          <p className="font-manrope text-[14px] text-muted mt-1">
            {messages.length === 0
              ? "Submissions from the /contact form will appear here."
              : `${messages.length} enquir${messages.length === 1 ? "y" : "ies"}, newest first.`}
          </p>
        </div>
        {newCount > 0 && (
          <span
            className="tier-badge"
            style={{ background: "rgba(196,32,42,0.10)", color: "#C4202A" }}
          >
            {newCount} NEW
          </span>
        )}
      </div>

      <div className="mt-7 border border-black/[0.07] rounded-[4px] p-4 overflow-x-auto" style={{ background: "var(--hp-ivory-2)" }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Enquiry</th>
              <th>Phone / City</th>
              <th>Category</th>
              <th>Submitted</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((m) => (
              <ContactMessageRow key={m.id} message={m} />
            ))}
            {messages.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-14">
                  <div className="font-sora font-bold text-[16px] text-ink mb-1">
                    No enquiries yet
                  </div>
                  <div className="font-manrope text-[13.5px] text-muted">
                    Nothing has come through the contact form.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
