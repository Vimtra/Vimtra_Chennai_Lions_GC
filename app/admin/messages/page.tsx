import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";
import type { ContactStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { searchContactMessages } from "@/lib/contact-messages";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/PageHeader";
import SearchForm from "@/components/admin/ui/SearchForm";
import Pagination, { PAGE_SIZE, parsePage } from "@/components/admin/ui/Pagination";
import EmptyState from "@/components/admin/ui/EmptyState";
import ContactMessageRow from "@/components/admin/ContactMessageRow";

export const metadata: Metadata = {
  title: "Messages",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Filter = "ALL" | ContactStatus;
const TABS: { key: Filter; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "NEW", label: "New" },
  { key: "READ", label: "Read" },
  { key: "RESOLVED", label: "Resolved" },
];

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string; open?: string }>;
}) {
  await requireAdmin();
  const { status: raw, q, page: rawPage, open } = await searchParams;
  const filter: Filter = raw === "NEW" || raw === "READ" || raw === "RESOLVED" ? raw : "ALL";
  const page = parsePage(rawPage);
  const [{ rows, total }, counts] = await Promise.all([
    searchContactMessages({ status: filter === "ALL" ? undefined : filter, q, page, pageSize: PAGE_SIZE }),
    prisma.contactMessage.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const countOf = (s: ContactStatus) => counts.find((c) => c.status === s)?._count._all ?? 0;
  const all = counts.reduce((n, c) => n + c._count._all, 0);

  const chipHref = (key: Filter) => {
    const sp = new URLSearchParams();
    if (key !== "ALL") sp.set("status", key);
    if (q) sp.set("q", q);
    const qs = sp.toString();
    return qs ? `/admin/messages?${qs}` : "/admin/messages";
  };

  return (
    <>
      <PageHeader
        eyebrow="Inbox"
        title="Messages"
        lede="Enquiries submitted through the contact form. Read, reply from your own mailbox, then mark resolved. Personal details stay here — nothing is forwarded elsewhere."
      />

      <div className="adm-toolbar">
        <SearchForm
          action="/admin/messages"
          q={q}
          keep={{ status: filter === "ALL" ? undefined : filter }}
          placeholder="Search name, email, phone, city or message"
        />
        <div className="adm-chips">
          {TABS.map((t) => (
            <Link key={t.key} href={chipHref(t.key)} className={`adm-chip ${filter === t.key ? "is-active" : ""}`}>
              {t.label} <span className="adm-chip-n">{t.key === "ALL" ? all : countOf(t.key)}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="adm-panel">
        {rows.length === 0 ? (
          <EmptyState
            icon={<Mail />}
            title={q ? "No enquiries match" : filter === "NEW" ? "Inbox is clear" : filter === "ALL" ? "No enquiries yet" : `No ${filter.toLowerCase()} enquiries`}
            body={q ? "Try a different name, email or keyword." : filter === "ALL" ? "Submissions from the /contact form will appear here." : undefined}
            actions={q || filter !== "ALL" ? <Link href="/admin/messages" className="adm-btn adm-btn-sm">Show all</Link> : undefined}
          />
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table is-responsive">
              <thead>
                <tr>
                  <th>Enquiry</th>
                  <th>Status</th>
                  <th>Topic</th>
                  <th>Phone / City</th>
                  <th>Received</th>
                  <th className="adm-td-actions">
                    <span className="adm-sr">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((m) => (
                  <ContactMessageRow key={m.id} message={m} initiallyOpen={open === m.id} />
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination action="/admin/messages" page={page} total={total} params={{ status: filter === "ALL" ? undefined : filter, q }} />
      </div>
    </>
  );
}
