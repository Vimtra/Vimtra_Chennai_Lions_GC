export interface RosterPlayer {
  init: string;
  anchor: string;
  badgeName: string;
  badgeSub: string;
  fullName: string;
  blurb: string;
}

export const ROSTER: RosterPlayer[] = [
  {
    init: "GB",
    anchor: "bhullar",
    badgeName: "Gaganjeet Bhullar",
    badgeSub: "Marquee · #1",
    fullName: "Gaganjeet Bhullar",
    blurb: "25 pro wins · 11 Asian Tour titles · Arjuna Awardee",
  },
  {
    init: "HS",
    anchor: "sethie",
    badgeName: "Harshjeet Sethie",
    badgeSub: "Rising Star · 6'7\"",
    fullName: "Harshjeet Singh Sethie",
    blurb: "Coimbatore Open 2023 winner · Delhi GC",
  },
  {
    init: "SD",
    anchor: "dwivedi",
    badgeName: "Samarth Dwivedi",
    badgeSub: "PGTI Pro",
    fullName: "Samarth Dwivedi",
    blurb: "OWGR ranked · IGPL 2025 T4 finish",
  },
  {
    init: "YC",
    anchor: "yashas",
    badgeName: "Yashas Chandra",
    badgeSub: "Rising Talent",
    fullName: "Yashas Chandra M S",
    blurb: "Active IGPL competitor · 2025/26 roster",
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
    badgeName: "Gaganjeet Bhullar",
    badgeSub: "Marquee · Asian Tour",
    eyebrow: "Marquee Player · #01",
    name: "Gaganjeet Singh Bhullar",
    meta: "Born 27 April 1988 · Amritsar, Punjab · 6 ft 1 in · Resides in Kapurthala",
    paragraphs: [
      "India's most decorated active golfer joins the Lions as our marquee — a 25-time professional winner and one of the most successful Indians in Asian Tour history. Bhullar turned pro in 2006, peaked at world No. 85 in March 2013, and was honoured with the <strong>Arjuna Award</strong>, India's second-highest sporting honour, the same year.",
      "His eleven Asian Tour titles make him a fixture of that circuit's modern era. His lone <strong>DP World Tour</strong> win came at the <strong>2018 Fiji International</strong>, and he made his single major-championship appearance at <strong>The Open at Turnberry in 2009</strong>. He was India's number-one amateur in <strong>2004 and 2006</strong>, contributed to India's team silver at the <strong>2006 Asian Games</strong>, and represented India at the <strong>2024 Paris Olympics</strong>.",
      "Introduced to golf at age four by his father, H.S. Bhullar, his career is a long, patient, ledger-style story — exactly the kind the Lions are built around.",
    ],
    stats: [
      { v: "25", l: "Pro Wins" },
      { v: "11", l: "Asian Tour Titles" },
      { v: "85", l: "Career-High OWGR" },
      { v: "'13", l: "Arjuna Award" },
    ],
    sideCards: [
      { label: "Signature Win", title: "Fiji International, 2018", sub: "Sole DP World Tour victory." },
      { label: "Major Appearance", title: "The Open · Turnberry 2009", sub: "Career major debut." },
    ],
    bg: "#FBF9F4",
    topBorder: true,
  },
  {
    anchor: "sethie",
    init: "HS",
    badgeName: "Harshjeet Sethie",
    badgeSub: "Rising Star",
    eyebrow: "Rising Star · #02",
    name: "Harshjeet Singh Sethie",
    meta: "Delhi · Standing 6 ft 7 in · Product of the Delhi Golf Club",
    paragraphs: [
      "A genuinely unusual presence on the Indian tour — at <strong>six feet seven inches</strong>, Sethie cuts a silhouette the gallery learns to find on the practice tee before he ever reaches the first box. The height is a hook; the resume backs it up.",
      "At 21, he claimed his maiden professional title at the <strong>Rs 1 crore Coimbatore Open 2023</strong>, beating the experienced Om Prakash Chouhan in a playoff. The win lifted him from <strong>81st to 11th on the PGTI rankings</strong> in a single week and announced a young player who could close in big moments.",
      "Sethie is the kind of signing a long-horizon franchise should be making — early-career, high-ceiling, with a story Chennai's fans can grow up watching.",
    ],
    stats: [
      { v: "6'7\"", l: "Height" },
      { v: "'23", l: "Coimbatore Open" },
      { v: "11", l: "PGTI Rank Post-Win" },
      { v: "DGC", l: "Home Club" },
    ],
    reverse: true,
    bg: "#F4F0E8",
  },
  {
    anchor: "dwivedi",
    init: "SD",
    badgeName: "Samarth Dwivedi",
    badgeSub: "Tour Pro",
    eyebrow: "Tour Pro · #03",
    name: "Samarth Dwivedi",
    paragraphs: [
      "A confirmed touring professional with an <strong>Official World Golf Ranking profile</strong> and an active presence on the PGTI. The signature line on his current resume is a <strong>fourth-place finish at 7-under in an IGPL event during the 2025 season</strong> — proof that on the right week his number can lead a leaderboard.",
      "Dwivedi rounds out the Lions roster with the kind of repeatable, tournament-tested professional who keeps a team in the conversation across a full season rather than a single hot week.",
    ],
    stats: [
      { v: "PGTI", l: "Active Circuit" },
      { v: "T4", l: "IGPL '25 Best Finish" },
      { v: "-7", l: "Round-to-Par" },
      { v: "OWGR", l: "Ranked" },
    ],
    bg: "#FBF9F4",
    topBorder: true,
  },
  {
    anchor: "yashas",
    init: "YC",
    badgeName: "Yashas Chandra M S",
    badgeSub: "Rising Talent",
    eyebrow: "Rising Talent · #04",
    name: "Yashas Chandra M S",
    paragraphs: [
      "An active IGPL competitor in the current season — rounds of <strong>75-68</strong> to sit at one-under at the <strong>IGPL Bharath Classic</strong>, and contention at the <strong>IGPL Chandigarh</strong> leg.",
      "A young player still writing his ledger — and exactly the kind the Lions are happy to invest patience in. Full profile to follow as the season progresses.",
    ],
    bg: "#F4F0E8",
  },
];
