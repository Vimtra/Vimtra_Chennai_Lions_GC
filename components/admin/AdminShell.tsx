import Link from "next/link";
import Image from "next/image";
import { LogOut } from "lucide-react";
import { logout } from "@/app/admin/actions";

/**
 * Chrome for authenticated admin pages: brand bar, section nav, and logout.
 * (Public Nav/Footer still wrap everything via the root layout.)
 */
export type AdminSection =
  | "dashboard"
  | "products"
  | "inventory"
  | "users"
  | "news"
  | "media"
  | "messages"
  | "fixtures"
  | "scores"
  | "leaderboards";

export default function AdminShell({
  email,
  active,
  children,
}: {
  email: string;
  active: AdminSection;
  children: React.ReactNode;
}) {
  const link = (href: string, key: AdminSection, label: string) => (
    <Link
      href={href}
      className={`admin-nav-link ${active === key ? "is-active" : ""}`}
    >
      {label}
    </Link>
  );

  return (
    <div className="admin-page bg-cream-100 min-h-[70vh]">
      <div className="admin-shell-bar">
        <div className="max-w-[1100px] mx-auto px-6 py-4 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Image src="/assets/logo-lion.png" alt="" width={34} height={34} className="w-[34px] h-[34px] object-contain bg-white rounded-[9px] p-1 shadow" />
            <span className="admin-brand">LIONS ADMIN</span>
          </div>
          <nav className="flex items-center gap-1 ml-2 flex-wrap">
            {link("/admin", "dashboard", "Dashboard")}
            {link("/admin/products", "products", "Products")}
            {link("/admin/inventory", "inventory", "Inventory")}
            {link("/admin/fixtures", "fixtures", "Fixtures")}
            {link("/admin/scores", "scores", "Scores")}
            {link("/admin/leaderboards", "leaderboards", "Standings")}
            {link("/admin/news", "news", "News")}
            {link("/admin/media", "media", "Media")}
            {link("/admin/messages", "messages", "Messages")}
            {link("/admin/users", "users", "Users")}
          </nav>
          <div className="flex-1" />
          <span className="font-manrope text-[12.5px] text-muted hidden sm:block">{email}</span>
          <form action={logout}>
            <button type="submit" className="btn-ghost btn-danger">
              <LogOut className="w-[14px] h-[14px]" /> Sign out
            </button>
          </form>
        </div>
      </div>
      <div className="max-w-[1100px] mx-auto px-6 py-10">{children}</div>
    </div>
  );
}
