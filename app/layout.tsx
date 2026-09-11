import type { Metadata } from "next";
import { Sora, Manrope, Fraunces } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Loader from "@/components/Loader";
import ScrollToTop from "@/components/ScrollToTop";
import PublicChrome from "@/components/PublicChrome";
import { getCurrentUser } from "@/lib/auth";
import { SITE_URL } from "./robots";

// Self-hosted, CLS-free font loading. The `variable` values are the CSS
// custom properties globals.css and tailwind.config.ts resolve against.
const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

// Grandstand foundation (P0) — editorial serif used for long-form leads,
// pull quotes, and single hero moments on migrated pages. Loaded here so
// its CSS variable exists globally, but no legacy page renders it: only
// components that opt into `font-fraunces` / `.gs-h-serif-lead` use it.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

/* Site-wide metadata defaults.

   `metadataBase` is what makes every relative URL below — the Open Graph
   image, and each page's `alternates.canonical` — resolve to an absolute
   address. Without it Next.js emits relative social URLs, which crawlers
   and social scrapers cannot follow, and logs a build-time warning.

   The `title.template` means a page sets only its own name; the franchise
   suffix is appended here in one place. `title.default` is what the home
   page and any page without its own title use.

   Open Graph and Twitter defaults are declared once and inherited by every
   route, so a link to any page has a card. Pages that need a specific card
   (e.g. a news article with its own hero) override them locally — see
   app/news/[slug]/page.tsx. */
// One origin for the whole site. `app/robots.ts` already derives it from
// NEXT_PUBLIC_SITE_URL (with a localhost dev fallback) and uses it for the
// sitemap URL, so it is imported rather than re-declared — two fallbacks
// that disagree would emit canonicals pointing at a different host than the
// sitemap advertises.
const SITE_NAME = "Vimtra Chennai Lions GC";
const SITE_DESCRIPTION =
  "Chennai's franchise in the AM Green Indian Golf Premier League. Owned by Vimtra Ventures. A team built for the long game.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Vimtra Chennai Lions GC · AM Green IGPL · Season 2026",
    template: "%s · Vimtra Chennai Lions GC",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  icons: { icon: "/assets/logo-lion.png" },
  alternates: { canonical: "/" },
  /* Deliberately NO `title`, `description` or `url` in these two objects.
     Next.js falls back to each page's own resolved title/description/canonical
     when they are absent — declaring them here instead pins every page's
     social card to the home page's wording, which is what a link to /invest
     or /players would then show. Only the genuinely site-wide parts (type,
     site name, locale, card style, fallback image) belong at this level. */
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_IN",
    images: [
      {
        url: "/assets/logo-full.png",
        alt: "Vimtra Chennai Lions GC crest",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/assets/logo-full.png"],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  return (
    <html
      lang="en"
      className={`${sora.variable} ${manrope.variable} ${fraunces.variable}`}
    >
      <body>
        {/* Accessibility — keyboard-only skip link.
            Hidden until it receives focus (see .gs-skip-link in globals.css).
            Targets the <main> wrapper below, which is tabIndex={-1} so the
            keyboard user's focus actually moves there on activation. */}
        <a href="#main-content" className="gs-skip-link">
          Skip to main content
        </a>
        {/* The admin console (/admin/*) supplies its own frame — see
            app/admin/layout.tsx. PublicChrome hides the site chrome there. */}
        <PublicChrome>
          <Loader />
          <Nav user={user} />
        </PublicChrome>
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <PublicChrome>
          <Footer />
          <ScrollToTop />
        </PublicChrome>
      </body>
    </html>
  );
}
