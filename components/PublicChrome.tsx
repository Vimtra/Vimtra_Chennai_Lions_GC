"use client";

import { usePathname } from "next/navigation";

/**
 * Renders its children only outside the admin console. The public Nav,
 * Footer, brand splash and scroll-to-top belong to the marketing site;
 * /admin supplies its own frame (app/admin/layout.tsx).
 */
export default function PublicChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return <>{children}</>;
}
