"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ShoppingBag,
  UserRound,
  Menu,
  X,
  ChevronDown,
  LogOut,
  ShieldCheck,
  LogIn,
  ArrowUpRight,
} from "lucide-react";
import { useCart, cartCount, useCartHydrated } from "@/store/cart";
import { signOut } from "@/app/(auth)/actions";
import {
  DIRECT_NAV,
  FLOATING_HEADER_ROUTES,
  MEGA_SECTIONS,
  SITE_SECTIONS,
  type SiteSection,
} from "@/lib/nav";
import type { SafeUser } from "@/lib/auth";

/**
 * Global header.
 *
 * Aligned to the same grid as page content (`.hp-wrap`: 1360 max-width,
 * 22/40 gutters) so the logo shares a left edge with every page's eyebrow,
 * heading and footer brand.
 *
 * States: transparent over a dark full-bleed hero (home only), deep ink
 * everywhere else, and deep ink once scrolled past the fold.
 *
 * All auth / cart / routing behaviour is preserved verbatim — only the
 * presentation and information architecture changed. Every destination is
 * an existing route; nothing is invented.
 */

/**
 * Header groups come from `lib/nav.ts` so the header and the footer render
 * the same taxonomy. They used to be defined here, which is how News and
 * Gallery ended up under "Media" in the header and under "The Season" in
 * the footer.
 */
type MegaGroup = SiteSection;

const MEGA = MEGA_SECTIONS;
const DIRECT = DIRECT_NAV;

/** The overlay carries every section, including the one with no figure. */
const MOBILE_GROUPS = SITE_SECTIONS;

/** Routes whose first section is a dark full-bleed hero — shared with
    lib/nav.ts so the header and the heroes cannot drift apart. */
const OVER_HERO = new Set(FLOATING_HEADER_ROUTES);

