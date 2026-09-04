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
      <div className="admin-head">
        <div>
          <h1>Messages</h1>
          <p>
            {messages.length === 0
              ? "Submissions from the /contact form will appear here."
              : `${messages.length} enquir${messages.length === 1 ? "y" : "ies"}, newest first.`}
          </p>
        </div>
        {newCount > 0 && (
          <span
            className="tier-badge"
            style={{ background: "rgba(189,34,39,0.10)", color: "var(--hp-red)" }}
          >
            {newCount} NEW
          </span>
        )}
      </div>

      <div className="admin-card overflow-x-auto">
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
                <td colSpan={6} className="admin-empty">
                  <div className="font-sora font-bold text-[16px] text-ink mb-1">
                    No enquiries yet
                  </div>
                  <p>Nothing has come through the contact form.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
