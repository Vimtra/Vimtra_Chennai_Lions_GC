"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Boxes,
  CalendarDays,
  Activity,
  Trophy,
  Newspaper,
  Radio,
  FileText,
  Mail,
  Users,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import AdminToaster from "@/components/admin/ui/AdminToaster";
import FlashParams from "@/components/admin/ui/FlashParams";

/**
 * The admin console frame: ink sidebar (off-canvas under 1024px), a slim
 * topbar with breadcrumbs, and the content column. Active section is
 * derived from the pathname so pages never have to declare it.
 *
 * Badge counts arrive from the server layout; they are real counts of rows
 * that need attention, never decorative.
 */
export interface AdminBadges {
  pendingOrders: number;
  newMessages: number;
  outOfStock: number;
  draftNews: number;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  badgeTone?: "crimson" | "gold" | "soft";
  /** Match nested routes too (default true). */
  exact?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

function buildGroups(b: AdminBadges): NavGroup[] {
  return [
    {
      label: "Overview",
      items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }],
    },
    {
      label: "Commerce",
      items: [
        { href: "/admin/orders", label: "Orders", icon: ShoppingBag, badge: b.pendingOrders, badgeTone: "crimson" },
        { href: "/admin/products", label: "Products", icon: Package },
        { href: "/admin/inventory", label: "Inventory", icon: Boxes, badge: b.outOfStock, badgeTone: "gold" },
      ],
    },
    {
      label: "Season",
      items: [
        { href: "/admin/fixtures", label: "Fixtures", icon: CalendarDays },
        { href: "/admin/scores", label: "Scores", icon: Activity },
        { href: "/admin/leaderboards", label: "Standings", icon: Trophy },
      ],
    },
    {
      label: "Content",
      items: [
        { href: "/admin/news", label: "Official News", icon: Newspaper, badge: b.draftNews, badgeTone: "soft" },
        { href: "/admin/media", label: "Media Coverage", icon: Radio },
        { href: "/admin/news/editorial", label: "Editorial Posts", icon: FileText },
      ],
    },
    {
      label: "Inbox",
      items: [{ href: "/admin/messages", label: "Messages", icon: Mail, badge: b.newMessages, badgeTone: "crimson" }],
    },
    {
      label: "Access",
      items: [{ href: "/admin/users", label: "Users", icon: Users }],
    },
  ];
}

/** Segment → readable label for the breadcrumb trail. */
const SEGMENT_LABELS: Record<string, string> = {
  admin: "Admin",
  orders: "Orders",
  products: "Products",
  inventory: "Inventory",
  fixtures: "Fixtures",
  scores: "Scores",
  leaderboards: "Standings",
  news: "Official News",
  editorial: "Editorial Posts",
  media: "Media Coverage",
  messages: "Messages",
  users: "Users",
  edit: "Edit",
  new: "New",
};

function isActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  // /admin/news must not light up for /admin/news/editorial (its own entry).
  if (item.href === "/admin/news" && pathname.startsWith("/admin/news/editorial")) return false;
  return pathname === item.href || pathname.startsWith(item.href + "/");
}

export default function AdminChrome({
  email,
  name,
  badges,
  signOut,
  children,
}: {
  email: string;
  name: string;
  badges: AdminBadges;
  signOut: () => Promise<void>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  // Close the drawer on navigation and on Escape.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const groups = buildGroups(badges);

  // Breadcrumbs: cuid-looking segments are shown as "Detail".
  const segments = pathname.split("/").filter(Boolean);
  const crumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const label = SEGMENT_LABELS[seg] ?? (seg.length > 16 ? "Detail" : seg);
    return { href, label };
  });

  return (
    <div className="adm-root">
      <div className={`adm-scrim ${open ? "is-open" : ""}`} onClick={close} aria-hidden />
      <aside
        id="admin-sidebar"
        className={`adm-sidebar ${open ? "is-open" : ""}`}
        aria-label="Admin navigation"
      >
        <div className="adm-brand">
          <Link href="/admin" className="adm-brand-link" aria-label="Dashboard">
            <span className="adm-brand-mark">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/logo-lion.png" alt="" />
            </span>
            <span>
              <span className="adm-brand-name">LIONS ADMIN</span>
              <span className="adm-brand-sub">Operations console</span>
            </span>
          </Link>
          <button type="button" className="adm-sidebar-close" onClick={close} aria-label="Close navigation">
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        <nav className="adm-nav">
          {groups.map((g) => (
            <div className="adm-nav-group" key={g.label}>
              <div className="adm-nav-label">{g.label}</div>
              {g.items.map((it) => {
                const Icon = it.icon;
                const active = isActive(pathname, it);
                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    className={`adm-nav-link ${active ? "is-active" : ""}`}
                    aria-current={active ? "page" : undefined}
                    data-label={it.label}
                    title={it.label}
                  >
                    <Icon />
                    <span>{it.label}</span>
                    {it.badge ? (
                      <span
                        className={`adm-nav-badge ${
                          it.badgeTone === "gold" ? "is-gold" : it.badgeTone === "soft" ? "is-soft" : ""
                        }`}
                        aria-label={`${it.badge} needing attention`}
                      >
                        {it.badge > 99 ? "99+" : it.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="adm-sidebar-foot">
          <div className="adm-sidebar-user">
            <strong className="adm-truncate">{name}</strong>
            <span>{email}</span>
          </div>
          <Link href="/" className="adm-btn adm-btn-sm adm-btn-ink" target="_blank" rel="noreferrer" title="View live site">
            <ExternalLink /> <span>View live site</span>
          </Link>
          <form action={signOut}>
            <button type="submit" className="adm-btn adm-btn-sm adm-btn-ink adm-btn-block" title="Sign out">
              <LogOut /> <span>Sign out</span>
            </button>
          </form>
        </div>
      </aside>

      <div className="adm-main">
        <header className="adm-topbar">
          <button
            type="button"
            className="adm-topbar-menu"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
            aria-controls="admin-sidebar"
            aria-expanded={open}
          >
            <Menu />
          </button>
          <nav className="adm-crumbs" aria-label="Breadcrumb">
            {crumbs.map((c, i) =>
              i === crumbs.length - 1 ? (
                <strong key={c.href}>{c.label}</strong>
              ) : (
                <span key={c.href} className="adm-inline" style={{ gap: 8 }}>
                  <Link href={c.href}>{c.label}</Link>
                  <ChevronRight />
                </span>
              )
            )}
          </nav>
          <div className="adm-topbar-right">
            <span className="adm-hide-sm" style={{ fontSize: 12, color: "var(--adm-text-3)" }}>
              {email}
            </span>
          </div>
        </header>
        <div className="adm-content">{children}</div>
      </div>
      <AdminToaster />
      <Suspense fallback={null}>
        <FlashParams />
      </Suspense>
    </div>
  );
}
