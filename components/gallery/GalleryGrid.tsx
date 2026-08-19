"use client";

import { useState, type CSSProperties } from "react";

type Cat = "tour" | "practice" | "fan" | "academy";

const FILTERS: { key: Cat | "all"; label: string }[] = [
  { key: "all", label: "ALL" },
  { key: "tour", label: "TOUR" },
  { key: "practice", label: "PRACTICE" },
  { key: "fan", label: "PRIDE" },
  { key: "academy", label: "ACADEMY" },
];

interface Tile {
  init: string;
  cat: Cat;
  tag: string;
  label: string;
  span?: CSSProperties;
}

const TILES: Tile[] = [
  { init: "GB", cat: "tour", tag: "TOUR", label: "Bhullar tee shot · Chennai Open R1", span: { gridRow: "span 2" } },
  { init: "HS", cat: "practice", tag: "PRACTICE", label: "Sethie · range work" },
  { init: "🦁", cat: "fan", tag: "PRIDE", label: "Travelling gallery" },
  { init: "SD", cat: "tour", tag: "TOUR", label: "Dwivedi's drive on 12 · Hyderabad", span: { gridColumn: "span 2" } },
  { init: "A1", cat: "academy", tag: "ACADEMY", label: "Junior clinic · Chennai" },
  { init: "YC", cat: "tour", tag: "TOUR", label: "Yashas · putting line read" },
  { init: "PR", cat: "practice", tag: "PRACTICE", label: "Pre-round walk · Madras Gymkhana", span: { gridRow: "span 2" } },
  { init: "FZ", cat: "fan", tag: "PRIDE", label: "Lions Fan Zone" },
  { init: "T2", cat: "tour", tag: "TOUR", label: "Bhullar T2 trophy lift" },
  { init: "JR", cat: "academy", tag: "ACADEMY", label: "School visit · Coimbatore", span: { gridColumn: "span 2" } },
  { init: "WP", cat: "fan", tag: "PRIDE", label: "Watch party · Anna Nagar" },
  { init: "ST", cat: "practice", tag: "PRACTICE", label: "Short-game session" },
];

export default function GalleryGrid() {
  const [active, setActive] = useState<Cat | "all">("all");

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="flex gap-2 flex-wrap mb-7">
        {FILTERS.map((f) => (
          <button key={f.key} className={`filt ${active === f.key ? "active" : ""}`} onClick={() => setActive(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      <div
        className="grid gap-[14px]"
        style={{ gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gridAutoRows: "220px" }}
      >
        {TILES.map((t) => {
          const show = active === "all" || t.cat === active;
          return (
            <div
              key={t.label}
              className="tile"
              style={{ ...t.span, display: show ? "flex" : "none" }}
            >
              <div className="init">{t.init}</div>
              <span className="tag">{t.tag}</span>
              <span className="label">{t.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
