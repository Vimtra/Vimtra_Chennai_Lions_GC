/**
 * Vimtra Chennai Lions GC — Season 2026 roster.
 *
 * Every fact in this file is sourced from the official Chennai Lions IGPL
 * brochure (Season 2026, "The Roster" and per-player pages). No external or
 * anecdotal facts are included. If a claim is not in the brochure it does
 * not appear here.
 *
 * Sources per player are listed in the leading comment of each entry.
 */

export interface RosterPlayer {
  init: string;
  anchor: string;
  image: string;
  badgeName: string;
  badgeSub: string;
  fullName: string;
  blurb: string;
}

export const ROSTER: RosterPlayer[] = [
  // Brochure p. 06 & p. 07 — Marquee.
  {
    init: "GB",
    anchor: "bhullar",
    image: "/players/gaganjeet-bhullar.jpg",
    badgeName: "Gaganjeet Bhullar",
    badgeSub: "Marquee · #01",
    fullName: "Gaganjeet Bhullar",
    blurb: "25 pro wins · 11 Asian Tour titles · Paris 2024 Olympics",
  },
  // Brochure p. 06 & p. 08.
  {
    init: "HS",
    anchor: "sethie",
    image: "/players/harshjeet-singh-sethie.jpg",
    badgeName: "Harshjeet Singh Sethie",
    badgeSub: "Pro · Delhi GC",
    fullName: "Harshjeet Singh Sethie",
    blurb: "6'7\" · Coimbatore Open 2023 winner · PGTI 11th post-win",
  },
  // Brochure p. 06 & p. 09.
  {
    init: "SD",
    anchor: "dwivedi",
    image: "/players/samarth-dwivedi.jpg",
    badgeName: "Samarth Dwivedi",
    badgeSub: "Pro · PGTI / IGPL",
    fullName: "Samarth Dwivedi",
    blurb: "OWGR-ranked · T4 at 7-under, 2025 IGPL",
  },
  // Brochure p. 06 & p. 10.
  {
    init: "YC",
    anchor: "yashas",
    image: "/players/yashas-chandra.jpg",
    badgeName: "Yashas Chandra M S",
    badgeSub: "Pro · Active IGPL",
    fullName: "Yashas Chandra M S",
    blurb: "75-68 at IGPL Bharath Classic · In contention at IGPL Chandigarh",
  },
];

export interface Stat {
  v: string;
  l: string;
}
export interface SideCard {
  label: string;
  title: string;
  sub: string;
}
export interface PlayerFeature {
  anchor: string;
  init: string;
  image: string;
  badgeName: string;
  badgeSub: string;
  eyebrow: string;
  name: string;
  meta?: string;
  paragraphs: string[]; // trusted HTML (may contain <strong>)
  stats?: Stat[];
  sideCards?: SideCard[];
  reverse?: boolean; // portrait on the right
  bg: string;
  topBorder?: boolean;
}

