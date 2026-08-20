import type { MetadataRoute } from "next";

// Absolute origin used for the sitemap URL. Configure per-environment via
// NEXT_PUBLIC_SITE_URL. Localhost is a safe dev default that will never
// ship — search engines won't crawl a localhost sitemap.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/$/, "");

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
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
