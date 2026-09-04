"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/(auth)/actions";

/**
 * Shared account sub-nav for Profile and My Orders.
 * Editorial text links — not a SaaS sidebar.
 */
const LINKS = [
  { href: "/profile", label: "Profile", match: (p: string) => p === "/profile" },
  {
    href: "/profile/orders",
    label: "My Orders",
    match: (p: string) => p.startsWith("/profile/orders") || p.startsWith("/orders/"),
  },
] as const;

export default function AccountNav() {
  const pathname = usePathname() || "/profile";

  return (
    <nav className="acct-nav" aria-label="Account">
      <ul className="acct-nav-list">
        {LINKS.map((link) => {
          const active = link.match(pathname);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`acct-nav-link${active ? " is-active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
        <li className="acct-nav-signout">
          <form action={signOut}>
            <button type="submit" className="acct-nav-link acct-nav-signout-btn">
              Sign Out
            </button>
          </form>
        </li>
      </ul>
    </nav>
  );
}
