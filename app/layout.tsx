import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Loader from "@/components/Loader";
import ToastHost from "@/components/ToastHost";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Vimtra Chennai Lions GC · Official IGPL Franchise",
  description:
    "Official IGPL franchise representing Tamil Nadu. Long-term build, full-throated pride. Tee off, play pro.",
  icons: { icon: "/assets/logo-lion.png" },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
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
