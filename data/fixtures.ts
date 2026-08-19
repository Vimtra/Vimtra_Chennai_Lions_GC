export type FixtureCat = "upcoming" | "live" | "past";

export interface Fixture {
  id: string;
  cat: FixtureCat;
  live?: boolean;
  pill: { text: string; bg: string; color: string };
  day: string;
  mon: string;
  title: string;
  sub: string;
  note: string;
  noteBold?: boolean;
  cta: { label: string; href: string; variant: "white" | "gold" | "dark" };
}

export const FIXTURES: Fixture[] = [
  {
    id: "chennai-open",
    cat: "live",
    live: true,
    pill: { text: "LIVE · R2", bg: "#E9CB8E", color: "#3A1A06" },
    day: "26",
    mon: "JUN",
    title: "IGPL Chennai Open",
    sub: "Round 2 of 4 · Madras Gymkhana",
    note: "Lions positioned 2nd · Bhullar -6, Sethie -4",
    cta: { label: "LIVE SCORES →", href: "/scores", variant: "white" },
  },
  {
    id: "bharath-classic",
    cat: "upcoming",
    pill: { text: "UPCOMING", bg: "rgba(196,32,42,0.10)", color: "#C4202A" },
    day: "10",
    mon: "JUL",
    title: "IGPL Bharath Classic",
    sub: "Bangalore Golf Club · 72 holes",
    note: "Full squad confirmed",
    cta: { label: "RSVP", href: "/contact", variant: "gold" },
  },
  {
    id: "chandigarh-leg",
    cat: "upcoming",
    pill: { text: "UPCOMING", bg: "rgba(196,32,42,0.10)", color: "#C4202A" },
    day: "24",
    mon: "JUL",
    title: "IGPL Chandigarh Leg",
    sub: "Chandigarh GC · Stroke play",
    note: "Yashas + Dwivedi confirmed",
    cta: { label: "RSVP", href: "/contact", variant: "gold" },
  },
  {
    id: "coimbatore-open",
    cat: "upcoming",
    pill: { text: "UPCOMING", bg: "rgba(196,32,42,0.10)", color: "#C4202A" },
    day: "14",
    mon: "AUG",
    title: "IGPL Coimbatore Open",
    sub: "CCGA Course · Defending champion field",
    note: "Sethie returns to scene of '23 maiden win",
    cta: { label: "RSVP", href: "/contact", variant: "gold" },
  },
  {
    id: "hyderabad-invitational",
    cat: "past",
    pill: { text: "RESULT", bg: "rgba(26,21,19,0.08)", color: "#1A1513" },
    day: "05",
    mon: "JUN",
    title: "IGPL Hyderabad Invitational",
    sub: "Hyderabad GC · 72 holes",
    note: "Lions finished T3 · Bhullar T2 individual",
    noteBold: true,
    cta: { label: "SCORECARD →", href: "/scores", variant: "dark" },
  },
  {
    id: "mumbai-cup",
    cat: "past",
    pill: { text: "RESULT", bg: "rgba(26,21,19,0.08)", color: "#1A1513" },
    day: "22",
    mon: "MAY",
    title: "IGPL Mumbai Cup",
    sub: "Bombay Presidency · Stroke play",
    note: "Lions finished 4th · Dwivedi T4 individual",
    noteBold: true,
    cta: { label: "SCORECARD →", href: "/scores", variant: "dark" },
  },
];
