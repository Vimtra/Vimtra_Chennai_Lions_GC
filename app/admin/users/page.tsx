import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, ShieldOff, Users, LogOut, CheckCircle2, MinusCircle, MailCheck } from "lucide-react";
import type { Prisma, Role } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/PageHeader";
import SearchForm from "@/components/admin/ui/SearchForm";
import Pagination, { PAGE_SIZE, parsePage } from "@/components/admin/ui/Pagination";
import EmptyState from "@/components/admin/ui/EmptyState";
import ConfirmActionButton from "@/components/admin/ui/ConfirmActionButton";
import ConfirmDeleteButton from "@/components/admin/ConfirmDeleteButton";
import QuickActionButton from "@/components/admin/ui/QuickActionButton";
import { RolePill } from "@/components/admin/ui/StatusPill";
import { setRoleAction, deleteUserAction, revokeSessionsAction, sendVerificationLinkAction } from "./actions";

export const metadata: Metadata = {
  title: "Users",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Filter = "ALL" | Role;

function joined(d: Date): string {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; page?: string }>;
}) {
  const admin = await requireAdmin();
  const { q, role: rawRole, page: rawPage } = await searchParams;
  const filter: Filter = rawRole === "ADMIN" || rawRole === "USER" ? rawRole : "ALL";
  const page = parsePage(rawPage);
  const needle = q?.trim();

  const where: Prisma.UserWhereInput = {
    ...(filter !== "ALL" ? { role: filter } : {}),
    ...(needle
      ? {
          OR: [
            { name: { contains: needle, mode: "insensitive" } },
            { email: { contains: needle, mode: "insensitive" } },
            { phone: { contains: needle } },
          ],
        }
      : {}),
  };

  const [users, total, adminCount, allCount] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: [{ role: "asc" }, { createdAt: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        emailVerifiedAt: true,
        phone: true,
        phoneVerifiedAt: true,
        _count: { select: { orders: true, sessions: true } },
      },
    }),
    prisma.user.count({ where }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count(),
  ]);

  const chipHref = (key: Filter) => {
    const sp = new URLSearchParams();
    if (key !== "ALL") sp.set("role", key);
    if (q) sp.set("q", q);
    const qs = sp.toString();
    return qs ? `/admin/users?${qs}` : "/admin/users";
  };

  return (
    <>
      <PageHeader
        eyebrow="Access"
        title="Users"
        lede={
          <>
            {allCount} registered account{allCount === 1 ? "" : "s"} · {adminCount} admin{adminCount === 1 ? "" : "s"}. Admins
            can reach this console; everyone else is a Pride member with a shop account. Verification is informational —
            it does not gate sign-in or checkout.
          </>
        }
      />

      <div className="adm-toolbar">
        <SearchForm action="/admin/users" q={q} keep={{ role: filter === "ALL" ? undefined : filter }} placeholder="Search name, email or phone" />
        <div className="adm-chips">
          {(["ALL", "ADMIN", "USER"] as Filter[]).map((k) => (
            <Link key={k} href={chipHref(k)} className={`adm-chip ${filter === k ? "is-active" : ""}`}>
              {k === "ALL" ? "All" : k === "ADMIN" ? "Admins" : "Members"}
            </Link>
          ))}
        </div>
      </div>

      <div className="adm-panel">
        {users.length === 0 ? (
          <EmptyState icon={<Users />} title="No accounts match" body="Try another name or email." actions={<Link href="/admin/users" className="adm-btn adm-btn-sm">Show all</Link>} />
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table is-responsive">
              <thead>
                <tr>
                  <th>Account</th>
                  <th>Role</th>
                  <th>Verified</th>
                  <th>Orders</th>
                  <th>Joined</th>
                  <th className="adm-td-actions">
                    <span className="adm-sr">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = u.id === admin.id;
                  return (
                    <tr key={u.id}>
                      <td className="adm-td-primary">
                        <div className="adm-cell-title">
                          {u.name}
                          {isSelf && <span className="adm-tone-muted" style={{ fontWeight: 500, fontSize: 12 }}> (you)</span>}
                        </div>
                        <div className="adm-cell-sub">
                          {u.email}
                          {u.phone ? ` · ${u.phone}` : ""}
                        </div>
                      </td>
                      <td data-label="Role">
                        <RolePill role={u.role} />
                      </td>
                      <td data-label="Verified">
                        <div className="adm-inline" style={{ gap: 10, fontSize: 12 }}>
                          <span className={`adm-inline ${u.emailVerifiedAt ? "adm-tone-ok" : "adm-tone-muted"}`} style={{ gap: 4 }} title={u.emailVerifiedAt ? "Email verified" : "Email not verified"}>
                            {u.emailVerifiedAt ? <CheckCircle2 style={{ width: 13, height: 13 }} /> : <MinusCircle style={{ width: 13, height: 13 }} />} Email
                          </span>
                          <span className={`adm-inline ${u.phoneVerifiedAt ? "adm-tone-ok" : "adm-tone-muted"}`} style={{ gap: 4 }} title={u.phoneVerifiedAt ? "Phone verified" : "Phone not verified"}>
                            {u.phoneVerifiedAt ? <CheckCircle2 style={{ width: 13, height: 13 }} /> : <MinusCircle style={{ width: 13, height: 13 }} />} Phone
                          </span>
                        </div>
                      </td>
                      <td data-label="Orders" className="adm-td-num">
                        {u._count.orders > 0 ? (
                          <Link href={`/admin/orders?q=${encodeURIComponent(u.email)}`} className="adm-link">
                            {u._count.orders}
                          </Link>
                        ) : (
                          <span className="adm-tone-muted">0</span>
                        )}
                      </td>
                      <td data-label="Joined" className="adm-td-muted adm-td-nowrap">
                        {joined(u.createdAt)}
                      </td>
                      <td className="adm-td-actions">
                        <div className="adm-actions">
                          {!u.emailVerifiedAt && (
                            <QuickActionButton
                              action={sendVerificationLinkAction}
                              fields={{ id: u.id }}
                              className="adm-btn adm-btn-sm"
                              title="Email this user a verification link (same cooldown and hourly limit as their own resend)"
                            >
                              <MailCheck /> Send verification link
                            </QuickActionButton>
                          )}
                        {!isSelf && (
                          <>
                            {u.role === "ADMIN" ? (
                              <ConfirmActionButton
                                action={setRoleAction}
                                fields={{ id: u.id, role: "USER" }}
                                title={`Remove admin access from ${u.name}?`}
                                description="They keep their account and orders but can no longer open this console. Takes effect on their next request."
                                confirmLabel="Remove admin access"
                                tone="danger"
                                triggerClassName="adm-btn adm-btn-sm"
                              >
                                <ShieldOff /> Revoke admin
                              </ConfirmActionButton>
                            ) : (
                              <ConfirmActionButton
                                action={setRoleAction}
                                fields={{ id: u.id, role: "ADMIN" }}
                                title={`Make ${u.name} an admin?`}
                                description={
                                  <>
                                    <p>
                                      <strong>{u.email}</strong> will be able to manage orders, products, stock, the season, all content,
                                      enquiries and every other account — including yours.
                                    </p>
                                    <p>Only grant this to franchise staff you trust with the live site.</p>
                                  </>
                                }
                                confirmLabel="Grant admin access"
                                tone="primary"
                                triggerClassName="adm-btn adm-btn-sm"
                              >
                                <ShieldCheck /> Make admin
                              </ConfirmActionButton>
                            )}
                            {u._count.sessions > 0 && (
                              <QuickActionButton
                                action={revokeSessionsAction}
                                fields={{ id: u.id }}
                                className="adm-btn adm-btn-sm adm-btn-ghost"
                                title={`Sign out of ${u._count.sessions} active session${u._count.sessions === 1 ? "" : "s"}`}
                              >
                                <LogOut /> Sign out everywhere
                              </QuickActionButton>
                            )}
                            <ConfirmDeleteButton
                              action={deleteUserAction}
                              id={u.id}
                              label={u.name}
                              meta={u.email}
                              description={
                                u._count.orders > 0
                                  ? `This account has ${u._count.orders} order${u._count.orders === 1 ? "" : "s"} and cannot be deleted — order history must be kept. Revoke access or sign them out instead.`
                                  : "Permanently deletes the account, its addresses and its sessions, and signs the user out everywhere. It cannot be undone."
                              }
                              triggerClassName="adm-btn adm-btn-sm adm-btn-ghost adm-tone-danger"
                            />
                          </>
                        )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pagination action="/admin/users" page={page} total={total} params={{ role: filter === "ALL" ? undefined : filter, q }} />
      </div>
    </>
  );
}
