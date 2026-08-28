import type { Metadata } from "next";
import { Sora, Manrope, Fraunces } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Loader from "@/components/Loader";
import ToastHost from "@/components/ToastHost";
import { getCurrentUser } from "@/lib/auth";

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

export const metadata: Metadata = {
  title: "Vimtra Chennai Lions GC · AM Green IGPL · Season 2026",
  description:
    "Chennai's franchise in the AM Green Indian Golf Premier League. Owned by Vimtra Ventures. A team built for the long game.",
  icons: { icon: "/assets/logo-lion.png" },
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
        <Loader />
        <Nav user={user} />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <ToastHost />
      </body>
    </html>
  );
}