export default function Nav({ user }: { user: SafeUser | null }) {
  const pathname = usePathname();
  const overHero = OVER_HERO.has(pathname);
  const isAdmin = pathname.startsWith("/admin");

  const [scrolled, setScrolled] = useState(false);
  const [openMega, setOpenMega] = useState<MegaGroup["key"] | null>(null);
  const [overlay, setOverlay] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const items = useCart((s) => s.items);
  const hydrated = useCartHydrated();
  const count = hydrated ? cartCount(items) : 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Body scroll lock while the overlay is open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    if (overlay) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [overlay]);

  // Focus the close button on open; return focus to the trigger on close.
  useEffect(() => {
    if (overlay) {
      const t = window.setTimeout(() => closeRef.current?.focus(), 80);
      return () => window.clearTimeout(t);
    }
    triggerRef.current?.focus();
  }, [overlay]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (overlay) setOverlay(false);
      else if (openMega) setOpenMega(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [overlay, openMega]);

  useEffect(() => {
    setOverlay(false);
    setOpenMega(null);
  }, [pathname]);

  const active = useMemo(
    () => MEGA.find((g) => g.key === openMega) ?? null,
    [openMega]
  );
  const closeMega = useCallback(() => setOpenMega(null), []);

  return (
    <>
      <header
        className={[
          "nv",
          overHero ? "nv-over" : "",
          isAdmin ? "nv-admin" : "",
          scrolled ? "nv-scrolled" : "",
          openMega ? "nv-open" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onMouseLeave={closeMega}
      >
        <div className="nv-bar hp-wrap">
          <Link href="/" className="nv-brand" onClick={closeMega} aria-label="Vimtra Chennai Lions GC — home">
            <Image
              src="/assets/logo-lion.png"
              alt=""
              width={44}
              height={44}
              priority
              className="nv-mark"
            />
            <span className="nv-word">
              <span className="nv-word-1">VIMTRA CHENNAI LIONS GC</span>
            </span>
          </Link>

          <nav className="nv-links" aria-label="Primary">
            {MEGA.map((g) => {
              const on = g.items.some((i) => pathname.startsWith(i.href));
              return (
                <button
                  key={g.key}
                  type="button"
                  className={`nv-link ${openMega === g.key ? "is-open" : ""} ${on ? "is-active" : ""}`}
                  onMouseEnter={() => setOpenMega(g.key)}
                  onFocus={() => setOpenMega(g.key)}
                  onClick={(e) =>
                    // Pointer clicks arrive after hover has already opened the
                    // panel; keyboard activation (detail 0) keeps true toggle.
                    e.detail === 0
                      ? setOpenMega(openMega === g.key ? null : g.key)
                      : setOpenMega(g.key)
                  }
                  aria-expanded={openMega === g.key}
                  aria-haspopup="true"
                >
                  <span className="nv-link-label">{g.label}</span>
                  <ChevronDown className="nv-caret" aria-hidden />
                </button>
              );
            })}
            {DIRECT.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`nv-link ${pathname.startsWith(l.href) ? "is-active" : ""}`}
                onMouseEnter={closeMega}
                onFocus={closeMega}
              >
                <span className="nv-link-label">{l.label}</span>
              </Link>
            ))}
          </nav>

          <div className="nv-actions">
            <Link href="/cart" className="nv-icon" aria-label="Cart" onMouseEnter={closeMega}>
              <ShoppingBag aria-hidden />
              {count > 0 && <span className="nv-badge" aria-hidden>{count}</span>}
              {count > 0 && <span className="nv-sr">{count} items in cart</span>}
            </Link>
            <Link
              href={user ? "/profile" : "/sign-in"}
              className="nv-icon"
              aria-label={user ? `Account · ${user.name}` : "Sign in"}
              onMouseEnter={closeMega}
            >
              <UserRound aria-hidden />
            </Link>
            {user && (
              <form action={signOut} className="nv-desktop-signout">
                <button type="submit" className="nv-icon" aria-label="Sign out" title="Sign out">
                  <LogOut aria-hidden />
                </button>
              </form>
            )}
            <button
              ref={triggerRef}
              type="button"
              className="nv-icon nv-burger"
              aria-label="Open menu"
              aria-expanded={overlay}
              onClick={() => setOverlay(true)}
              onMouseEnter={closeMega}
            >
              <Menu aria-hidden />
            </button>
          </div>
        </div>

        {active && (
          <div
            className="nv-mega"
            role="region"
            aria-label={`${active.label} menu`}
            onMouseEnter={() => setOpenMega(active.key)}
            onMouseLeave={closeMega}
          >
            <div className="nv-mega-in hp-wrap">
              <div className="nv-mega-side">
                <p className="nv-mega-label">{active.label}</p>
                {/* Foot of the label column — the mark's chevron plus a
                    count taken from the data, so the column resolves
                    instead of trailing off into empty panel. */}
                <p className="nv-mega-count">
                  <i className="v-chev v-chev-lg" aria-hidden />
                  {String(active.items.length).padStart(2, "0")} sections
                </p>
              </div>
              <ul className="nv-mega-list">
                {active.items.map((it, i) => (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      className={`nv-mega-item ${pathname === it.href ? "is-active" : ""}`}
                      onClick={closeMega}
                    >
                      <span className="nv-mega-n">{String(i + 1).padStart(2, "0")}</span>
                      <span className="nv-mega-body">
                        <span className="nv-mega-t">{it.label}</span>
                        <span className="nv-mega-d">{it.desc}</span>
                      </span>
                      <ArrowUpRight className="nv-mega-arrow" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={active.items[0].href}
                className="nv-mega-fig"
                onClick={closeMega}
                aria-label={`${active.label} — ${active.caption}`}
              >
                <Image src={active.image} alt="" fill sizes="340px" className="nv-mega-img" />
                <span className="nv-mega-cap">{active.caption}</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Full-screen mobile navigation */}
      <div
        className={`nv-ov ${overlay ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!overlay}
        aria-label="Site navigation"
        onClick={(e) => e.target === e.currentTarget && setOverlay(false)}
      >
        <div className="nv-ov-in">
          <div className="nv-ov-top">
            <Link href="/" className="nv-brand" onClick={() => setOverlay(false)} tabIndex={overlay ? 0 : -1}>
              <Image src="/assets/logo-lion.png" alt="" width={40} height={40} className="nv-mark" />
              <span className="nv-word">
                <span className="nv-word-1">VIMTRA CHENNAI LIONS GC</span>
              </span>
            </Link>
            <button
              ref={closeRef}
              type="button"
              className="nv-ov-close"
              aria-label="Close menu"
              onClick={() => setOverlay(false)}
              tabIndex={overlay ? 0 : -1}
            >
              <X aria-hidden />
            </button>
          </div>

          <nav className="nv-ov-nav" aria-label="Sections">
            {MOBILE_GROUPS.map((g) => (
              <OvGroup key={g.key} g={g} pathname={pathname} onNav={() => setOverlay(false)} open={overlay} />
            ))}
            <Link href="/cart" className="nv-ov-direct" onClick={() => setOverlay(false)} tabIndex={overlay ? 0 : -1}>
              <span>Cart</span>
              <span className="nv-ov-meta">{count > 0 ? `${count} item${count === 1 ? "" : "s"}` : "Empty"}</span>
            </Link>
            {user?.role === "ADMIN" && (
              <Link href="/admin" className="nv-ov-direct is-admin" onClick={() => setOverlay(false)} tabIndex={overlay ? 0 : -1}>
                <span><ShieldCheck className="nv-ov-ic" aria-hidden /> Admin</span>
                <span className="nv-ov-meta">Dashboard</span>
              </Link>
            )}
          </nav>

          <div className="nv-ov-foot">
            {user ? (
              <div className="nv-ov-acct">
                <div className="nv-ov-avatar" aria-hidden>{(user.name.charAt(0) || "L").toUpperCase()}</div>
                <div className="nv-ov-acct-b">
                  <span className="nv-ov-acct-n">{user.name}</span>
                  <span className="nv-ov-acct-r">{user.role} · Member</span>
                </div>
                <form action={signOut}>
                  <button type="submit" className="nv-ov-btn" tabIndex={overlay ? 0 : -1}>
                    <LogOut className="nv-ov-ic" aria-hidden /> Sign out
                  </button>
                </form>
              </div>
            ) : (
              <div className="nv-ov-guest">
                <Link href="/sign-in" className="nv-ov-btn is-primary" onClick={() => setOverlay(false)} tabIndex={overlay ? 0 : -1}>
                  <LogIn className="nv-ov-ic" aria-hidden /> Sign in
                </Link>
                <Link href="/sign-up" className="nv-ov-btn" onClick={() => setOverlay(false)} tabIndex={overlay ? 0 : -1}>
                  Create account
                </Link>
              </div>
            )}
            <div className="nv-ov-legal">
              <Link href="/privacy" onClick={() => setOverlay(false)} tabIndex={overlay ? 0 : -1}>Privacy</Link>
              <Link href="/terms" onClick={() => setOverlay(false)} tabIndex={overlay ? 0 : -1}>Terms</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function OvGroup({
  g,
  pathname,
  onNav,
  open,
}: {
  g: (typeof MOBILE_GROUPS)[number];
  pathname: string;
  onNav: () => void;
  open: boolean;
}) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!open) setOn(false);
  }, [open]);
  return (
    <div className={`nv-ov-grp ${on ? "is-open" : ""}`}>
      <button
        type="button"
        className="nv-ov-grp-btn"
        aria-expanded={on}
        onClick={() => setOn((v) => !v)}
        tabIndex={open ? 0 : -1}
      >
        <span>{g.label}</span>
        <span className="nv-ov-plus" aria-hidden />
      </button>
      <div className="nv-ov-grp-items">
        {g.items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className={`nv-ov-item ${pathname === it.href ? "is-active" : ""}`}
            onClick={onNav}
            tabIndex={open && on ? 0 : -1}
          >
            <span>{it.label}</span>
            <ArrowUpRight className="nv-ov-item-a" aria-hidden />
          </Link>
        ))}
      </div>
    </div>
  );
}
