import type { Metadata } from "next";
import Link from "next/link";
import {
  Shirt, Flag, Car, Banknote, Dumbbell, Hotel, Utensils, Plane, Watch, Tv,
  GraduationCap, HeartPulse, Leaf, Camera, Megaphone, Users, HandHeart, Trophy,
  type LucideIcon,
} from "lucide-react";
import Reveal from "@/components/Reveal";
import AeText from "@/components/AeText";

export const metadata: Metadata = {
  title: "Partners · Vimtra Chennai Lions GC",
  description: "Backers of the Pride — principal, gold, silver and support-tier partnership opportunities with the Lions.",
};

interface Slot { icon: LucideIcon; role: string; tag: string }

const GOLD: Slot[] = [
  { icon: Shirt, role: "Apparel & Match Kit", tag: "Slot Available" },
  { icon: Flag, role: "On-Course Activation", tag: "Slot Available" },
  { icon: Car, role: "Mobility Partner", tag: "Slot Available" },
  { icon: Banknote, role: "Banking & Finance", tag: "Slot Available" },
];

const SILVER: Slot[] = [
  { icon: Dumbbell, role: "Performance & S&C", tag: "Slot Available" },
  { icon: Hotel, role: "Hospitality", tag: "Slot Available" },
  { icon: Utensils, role: "Nutrition", tag: "Slot Available" },
  { icon: Plane, role: "Travel & Logistics", tag: "Slot Available" },
  { icon: Watch, role: "Timekeeping", tag: "Slot Available" },
  { icon: Tv, role: "Broadcast Tech", tag: "Slot Available" },
];

const SUPPORT: Slot[] = [
  { icon: GraduationCap, role: "Schools Programme", tag: "Open" },
  { icon: HeartPulse, role: "Sports Medicine", tag: "Open" },
  { icon: Leaf, role: "Sustainability", tag: "Open" },
  { icon: Camera, role: "Imaging Partner", tag: "Open" },
  { icon: Megaphone, role: "Local Media", tag: "Open" },
  { icon: Users, role: "Volunteer Network", tag: "Open" },
  { icon: HandHeart, role: "Community CSR", tag: "Open" },
  { icon: Trophy, role: "Junior Tournaments", tag: "Open" },
];

function SlotCard({ slot, delay, aspect, pad }: { slot: Slot; delay: number; aspect?: string; pad?: number }) {
  const Icon = slot.icon;
  return (
    <Reveal variant="fade-up" delay={delay} className="slot" style={{ aspectRatio: aspect, padding: pad }}>
      <Icon />
      <div className="role">{slot.role}</div>
      <div className="tag">{slot.tag}</div>
    </Reveal>
  );
}

function TierHead({ badge, badgeStyle, label }: { badge: string; badgeStyle: React.CSSProperties; label: string }) {
  return (
    <Reveal variant="fade-up" className="flex items-center gap-[14px] mb-[22px]">
      <span className="tier-badge" style={badgeStyle}>{badge}</span>
      <span className="font-sora font-bold text-[14px] text-muted tracking-[0.04em]">{label}</span>
    </Reveal>
  );
}

