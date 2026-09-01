import type { Metadata } from "next";
import { ShieldCheck, ShieldOff } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminShell from "@/components/admin/AdminShell";
import ConfirmDeleteButton from "@/components/admin/ConfirmDeleteButton";
import { setRoleAction, deleteUserAction } from "./actions";

export const metadata: Metadata = {
  title: "Users · Lions Admin",
  robots: { index: false, follow: false },
};

export default async function AdminUsersPage() {
  const admin = await requireAdmin();
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <AdminShell email={admin.email} active="users">
      <h1 className="font-sora font-extrabold text-[34px] tracking-[-0.02em] text-ink">Users</h1>
      <p className="font-manrope text-[14px] text-muted mt-1">{users.length} registered accounts</p>

      <div className="mt-7 bg-cream-50 border border-black/[0.07] rounded-[18px] p-4 overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isSelf = u.id === admin.id;
              return (
                <tr key={u.id}>
                  <td className="font-sora font-bold text-ink">
                    {u.name} {isSelf && <span className="font-manrope font-normal text-[11px] text-muted">(you)</span>}
                  </td>
                  <td className="font-manrope text-muted">{u.email}</td>
                  <td>
                    <span
                      className="tier-badge"
                      style={
                        u.role === "ADMIN"
                          ? { background: "#1A1513", color: "#E9CB8E" }
                          : { background: "rgba(26,21,19,0.08)", color: "#1A1513" }
                      }
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="font-manrope text-[12.5px] text-muted">
                    {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td>
                    <div className="flex items-center gap-2 justify-end">
                      {!isSelf && (
                        <>
                          <form action={setRoleAction}>
                            <input type="hidden" name="id" value={u.id} />
                            <input type="hidden" name="role" value={u.role === "ADMIN" ? "USER" : "ADMIN"} />
                            <button type="submit" className="btn-ghost">
                              {u.role === "ADMIN" ? (
                                <><ShieldOff className="w-[13px] h-[13px]" /> Make user</>
                              ) : (
                                <><ShieldCheck className="w-[13px] h-[13px]" /> Make admin</>
                              )}
                            </button>
                          </form>
                          <ConfirmDeleteButton action={deleteUserAction} id={u.id} label={u.name} />
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
    </AdminShell>
  );
}
