/**
 * Vimtra Chennai Lions GC — Season 2026 roster.
 *
 * SOURCE PRECEDENCE (see DATA INTEGRITY in CLAUDE.md, and the content-audit
 * decision recorded below).
 *
 *   1. OFFICIAL IGPL — `GET https://bknd.theigpl.com/api/players`, the
 *      league's own player records. This is the primary source for every
 *      career statistic, ranking, win count and honour on this page.
 *   2. Chennai Lions IGPL brochure (Season 2026, pp. 06–10) — used for
 *      franchise framing (squad numbers, marquee/pro designation) and for
 *      facts the league record does not carry and does not contradict.
 *
 * WHY THE ORDER CHANGED. This file previously took every player fact from
 * the brochure. Checked against the league's own records in September 2026,
 * several of those facts are out of date or contradicted:
 *
 *   · Bhullar — brochure "25 career professional wins ... eleven Asian Tour
 *     titles"; IGPL records 28 wins and 12 Asian Tour victories.
 *   · Bhullar — brochure calls the 2018 Fiji International a DP World Tour
 *     victory; IGPL records it as the first Indian win on the PGA Tour of
 *     Australasia.
 *   · Bhullar — brochure home city Amritsar; IGPL records Chandigarh.
 *   · Sethie — brochure dates the Coimbatore Open win to 2023 and cites a
 *     rise to 11th on the PGTI standings; IGPL dates the win to 2022 and
 *     records him at #28 on the IGPL Order of Merit. The brochure's
 *     ₹1 crore purse and PGTI-rank detail were both tied to "his 2023
 *     season", so they are not carried over against a contradicted year.
 *   · Dwivedi — the brochure's "OWGR-ranked" and "T4 at 7-under, 2025 IGPL"
 *     appear nowhere in the league record. IGPL instead documents a 2023
 *     Dialogue Sri Lanka Open win and a substantial amateur record, which is
 *     what is carried here.
 *   · Yashas Chandra M S — the brochure's "75–68 at the Bharath Classic" and
 *     "contending at IGPL Chandigarh" are not in the league record; IGPL
 *     documents National Games gold (2023) and the national amateur team.
 *
 * Every conflict above is reported rather than silently reconciled. Nothing
 * in this file is written from general knowledge: if neither source states
 * it, it does not appear.
 *
 * The four names and the roster size are confirmed by BOTH sources — all
 * four appear in the official IGPL player list, and the Chennai franchise is
 * `che` / "Vimtra Ventures" in the official franchise list.
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
  // Marquee designation: brochure p. 06. Statistics: official IGPL record.
  {
    init: "GB",
    anchor: "bhullar",
    image: "/players/gaganjeet-bhullar-web.jpg",
    badgeName: "Gaganjeet Bhullar",
    badgeSub: "Marquee · #01",
    fullName: "Gaganjeet Bhullar",
    blurb: "28 pro wins · 12 Asian Tour titles · 3× IGPL winner, 2025",
  },
  {
    init: "HS",
    anchor: "sethie",
    image: "/players/harshjeet-singh-sethie-web.jpg",
    badgeName: "Harshjeet Singh Sethie",
    badgeSub: "Pro · Delhi",
    fullName: "Harshjeet Singh Sethie",
    blurb: "6'7\" · Coimbatore Open winner · India No. 1 Amateur, 2019",
  },
  {
    init: "SD",
    anchor: "dwivedi",
    image: "/players/samarth-dwivedi-web.jpg",
    badgeName: "Samarth Dwivedi",
    badgeSub: "Pro · Gurugram",
    fullName: "Samarth Dwivedi",
    blurb: "Sri Lanka Open winner, 2023 · three course records",
  },
  {
    init: "YC",
    anchor: "yashas",
    image: "/players/yashas-chandra-web.jpg",
    badgeName: "Yashas Chandra M S",
    badgeSub: "Pro · Mysore",
    fullName: "Yashas Chandra M S",
    blurb: "National Games gold, 2023 · Indian national amateur team",
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
    image: "/players/gaganjeet-bhullar-web.jpg",
    badgeName: "Gaganjeet Bhullar",
    badgeSub: "Marquee · Asian Tour",
    // Squad position and marquee designation: brochure p. 06.
    eyebrow: "Marquee Player · #01",
    name: "Gaganjeet Bhullar",
    // City and age: official IGPL record (Chandigarh, 37, turned pro 2006).
    meta: "Chandigarh · Turned professional 2006",
    paragraphs: [
      // Official IGPL player record.
      "India's most prolific international winner, with <strong>28 professional wins</strong> and <strong>twelve Asian Tour victories</strong>. He won the Asian Tour Order of Merit in 2009 and finished as high as fourth in 2018.",
      "The first Indian to win on the <strong>PGA Tour of Australasia</strong>, at the 2018 Fiji International, and the holder of a career-best world ranking of <strong>85</strong>. He received the <strong>Arjuna Award</strong> in 2013.",
      // Official IGPL player record; the Olympic appearance is brochure p. 07.
      "He represented India at the <strong>2006 Asian Games</strong>, taking silver, and at the 2018 World Cup of Golf, and won <strong>three IGPL events in 2025</strong>. The brochure that announced this roster also records his appearance at the Paris 2024 Olympic Games.",
    ],
    stats: [
      { v: "28", l: "Pro Wins" },
      { v: "12", l: "Asian Tour Titles" },
      { v: "85", l: "Career-Best World Rank" },
      { v: "3", l: "IGPL Wins, 2025" },
    ],
    sideCards: [
      {
        label: "Honour",
        title: "Arjuna Award, 2013",
        sub: "India's national award for outstanding sporting achievement.",
      },
      {
        label: "First",
        title: "Fiji International, 2018",
        sub: "First Indian to win on the PGA Tour of Australasia.",
      },
    ],
    bg: "#FBF9F4",
    topBorder: true,
  },
  {
    anchor: "sethie",
    init: "HS",
    image: "/players/harshjeet-singh-sethie-web.jpg",
    badgeName: "Harshjeet Singh Sethie",
    badgeSub: "Pro · Delhi",
    eyebrow: "Pro · #02",
    name: "Harshjeet Singh Sethie",
    // Official IGPL record: Delhi, age 23, turned professional 2020.
    meta: "Delhi · 6 ft 7 in · Turned professional 2020",
    paragraphs: [
      // Official IGPL player record.
      "At <strong>six feet seven inches</strong> he is one of the tallest professionals on tour, and he was <strong>India's No. 1 Junior</strong> at both IGU Sub-Junior and Junior level.",
      "He won <strong>four IGU amateur tournaments in 2019</strong> to finish the year as <strong>India's No. 1 Amateur</strong>, and has represented India internationally since 2009 — in Scotland, Ireland, South Africa, Thailand, Singapore and Australia.",
    ],
    stats: [
      { v: "6'7\"", l: "Height" },
      { v: "No. 1", l: "India Amateur, 2019" },
      { v: "28", l: "IGPL Order of Merit" },
      { v: "2020", l: "Turned Professional" },
    ],
    sideCards: [
      {
        label: "Signature Win",
        title: "Coimbatore Open",
        sub: "His first professional title. The league record dates the win to 2022; the franchise brochure dates it to 2023.",
      },
      {
        label: "International",
        title: "Asia Pacific Amateur, 2019",
        sub: "Representing India since the age of eleven.",
      },
    ],
    reverse: true,
    bg: "#F4F0E8",
  },
  {
    anchor: "dwivedi",
    init: "SD",
    image: "/players/samarth-dwivedi-web.jpg",
    badgeName: "Samarth Dwivedi",
    badgeSub: "Pro · Gurugram",
    eyebrow: "Pro · #03",
    name: "Samarth Dwivedi",
    // Official IGPL record: Gurugram, age 32, turned professional 2016.
    meta: "Gurugram · Turned professional 2016",
    paragraphs: [
      // Official IGPL player record.
      "Winner of the <strong>2023 Dialogue Sri Lanka Open</strong>, and <strong>India's No. 1 Amateur</strong> from January to August 2015 on the back of <strong>seven national IGU event wins</strong>.",
      "He was part of India's <strong>2014 Asian Games</strong> contingent in Korea and represented Asia-Pacific in the <strong>2016 Bonallack Trophy</strong>. He holds the course record at Pune Golf Club, Royal Colombo Golf Club and Damai Indah Golf Club.",
    ],
    stats: [
      { v: "'23", l: "Sri Lanka Open" },
      { v: "7", l: "National IGU Wins" },
      { v: "3", l: "Course Records" },
      { v: "'14", l: "Asian Games" },
    ],
    sideCards: [
      {
        label: "Signature Win",
        title: "Dialogue Sri Lanka Open, 2023",
        sub: "His first professional title on the international circuit.",
      },
    ],
    bg: "#FBF9F4",
    topBorder: true,
  },
  {
    anchor: "yashas",
    init: "YC",
    image: "/players/yashas-chandra-web.jpg",
    badgeName: "Yashas Chandra M S",
    badgeSub: "Pro · Mysore",
    eyebrow: "Pro · #04",
    name: "Yashas Chandra M S",
    // Official IGPL record: Mysore, age 30, turned professional 2018.
    meta: "Mysore · Turned professional 2018",
    paragraphs: [
      // Official IGPL player record.
      "<strong>National Games gold medallist in 2023</strong> in the individual event for Karnataka, and <strong>Emerging Player of the Year in 2018</strong>.",
      "He was part of the <strong>Indian national amateur team from 2015 to 2018</strong> and has represented India at the Asia Pacific Amateur, the South African Amateur and the British Amateur championships.",
    ],
    stats: [
      { v: "'23", l: "National Games Gold" },
      { v: "'18", l: "Emerging Player" },
      { v: "4 yrs", l: "National Amateur Team" },
      { v: "2018", l: "Turned Professional" },
    ],
    sideCards: [
      {
        label: "Honour",
        title: "National Games gold, 2023",
        sub: "Individual event, representing Karnataka.",
      },
    ],
    bg: "#F4F0E8",
  },
];
