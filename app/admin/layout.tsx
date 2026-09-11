import type { Metadata } from "next";
import "./admin.css";
import { requireAdmin } from "@/lib/auth";
import { getAdminBadges } from "@/lib/admin-dashboard";
import AdminChrome from "@/components/admin/shell/AdminChrome";
import { logout } from "./actions";

export const metadata: Metadata = {
  title: { default: "Lions Admin", template: "%s · Lions Admin" },
  robots: { index: false, follow: false },
};

// Badge counts must reflect the database on every request.
export const dynamic = "force-dynamic";

/**
 * Admin console frame. The public Nav / Footer / splash are suppressed for
 * every /admin route by <PublicChrome> in the root layout; this layout
 * supplies the console's own sidebar, topbar and toaster.
 *
 * requireAdmin() runs here AND in every page — a layout is not re-rendered
 * on every client navigation, so the per-page check remains the actual
 * gate. This one exists so the frame itself never renders for a
 * non-admin, and so the shell can show who is signed in.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const badges = await getAdminBadges().catch(() => ({
    pendingOrders: 0,
    newMessages: 0,
    outOfStock: 0,
    draftNews: 0,
  }));

  return (
    <AdminChrome email={user.email} name={user.name} badges={badges} signOut={logout}>
      {children}
    </AdminChrome>
  );
}
