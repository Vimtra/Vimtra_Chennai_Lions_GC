"use client";

import { useState } from "react";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { FIXTURES, type Fixture, type FixtureCat } from "@/data/fixtures";

const TABS: { key: FixtureCat | "all"; label: string }[] = [
  { key: "all", label: "ALL" },
  { key: "upcoming", label: "UPCOMING" },
  { key: "live", label: "LIVE" },
  { key: "past", label: "RESULTS" },
];

function Cta({ cta, live }: { cta: Fixture["cta"]; live?: boolean }) {
  if (cta.variant === "gold") {
    return (
      <Link href={cta.href} className="cta-gold press text-center justify-center">
        {cta.label}
      </Link>
    );
  }
  const styles =
    cta.variant === "white"
      ? { background: "#fff", color: "#C4202A" }
      : { background: "#1A1513", color: "#fff" };
  return (
    <Link
      href={cta.href}
      className="press no-underline text-center font-sora font-bold text-[13px] px-[18px] py-3 rounded-[24px] tracking-[0.04em]"
      style={styles}
    >
      {cta.label}
    </Link>
  );
}

export default function FixturesList() {
  const [active, setActive] = useState<FixtureCat | "all">("all");
  const shown = FIXTURES.filter((f) => active === "all" || f.cat === active);

  return (
    <div className="max-w-[1100px] mx-auto">
      <div className="flex gap-[10px] flex-wrap mb-8">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tab ${active === t.key ? "active" : ""}`}
            onClick={() => setActive(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div>
        {shown.map((f) => (
          <Reveal key={f.id} variant="fade-up" className={`fixture ${f.live ? "live" : ""}`}>
            <div>
              <div className="pill" style={{ background: f.pill.bg, color: f.pill.color }}>
                {f.pill.text}
              </div>
              <div
                className="font-sora font-extrabold text-[30px] tracking-[-0.02em] mt-[10px]"
                style={{ color: f.live ? "#fff" : "#1A1513" }}
              >
                {f.day}
                <span
                  className="text-[18px]"
                  style={{ color: f.live ? "rgba(255,255,255,0.7)" : "#6B635C" }}
                >
                  {f.mon}
                </span>
              </div>
            </div>

            <div>
              <div
                className="font-sora font-bold text-[22px] tracking-[-0.01em]"
                style={{ color: f.live ? "#fff" : "#1A1513" }}
              >
                {f.title}
              </div>
              <div
                className="font-manrope text-[13.5px] mt-1"
                style={{ color: f.live ? "rgba(255,255,255,0.78)" : "#6B635C" }}
              >
                {f.sub}
              </div>
            </div>

            <div
              className="font-manrope text-[13.5px]"
              style={{
                color: f.live ? "rgba(255,255,255,0.85)" : f.noteBold ? "#1A1513" : "#6B635C",
                fontWeight: f.noteBold ? 700 : 400,
              }}
            >
              {f.note}
            </div>

            <Cta cta={f.cta} live={f.live} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
