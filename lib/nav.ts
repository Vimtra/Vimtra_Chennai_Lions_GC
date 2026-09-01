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
];

/**
 * Overlay grouping. The three columns of the hamburger overlay are
 * assembled from these ordered path lists so the taxonomy has one
 * source of truth (this file) rather than the JSX in components/Nav.tsx.
 */
export const NAV_CLUSTERS: {
  key: string;
  title: string;
  hrefs: string[];
}[] = [
  {
    key: "franchise",
    title: "The Franchise",
    hrefs: [
      "/",
      "/the-club",
      "/the-pride",
      "/players",
      "/golf-development",
      "/vimtra-ventures",
    ],
  },
  {
    key: "season",
    title: "The Season",
    hrefs: ["/fixtures", "/scores", "/leaderboards", "/news", "/gallery"],
  },
  {
    key: "business",
    title: "Store & Business",
    // /cart is intentionally omitted — reachable from the header's cart icon.
    hrefs: ["/shop", "/partners", "/invest", "/contact"],
  },
];
