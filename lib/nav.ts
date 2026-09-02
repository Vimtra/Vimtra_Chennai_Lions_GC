import {
  Home,
  Castle,
  UsersRound,
  Flag,
  CalendarDays,
  Activity,
  Trophy,
  Newspaper,
  Image as ImageIcon,
  ShoppingBag,
  Handshake,
  Send,
  UserRound,
  Sprout,
  Building2,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** Full navigation set. Grouped visually in the overlay via CLUSTERS below. */
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/the-club", label: "The Club", icon: Castle },
  { href: "/the-pride", label: "The Pride", icon: UsersRound },
  { href: "/golf-development", label: "Golf Development", icon: Sprout },
  { href: "/vimtra-ventures", label: "Vimtra Ventures", icon: Building2 },
  { href: "/players", label: "Players", icon: Flag },
  { href: "/fixtures", label: "Fixtures", icon: CalendarDays },
  { href: "/scores", label: "Scores", icon: Activity },
  { href: "/leaderboards", label: "Leaderboards", icon: Trophy },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/shop", label: "Shop", icon: ShoppingBag },
  { href: "/partners", label: "Partners", icon: Handshake },
  { href: "/invest", label: "Invest", icon: TrendingUp },
  { href: "/contact", label: "Contact", icon: Send },
  { href: "/profile", label: "Profile", icon: UserRound },
];

/** Pages shown inline on desktop; the rest live in the hamburger overlay. */
export const PRIMARY_NAV = ["/the-club", "/players", "/fixtures", "/news", "/shop"];

/**
 * Routes whose first section is a dark, full-bleed image hero.
 *
 * On these the header floats over the photograph as a veil instead of
 * reserving a solid strip above it, and resolves to the deep-ink state on
 * scroll. The hero itself reserves header height as top padding (see
 * `.cm-hero` / `.hero` in app/globals.css), so nothing is ever covered.
 *
 * Routes join this list as their heroes are converted, one Club-module
 * phase at a time — never speculatively.
 */
export const FLOATING_HEADER_ROUTES = [
  "/",
  "/the-club",
  "/the-pride",
  "/players",
  "/golf-development",
  "/vimtra-ventures",
  "/fixtures",
  "/scores",
  "/leaderboards",
  // Joins the list on the same terms as /scores and /leaderboards: it
  // opens on a `PageMasthead` carrying a photograph, so the solid header
  // strip above it was cutting the image off from the top of the page
  // instead of letting it run full-bleed.
  "/partners",
];

/**
 * Site taxonomy — the ONE definition of how pages are grouped.
 *
 * This replaces a `NAV_CLUSTERS` export that claimed the same role but had
 * no importers. The header had quietly grown its own copy in the JSX and
 * the footer a third, and the three had drifted: the header filed News and
 * Gallery under "Media" while the footer filed them under "The Season", so
 * the same link sat in a different section depending on which end of the
 * page you read. Both now render from the list below, which is why they
 * cannot disagree again.
 *
 * `image` / `caption` are the header mega-panel's figure. "Business" has
 * neither — it appears only in the mobile overlay and the footer, neither
 * of which renders a figure. The optional type is what encodes that.
 */
export interface SectionItem {
  href: string;
  label: string;
  /** Shown in the header's mega panel; the footer renders labels only. */
  desc: string;
}

export interface SiteSection {
  key: "club" | "season" | "media" | "business";
  label: string;
  items: SectionItem[];
  /** Present only on sections the desktop mega panel can open. */
  image?: string;
  caption?: string;
}

export const SITE_SECTIONS: SiteSection[] = [
  {
    key: "club",
    label: "The Club",
    items: [
      { href: "/the-club", label: "The Club", desc: "Franchise story · Chennai roots" },
      { href: "/the-pride", label: "The Pride", desc: "The city and the mark" },
      { href: "/players", label: "Players", desc: "Season 2026 roster" },
      { href: "/golf-development", label: "Golf Development", desc: "Coaching · academies · course" },
      { href: "/vimtra-ventures", label: "Vimtra Ventures", desc: "The firm behind the franchise" },
    ],
    // A photograph, never a transparent cutout — cover-fit needs a real frame.
    // Sourced photography (public/assets/photo/CREDITS.md), distinct from
    // every image used on the pages this panel links to.
    image: "/assets/photo/nav-club-green-flag.jpg",
    // Generic stock — deliberately NOT captioned with a venue name.
    caption: "The franchise",
  },
  {
    key: "season",
    label: "The Season",
    items: [
      { href: "/fixtures", label: "Fixtures", desc: "AM Green IGPL · 2026 calendar" },
      { href: "/scores", label: "Scores", desc: "Round-by-round scorecards" },
      { href: "/leaderboards", label: "Standings", desc: "Franchise table · Order of Merit" },
    ],
    image: "/assets/photo/nav-season-bunker-ocean.jpg",
    caption: "Season 2026",
  },
  {
    key: "media",
    label: "Media",
    items: [
      { href: "/news", label: "News", desc: "Franchise news & press coverage" },
      { href: "/gallery", label: "Gallery", desc: "Tour frames" },
    ],
    image: "/assets/photo/nav-media-ball-green.jpg",
    caption: "From the den",
  },
  {
    key: "business",
    label: "Business",
    // Order follows the header's mobile overlay, which is the reference the
    // footer is being brought into line with.
    items: [
      { href: "/partners", label: "Partners", desc: "Commercial partners" },
      { href: "/invest", label: "Invest", desc: "Investment & sponsorship" },
      { href: "/shop", label: "Shop", desc: "Official merchandise" },
      { href: "/contact", label: "Contact", desc: "Talk to the franchise" },
    ],
  },
];

/** The sections the desktop header opens as a mega panel — the ones with a figure. */
export const MEGA_SECTIONS = SITE_SECTIONS.filter(
  (s): s is SiteSection & { image: string; caption: string } =>
    Boolean(s.image) && Boolean(s.caption)
);

/** Shown inline in the desktop header rather than behind a panel. */
export const DIRECT_NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/partners", label: "Partners" },
  { href: "/invest", label: "Invest" },
  { href: "/contact", label: "Contact" },
];
