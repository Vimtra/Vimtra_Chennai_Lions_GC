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
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** Full navigation set (matches NAV_ITEMS in the static assets/lions.js). */
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/the-club", label: "The Club", icon: Castle },
  { href: "/the-pride", label: "The Pride", icon: UsersRound },
  { href: "/players", label: "Players", icon: Flag },
  { href: "/fixtures", label: "Fixtures", icon: CalendarDays },
  { href: "/scores", label: "Scores", icon: Activity },
  { href: "/leaderboards", label: "Leaderboards", icon: Trophy },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/shop", label: "Shop", icon: ShoppingBag },
  { href: "/partners", label: "Partners", icon: Handshake },
  { href: "/contact", label: "Contact", icon: Send },
  { href: "/profile", label: "Profile", icon: UserRound },
];

/** Pages shown inline on desktop; the rest live in the hamburger overlay. */
export const PRIMARY_NAV = ["/the-club", "/players", "/fixtures", "/news", "/shop"];