export const FEATURES: PlayerFeature[] = [
  {
    anchor: "bhullar",
    init: "GB",
    image: "/players/gaganjeet-bhullar.jpg",
    badgeName: "Gaganjeet Bhullar",
    badgeSub: "Marquee · Asian Tour",
    eyebrow: "Marquee Player · #01",
    name: "Gaganjeet Bhullar",
    // Brochure p. 07 — Amritsar, born 27 April 1988, 6'1".
    meta: "Born 27 April 1988 · Amritsar · 6 ft 1 in",
    paragraphs: [
      // All facts below are from the brochure p. 07.
      "Bhullar turned professional in 2006. His ledger runs to <strong>25 career professional wins</strong>, including <strong>eleven Asian Tour titles</strong> — one of the most successful Indian records in the tour's modern era.",
      "His career-high <strong>Official World Golf Ranking of 85</strong> came in March 2013, and he was honoured with the <strong>Arjuna Award</strong> the same year. His DP World Tour victory arrived at the <strong>2018 Fiji International</strong>.",
      "He represented India at the <strong>Paris 2024 Olympic Games</strong> — the marquee arrival the Lions were built to be led by.",
    ],
    stats: [
      { v: "25", l: "Pro Wins" },
      { v: "11", l: "Asian Tour Titles" },
      { v: "85", l: "Career-High OWGR" },
      { v: "'13", l: "Arjuna Award" },
    ],
    sideCards: [
      { label: "Signature Win", title: "2018 Fiji International", sub: "DP World Tour victory." },
      { label: "Olympian", title: "Paris 2024", sub: "Representing India at the Olympic Games." },
    ],
    bg: "#FBF9F4",
    topBorder: true,
  },
  {
    anchor: "sethie",
    init: "HS",
    image: "/players/harshjeet-singh-sethie.jpg",
    badgeName: "Harshjeet Singh Sethie",
    badgeSub: "Pro · Delhi GC",
    eyebrow: "Pro · #02",
    name: "Harshjeet Singh Sethie",
    // Brochure p. 08 — Delhi Golf Club, 6'7", 2023 Coimbatore Open winner.
    meta: "Delhi Golf Club · 6 ft 7 in",
    paragraphs: [
      // All facts below are from the brochure p. 08.
      "A Delhi Golf Club product with one of the most distinctive silhouettes on the domestic tour. At <strong>six feet seven inches</strong>, the gallery learns to find him on the practice tee before he ever reaches the first box.",
      "His 2023 season delivered the breakthrough — a <strong>playoff victory at the Coimbatore Open against Om Prakash Chouhan</strong>, worth <strong>₹1 crore</strong>. The win lifted him <strong>from 81st to 11th on the PGTI standings</strong> in a single week.",
    ],
    stats: [
      { v: "6'7\"", l: "Height" },
      { v: "'23", l: "Coimbatore Open" },
      { v: "11", l: "PGTI Rank Post-Win" },
      { v: "DGC", l: "Home Club" },
    ],
    sideCards: [
      { label: "Signature Moment", title: "Coimbatore Open, 2023", sub: "Playoff win over Om Prakash Chouhan." },
    ],
    reverse: true,
    bg: "#F4F0E8",
  },
  {
    anchor: "dwivedi",
    init: "SD",
    image: "/players/samarth-dwivedi.jpg",
    badgeName: "Samarth Dwivedi",
    badgeSub: "Pro · PGTI / IGPL",
    eyebrow: "Pro · #03",
    name: "Samarth Dwivedi",
    paragraphs: [
      // All facts below are from the brochure p. 09.
      "A working touring professional in both the <strong>PGTI</strong> and <strong>IGPL</strong> circuits, and one of the small group of Indian players currently carrying an <strong>Official World Golf Ranking</strong>.",
      "His <strong>2025 IGPL campaign</strong> included a <strong>T4 finish at 7-under</strong> — the kind of every-week competitiveness that a franchise leans on across a fifteen-event season.",
    ],
    stats: [
      { v: "PGTI", l: "Active Circuit" },
      { v: "IGPL", l: "Active Circuit" },
      { v: "T4", l: "2025 IGPL Best" },
      { v: "OWGR", l: "Ranked" },
    ],
    bg: "#FBF9F4",
    topBorder: true,
  },
  {
    anchor: "yashas",
    init: "YC",
    image: "/players/yashas-chandra.jpg",
    badgeName: "Yashas Chandra M S",
    badgeSub: "Pro · Active IGPL",
    eyebrow: "Pro · #04",
    name: "Yashas Chandra M S",
    paragraphs: [
      // All facts below are from the brochure p. 10.
      "A regular on the IGPL competition circuit. Recent showings include a <strong>75-68 opening at the IGPL Bharath Classic</strong> and a <strong>contending week at IGPL Chandigarh</strong>.",
      "A player still writing his own story — and one of the reasons the Lions roster is built to grow through the season, not just start on top.",
    ],
    stats: [
      { v: "75-68", l: "IGPL Bharath Classic" },
      { v: "IGPL", l: "Active Circuit" },
    ],
    bg: "#F4F0E8",
  },
];
