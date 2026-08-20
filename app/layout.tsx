import type { Metadata } from "next";
import { Sora, Manrope } from "next/font/google";
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
    <html lang="en" className={`${sora.variable} ${manrope.variable}`}>
      <body>
        <Loader />
        <Nav user={user} />
        {children}
        <Footer />
        <ToastHost />
      </body>
    </html>
  );
}
