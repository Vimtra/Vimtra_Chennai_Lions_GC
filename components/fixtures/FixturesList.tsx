"use client";

import { useState } from "react";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import type { Fixture } from "@prisma/client";
import {
  formatFixtureDate,
  fixtureDay,
  fixtureMon,
} from "@/lib/fixtures-format";

type Cat = "all" | "upcoming" | "live" | "past";

const TABS: { key: Cat; label: string }[] = [
  { key: "all", label: "ALL" },
  { key: "upcoming", label: "UPCOMING" },
  { key: "live", label: "LIVE" },
  { key: "past", label: "RESULTS" },
];

function pillFor(f: Fixture): { text: string; bg: string; color: string } {
  switch (f.status) {
    case "LIVE":
      return { text: "LIVE", bg: "#E9CB8E", color: "#3A1A06" };
    case "UPCOMING":
      return {
        text: "UPCOMING",
        bg: "rgba(196,32,42,0.10)",
        color: "#C4202A",
      };
    case "CANCELLED":
      return {
        text: "CANCELLED",
        bg: "rgba(107,99,92,0.10)",
        color: "#6B635C",
      };
    default:
      return {
        text: "RESULT",
        bg: "rgba(26,21,19,0.08)",
        color: "#1A1513",
      };
  }
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="mt-4 rounded-[22px] border border-dashed border-black/[0.18] bg-cream-50 p-10 text-center">
      <div className="font-manrope font-bold text-[10.5px] tracking-[0.28em] text-crimson-600 uppercase">
        {label}
      </div>
      <p className="mt-3 font-manrope text-[14px] leading-[1.6] text-muted max-w-[440px] mx-auto">
        No confirmed fixtures in this bucket yet — the calendar will populate
        as the AM Green IGPL announces further Season 2026 events.
      </p>
    </div>
  );
}

export default function FixturesList({ fixtures }: { fixtures: Fixture[] }) {
  const [active, setActive] = useState<Cat>("all");

  const filtered = fixtures.filter((f) => {
    if (active === "all") return true;
    if (active === "live") return f.status === "LIVE";
    if (active === "upcoming") return f.status === "UPCOMING";
    return f.status === "COMPLETED" || f.status === "CANCELLED";
  });

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

      {filtered.length === 0 && <EmptyState label="Nothing on this tab" />}

      <div>
        {filtered.map((f) => {
          const pill = pillFor(f);
          const live = f.status === "LIVE";
          const cta =
            f.status === "LIVE"
              ? { label: "LIVE SCORES →", href: "/scores", variant: "white" as const }
              : f.status === "UPCOMING"
              ? { label: "RSVP", href: "/contact", variant: "gold" as const }
              : { label: "SCORECARD →", href: "/scores", variant: "dark" as const };

          return (
            <Reveal
              key={f.id}
              variant="fade-up"
              className={`fixture ${live ? "live" : ""}`}
            >
              <div>
                <div
                  className="pill"
                  style={{ background: pill.bg, color: pill.color }}
                >
                  {pill.text}
                </div>
                <div
                  className="font-sora font-extrabold text-[30px] tracking-[-0.02em] mt-[10px]"
                  style={{ color: live ? "#fff" : "#1A1513" }}
                >
                  {fixtureDay(f)}
                  <span
                    className="text-[18px]"
                    style={{
                      color: live ? "rgba(255,255,255,0.7)" : "#6B635C",
                    }}
                  >
                    {fixtureMon(f)}
                  </span>
                </div>
              </div>

              <div>
                <div
                  className="font-sora font-bold text-[22px] tracking-[-0.01em]"
                  style={{ color: live ? "#fff" : "#1A1513" }}
                >
                  {f.name}
                </div>
                <div
                  className="font-manrope text-[13.5px] mt-1"
                  style={{
                    color: live ? "rgba(255,255,255,0.78)" : "#6B635C",
                  }}
                >
                  {f.courseName ? `${f.courseName} · ` : ""}
                  {f.city}
                  {f.city !== f.country ? `, ${f.country}` : ""}
                  {" · "}
                  {formatFixtureDate(f)}
                </div>
                {f.leg && (
                  <div
                    className="font-manrope font-bold text-[10.5px] tracking-[0.28em] mt-2 uppercase"
                    style={{
                      color: live ? "#E9CB8E" : "#C4202A",
                    }}
                  >
                    {f.leg}
                  </div>
                )}
              </div>

              <div
                className="font-manrope text-[13.5px]"
                style={{
                  color: live
                    ? "rgba(255,255,255,0.85)"
                    : f.presentedBy
                    ? "#1A1513"
                    : "#6B635C",
                  fontWeight: f.presentedBy ? 700 : 400,
                }}
              >
                {f.presentedBy
                  ? `Presented by ${f.presentedBy}`
                  : f.note || " "}
              </div>

              <Cta cta={cta} />
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

function Cta({
  cta,
}: {
  cta: { label: string; href: string; variant: "white" | "gold" | "dark" };
}) {
  if (cta.variant === "gold") {
    return (
      <Link
        href={cta.href}
        className="cta-gold press text-center justify-center"
      >
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