export default function PartnersPage() {
  return (
    <>
      <section
        className="relative overflow-hidden px-8 pt-[88px] pb-[70px]"
        style={{ background: "radial-gradient(125% 105% at 50% -5%,#C9242E 0%,#A8181F 58%,#871119 100%)" }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 84% 16%,rgba(233,203,142,0.16),transparent 42%)" }} />
        <div className="relative max-w-[1200px] mx-auto">
          <div className="font-manrope font-bold text-[12px] tracking-[0.32em] text-[#E9CB8E] uppercase">Backers of the Pride</div>
          <AeText
            text="PARTNERS"
            mode="words"
            as="h1"
            className="mt-[14px] font-sora font-extrabold text-white"
            style={{ fontSize: "clamp(56px,9.4vw,142px)", lineHeight: 0.9, letterSpacing: "-0.035em" }}
          />
          <Reveal variant="fade-up" delay={100} as="p" className="max-w-[560px] mt-[22px] font-manrope text-[16px] leading-[1.6] text-white/85">
            A short list of organisations putting their long-horizon money behind the
            Lions. We pick partners the way we pick players — for the next five
            years, not the next photo op.
          </Reveal>
        </div>
      </section>

      {/* Principal */}
      <section className="bg-cream-100 px-8 pt-20 pb-7">
        <div className="max-w-[1100px] mx-auto">
          <TierHead badge="PRINCIPAL" badgeStyle={{ background: "#1A1513", color: "#E9CB8E" }} label="Title Sponsor & Franchise Owner" />
          <Reveal
            variant="fade-up"
            className="bg-white border border-black/[0.07] rounded-[24px] p-12 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-10 items-center"
          >
            <div className="relative overflow-hidden rounded-[20px] aspect-square flex flex-col items-center justify-center text-center p-7" style={{ background: "linear-gradient(160deg,#1A1513,#3a2a1f)" }}>
              <div className="absolute top-0 right-0 w-20 h-20 opacity-95 bg-gradient-to-br from-[#E6C57E] to-[#C39A52] [clip-path:polygon(100%_0,0_0,100%_100%)]" />
              <div className="font-sora font-extrabold text-[64px] leading-none text-[#E9CB8E] tracking-[-0.03em]">VV</div>
              <div className="mt-[14px] font-sora font-extrabold text-[13px] tracking-[0.32em] text-white">VIMTRA</div>
              <div className="font-manrope font-bold text-[9.5px] tracking-[0.44em] text-[#E9CB8E]/85 mt-1">VENTURES</div>
            </div>
            <div>
              <span className="tier-badge" style={{ background: "rgba(196,32,42,0.10)", color: "#C4202A" }}>Title Sponsor</span>
              <h2 className="my-[14px] mb-[10px] font-sora font-extrabold text-[36px] tracking-[-0.02em] leading-[1.1]">Vimtra Ventures</h2>
              <p className="m-0 font-manrope text-[15px] leading-[1.66] text-muted">
                Owner and title sponsor of the Chennai Lions GC. A multi-year
                operational commitment covering roster, infrastructure, and the Pride
                membership platform — running through 2030.
              </p>
              <div className="mt-[18px] flex flex-wrap gap-[10px]">
                {["Multi-year · 2030", "Operational owner", "Pride platform"].map((t) => (
                  <span key={t} className="tier-badge" style={{ background: "rgba(26,21,19,0.06)", color: "#1A1513" }}>{t}</span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Gold */}
      <section className="bg-cream-100 px-8 py-[60px]">
        <div className="max-w-[1100px] mx-auto">
          <TierHead badge="GOLD TIER" badgeStyle={{ background: "linear-gradient(180deg,#E6C57E,#C39A52)", color: "#3A1A06" }} label="On-Course Partners" />
          <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
            {GOLD.map((s, i) => <SlotCard key={s.role} slot={s} delay={i * 60} />)}
          </div>
        </div>
      </section>

      {/* Silver */}
      <section className="bg-cream-50 px-8 py-[60px] border-y border-black/[0.06]">
        <div className="max-w-[1100px] mx-auto">
          <TierHead badge="SILVER TIER" badgeStyle={{ background: "rgba(196,32,42,0.10)", color: "#C4202A" }} label="Performance & Hospitality Partners" />
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(170px,1fr))]">
            {SILVER.map((s, i) => <SlotCard key={s.role} slot={s} delay={i * 60} aspect="2 / 1" />)}
          </div>
        </div>
      </section>

      {/* Support */}
      <section className="bg-cream-100 px-8 pt-[60px] pb-[100px]">
        <div className="max-w-[1100px] mx-auto">
          <TierHead badge="SUPPORT TIER" badgeStyle={{ background: "rgba(26,21,19,0.08)", color: "#1A1513" }} label="Academy & Community Partners" />
          <div className="grid gap-[14px] [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
            {SUPPORT.map((s, i) => <SlotCard key={s.role} slot={s} delay={i * 40} aspect="2 / 1" pad={14} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 py-24 text-white" style={{ background: "linear-gradient(180deg,#1A1513,#241B17)" }}>
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-10 items-center">
          <Reveal variant="fade-up">
            <div className="font-manrope font-bold tracking-[0.32em] text-[12px] text-[#E9CB8E] uppercase">Partner With the Lions</div>
            <h2 className="my-[18px] font-sora font-extrabold leading-none tracking-[-0.025em]" style={{ fontSize: "clamp(36px,5vw,58px)" }}>
              A long-term seat
              <br />
              at a long-term club.
            </h2>
            <p className="font-manrope text-[15px] leading-[1.66] text-white/[0.78]">
              Course-side activations, jersey branding, fan-zone integration,
              juniors-pathway co-branding, and IGPL-event hospitality. We work in
              2–3 year arcs by default.
            </p>
          </Reveal>
          <Reveal variant="fade-up" delay={120} className="text-center">
            <Link href="/contact" className="cta-gold press" style={{ padding: "16px 30px", fontSize: 14 }}>
              REQUEST PARTNERSHIP DECK
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
