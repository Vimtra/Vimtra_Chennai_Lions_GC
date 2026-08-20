"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Send, ShoppingBag, UserRound, Menu, X, LogOut, ShieldCheck, LogIn } from "lucide-react";
import { NAV_ITEMS, PRIMARY_NAV, NAV_CLUSTERS } from "@/lib/nav";
import { useCart, cartCount, useCartHydrated } from "@/store/cart";
import { signOut } from "@/app/(auth)/actions";
import type { SafeUser } from "@/lib/auth";

export default function Nav({ user }: { user: SafeUser | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const items = useCart((s) => s.items);
  const hydrated = useCartHydrated();
  const count = hydrated ? cartCount(items) : 0;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // Close the overlay on route change.
  useEffect(() => setOpen(false), [pathname]);

  // Esc closes the overlay.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const primaryLinks = NAV_ITEMS.filter((n) => PRIMARY_NAV.includes(n.href));

  return (
    <>
      <header className="lions-header">
        <nav className="max-w-[1280px] mx-auto px-5 md:px-8 py-3 flex items-center gap-3 md:gap-5">
          <Link href="/" className="flex items-center gap-3 no-underline group">
            <Image
              src="/assets/logo-lion.png"
              alt="Vimtra Chennai Lions GC"
              width={42}
              height={42}
              className="h-[42px] w-[42px] object-contain bg-white rounded-[10px] p-1 shadow-lg transition-transform duration-500 group-hover:rotate-[-6deg] group-hover:scale-105"
            />
            <span className="flex flex-col leading-tight">
              <span className="font-sora font-extrabold text-[14px] tracking-[0.15em] text-white">
                VIMTRA CHENNAI LIONS
              </span>
              <span className="font-manrope font-semibold text-[9.5px] tracking-[0.46em] text-[#E9CB8E]">
                A&nbsp;FRANCHISE&nbsp;BY&nbsp;VIMTRA&nbsp;VENTURES
              </span>
            </span>
          </Link>

          <div className="flex-1" />

          <div className="hidden lg:flex items-center gap-7">
            {primaryLinks.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`nav-link ${isActive(n.href) ? "is-active" : ""}`}
              >
                {n.label}
              </Link>
            ))}
          </div>

          <Link className="cta-gold hidden md:inline-flex press" href="/contact">
            <Send className="w-[14px] h-[14px]" /> LET&apos;S TALK
          </Link>

          <Link className="icon-btn press" href="/cart" aria-label="Cart">
            <ShoppingBag />
            {count > 0 && <span className="cart-badge">{count}</span>}
          </Link>

          <Link
            className={`icon-btn press ${isActive("/profile") ? "!bg-[#1A1513]" : ""}`}
            href={user ? "/profile" : "/sign-in"}
            aria-label={user ? "Account" : "Sign in"}
            title={user ? user.name : "Sign in"}
          >
            <UserRound />
          </Link>

          <button
            className="icon-btn press"
            aria-label="Menu"
            onClick={() => setOpen(true)}
          >
            <Menu />
          </button>
        </nav>
      </header>

      <div
        className={`lions-overlay ${open ? "is-open" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(false);
        }}
      >
        <div className="w-full max-w-[1200px] mx-auto px-6 py-10 md:py-16 min-h-screen flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-white/[0.08]">
            <Link href="/" className="flex items-center gap-3 no-underline group" onClick={() => setOpen(false)}>
              <Image
                src="/assets/logo-lion.png"
                alt="Vimtra Chennai Lions GC"
                width={40}
                height={40}
                className="h-[40px] w-[40px] object-contain bg-white rounded-[8px] p-1 shadow-lg"
              />
              <span className="flex flex-col leading-tight">
                <span className="font-sora font-extrabold text-[13px] tracking-[0.15em] text-white">
                  VIMTRA CHENNAI LIONS
                </span>
                <span className="font-manrope font-semibold text-[9px] tracking-[0.46em] text-[#E9CB8E]">
                  A FRANCHISE BY VIMTRA VENTURES
                </span>
              </span>
            </Link>

            <button
              className="w-10 h-10 rounded-full border border-white/20 hover:border-[#E6C57E] text-white hover:text-[#E6C57E] flex items-center justify-center transition-all duration-300 cursor-pointer bg-white/5"
              aria-label="Close"
              onClick={() => setOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Grid */}
          <div className="my-auto py-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Column 1: Auth & Profile Panel (4 cols) */}
            <div className="lg:col-span-4 bg-white/[0.02] border border-white/[0.06] rounded-[24px] p-6 md:p-8 flex flex-col gap-6 backdrop-blur-md">
              {user ? (
                <>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-crimson-600 to-gold-500 flex items-center justify-center font-sora font-bold text-white text-xl shadow-inner">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-sora font-bold text-lg text-white">{user.name}</div>
                      <div className="font-manrope text-[12px] text-[#E9CB8E] uppercase tracking-wider font-semibold">{user.role} Member</div>
                    </div>
                  </div>

                  <div className="h-px bg-white/[0.08]" />

                  <div className="flex flex-col gap-3">
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white font-manrope font-semibold text-[14px] no-underline transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      <UserRound className="w-4 h-4 text-[#E6C57E]" />
                      My Profile
                    </Link>
                    {user.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[#E6C57E] to-[#C39A52] text-[#3A1A06] font-manrope font-bold text-[14px] no-underline transition-transform hover:scale-[1.02]"
                        onClick={() => setOpen(false)}
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}
                    <form action={signOut}>
                      <button
                        type="submit"
                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-crimson-600/10 hover:bg-crimson-600 text-white font-manrope font-semibold text-[14px] transition-colors cursor-pointer border border-crimson-600/20"
                      >
                        <LogOut className="w-4 h-4 text-crimson-500 group-hover:text-white" />
                        Sign Out
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-2">
                    <h3 className="font-sora font-extrabold text-[20px] text-white tracking-tight">Join the Pride</h3>
                    <p className="font-manrope text-[13px] text-white/60 leading-relaxed">
                      Access exclusive member benefits, official merchandise pre-orders, and tournament stats.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 mt-2">
                    <Link
                      href="/sign-in"
                      className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-gradient-to-r from-[#E6C57E] to-[#C39A52] text-[#3A1A06] font-manrope font-bold text-[14px] no-underline hover:scale-[1.02] transition-transform"
                      onClick={() => setOpen(false)}
                    >
                      <LogIn className="w-4 h-4" /> Sign In
                    </Link>
                    <Link
                      href="/sign-up"
                      className="flex items-center justify-center p-3.5 rounded-xl border border-white/20 hover:border-white/40 text-white font-manrope font-semibold text-[14px] no-underline transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      Create Account
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Column 2: Links Columns (8 cols) */}
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {NAV_CLUSTERS.map((cluster) => {
                const items = cluster.hrefs
                  .map((h) => NAV_ITEMS.find((n) => n.href === h))
                  .filter((n): n is (typeof NAV_ITEMS)[number] => Boolean(n));
                return (
                  <div key={cluster.key} className="flex flex-col gap-4">
                    <h4 className="font-sora font-extrabold text-[12px] text-[#E9CB8E] uppercase tracking-[0.2em] border-l-2 border-[#E9CB8E] pl-3">
                      {cluster.title}
                    </h4>
                    <div className="flex flex-col gap-1.5">
                      {items.map((n) => {
                        const Icon = n.icon;
                        return (
                          <Link
                            key={n.href}
                            href={n.href}
                            className={`group flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300 no-underline ${
                              isActive(n.href)
                                ? "bg-white/[0.06] border border-white/[0.1] text-[#E9CB8E]"
                                : "border border-transparent text-white/70 hover:text-white hover:bg-white/[0.03]"
                            }`}
                            onClick={() => setOpen(false)}
                          >
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                isActive(n.href)
                                  ? "bg-[#E9CB8E]/10 text-[#E9CB8E]"
                                  : "bg-white/[0.04] text-white/50 group-hover:text-white group-hover:bg-[#E9CB8E]/10"
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="font-manrope font-semibold text-[14px]">
                              {n.label}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-white/[0.08] gap-4">
            <div className="font-manrope text-[11px] text-white/40 tracking-[0.2em] uppercase">
              © 2026 · VIMTRA CHENNAI LIONS GC
            </div>
            <div className="flex gap-6 text-[12px] font-manrope text-white/60">
              <Link href="/privacy" className="hover:text-white transition-colors no-underline" onClick={() => setOpen(false)}>Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors no-underline" onClick={() => setOpen(false)}>Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
