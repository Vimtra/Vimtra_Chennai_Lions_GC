import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/site-url";

// Absolute origin used for the sitemap URL. Configure per-environment via
// NEXT_PUBLIC_SITE_URL. Localhost is a safe dev default that will never
// ship — search engines won't crawl a localhost sitemap.
// Resolved by lib/site-url.ts (non-strict here: a sitemap host is
// informational, so a missing variable logs rather than throws).
export const SITE_URL = getSiteOrigin({ strict: false });

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Everything under these paths is either authenticated, an internal
        // API, or non-content — search engines have no business crawling it.
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/sign-in",
          "/sign-up",
          "/profile",
          "/cart",
          "/checkout",
          "/orders",
          "/orders/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
