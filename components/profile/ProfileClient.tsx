"use client";

import Link from "next/link";
import { useState } from "react";
import {
  LayoutDashboard, Ticket, Package, Heart, CalendarCheck, Settings, Bell,
} from "lucide-react";
import AccountSettingsForm from "@/components/profile/AccountSettingsForm";

type Section = "membership" | "settings" | "saved" | "orders" | "rsvps" | "notifications";

const MENU: { target: Section | "all"; label: string; icon: React.ElementType }[] = [
  { target: "settings", label: "Account Settings", icon: Settings },
];

function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "U";
}

export default function ProfileClient({
  user,
}: {
  user: { name: string; email: string; role: string };
  /** Retained so /profile's existing ?saved / ?error links keep type-checking.
   *  Status is now reported inline by the form itself. */
  saved?: boolean;
  error?: string;
}) {
  const [active, setActive] = useState<Section | "all">("settings");
  const visible = (sec: Section) =>
    active === "all" ? sec !== "saved" && sec !== "notifications" : active === sec;

  return (
    <div className="profile-page">
      {/* Header */}
      <section
        className="relative overflow-hidden px-8 pt-[72px] pb-[120px]"
        style={{ background: "radial-gradient(125% 105% at 50% -5%,#C9242E 0%,#A8181F 58%,#871119 100%)" }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 84% 16%,rgba(233,203,142,0.16),transparent 42%)" }} />
        <div className="relative max-w-[1200px] mx-auto flex items-center gap-7 flex-wrap">
          <div
            className="w-[124px] h-[124px] rounded-full text-[#3A1A06] font-sora font-extrabold text-[48px] flex items-center justify-center border-4 border-white/[0.18]"
            style={{ background: "linear-gradient(160deg,#E6C57E,#C39A52)", boxShadow: "0 30px 60px -30px rgba(0,0,0,0.6)" }}
          >
            {initials(user.name)}
          </div>
          <div className="text-white">
            <span className="badge" style={{ background: "rgba(255,255,255,0.14)", color: "#E9CB8E", border: "1px solid rgba(233,203,142,0.4)" }}>
              THE PRIDE · {user.role === "ADMIN" ? "ADMIN" : "GOLD MEMBER"}
            </span>
            <h1 className="mt-[14px] mb-[6px] font-sora font-extrabold leading-none" style={{ fontSize: "clamp(42px,5.4vw,72px)", letterSpacing: "-0.03em" }}>
              {user.name}
            </h1>
            <div className="font-manrope text-[14px] text-white/80">{user.email}</div>
          </div>
          <div className="flex-1" />
          <button onClick={() => setActive("settings")} className="cta-gold press" style={{ padding: "13px 22px" }}>
            EDIT PROFILE
          </button>
        </div>
      </section>

      <section className="bg-cream-100 px-8 pb-24 -mt-[72px] relative z-[2]">
        <div className="max-w-[1200px] mx-auto grid gap-7 items-start profile-grid" style={{ gridTemplateColumns: "280px 1fr" }}>
          <aside className="card sticky top-[90px]" style={{ padding: 20 }}>
            {MENU.map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.target} className={`menu-item ${active === m.target ? "active" : ""}`} onClick={() => setActive(m.target)}>
                  <Icon />
                  <span>{m.label}</span>
                </div>
              );
            })}
          </aside>

          <main className="flex flex-col gap-[22px]">
            {/* Membership (demo) */}
            <div className="card" style={{ display: visible("membership") ? "block" : "none" }}>
              <div className="flex justify-between items-start flex-wrap gap-[18px] mb-[18px]">
                <div>
                  <div className="font-manrope font-bold tracking-[0.18em] text-[11px] text-crimson-600 uppercase">Pride Status</div>
                  <h2 className="mt-2 font-sora font-extrabold text-[26px] tracking-[-0.02em]">Gold Membership</h2>
                  <div className="font-manrope text-[13px] text-muted mt-1">Renews on 28 March 2027</div>
                </div>
                <div className="text-right">
                  <div className="font-sora font-extrabold text-[36px] text-crimson-600 tracking-[-0.025em] leading-none">2,840</div>
                  <div className="font-manrope text-[11.5px] text-muted mt-[6px] tracking-[0.1em] uppercase">Pride Points</div>
                </div>
              </div>
              <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(140px,1fr))]">
                {[["7", "Events Attended"], ["3", "Watch Parties"], ["12", "Shop Orders"], ["10%", "Member Discount"]].map(([n, l]) => (
                  <div key={l} className="bg-white border border-black/[0.06] rounded-[14px] p-4">
                    <div className="font-sora font-extrabold text-[22px] text-ink">{n}</div>
                    <div className="font-manrope text-[11.5px] text-muted mt-[6px] tracking-[0.06em] uppercase">{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Settings (real account) */}
            <div className="card" style={{ display: visible("settings") ? "block" : "none" }}>
              <h2 className="mb-[18px] font-sora font-extrabold text-[22px] tracking-[-0.02em]">Account Settings</h2>

              <AccountSettingsForm user={{ name: user.name, email: user.email }} />
            </div>

            {/* Saved (demo) */}
            <div className="card" style={{ display: visible("saved") ? "block" : "none" }}>
              <h2 className="mb-[18px] font-sora font-extrabold text-[22px] tracking-[-0.02em]">Saved Items</h2>
              <div className="text-center py-10 px-5">
                <Heart className="w-12 h-12 text-crimson-600 mx-auto mb-4 opacity-60" />
                <div className="font-sora font-bold text-[18px] text-ink">No saved items yet</div>
                <p className="font-manrope text-[14px] text-muted my-2 mb-5">Save products from the shop or news articles to read later.</p>
                <Link href="/shop" className="cta-gold">Go to Shop</Link>
              </div>
            </div>

            {/* Orders (demo) */}
            <div className="card" style={{ display: visible("orders") ? "block" : "none" }}>
              <div className="flex justify-between items-center mb-[18px]">
                <h2 className="font-sora font-extrabold text-[22px] tracking-[-0.02em]">Recent Orders</h2>
                <Link href="/cart" className="font-manrope font-bold text-[12px] text-crimson-600 no-underline tracking-[0.06em]">VIEW ALL →</Link>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { id: "VCL-1042", items: "Pro Polo · Match Day, Tour Towel · Lions Crest", total: "₹4,148", status: "Delivered", ok: true },
                  { id: "VCL-1029", items: "Lions Home Jersey 2026 ×2", total: "₹5,998", status: "In Transit", ok: false },
                  { id: "VCL-0998", items: "Stand Bag · Lions Edition", total: "₹18,999", status: "Delivered", ok: true },
                ].map((o) => (
                  <div key={o.id} className="flex justify-between items-center p-[14px] bg-white border border-black/[0.06] rounded-[14px]">
                    <div>
                      <div className="font-sora font-bold text-[15px]">Order #{o.id}</div>
                      <div className="font-manrope text-[12.5px] text-muted mt-1">{o.items}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-sora font-extrabold text-[16px] text-ink">{o.total}</div>
                      <div className="badge mt-1" style={o.ok ? { background: "rgba(14,138,79,0.12)", color: "#0E8A4F" } : { background: "rgba(196,32,42,0.10)", color: "#C4202A" }}>
                        {o.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RSVPs (demo) */}
            <div className="card" style={{ display: visible("rsvps") ? "block" : "none" }}>
              <h2 className="mb-[18px] font-sora font-extrabold text-[22px] tracking-[-0.02em]">Your Fixture RSVPs</h2>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center p-[14px] bg-white border border-black/[0.06] rounded-[14px]">
                  <div>
                    <div className="font-sora font-bold text-[15px]">IGPL Chennai Open</div>
                    <div className="font-manrope text-[12.5px] text-muted mt-1">26 Jun · Madras Gymkhana · Practice Round walk-along</div>
                  </div>
                  <span className="badge" style={{ background: "linear-gradient(180deg,#E6C57E,#C39A52)", color: "#3A1A06" }}>Confirmed</span>
                </div>
                <div className="flex justify-between items-center p-[14px] bg-white border border-black/[0.06] rounded-[14px]">
                  <div>
                    <div className="font-sora font-bold text-[15px]">IGPL Coimbatore Open</div>
                    <div className="font-manrope text-[12.5px] text-muted mt-1">14 Aug · CCGA · 4-day pass</div>
                  </div>
                  <span className="badge" style={{ background: "rgba(196,32,42,0.10)", color: "#C4202A" }}>Waitlist</span>
                </div>
              </div>
            </div>

            {/* Notifications (demo) */}
            <div className="card" style={{ display: visible("notifications") ? "block" : "none" }}>
              <h2 className="mb-[18px] font-sora font-extrabold text-[22px] tracking-[-0.02em]">Notifications</h2>
              <div className="text-center py-10 px-5">
                <Bell className="w-12 h-12 text-crimson-600 mx-auto mb-4 opacity-60" />
                <div className="font-sora font-bold text-[18px] text-ink">You&apos;re all caught up</div>
                <p className="font-manrope text-[14px] text-muted mt-2">We&apos;ll notify you when tickets for the next fixture go live or your orders ship.</p>
              </div>
            </div>
          </main>
        </div>
      </section>
    </div>
  );
}
