import type { MetadataRoute } from "next";
import { SITE_URL } from "./robots";
import { listProducts } from "@/lib/db";

// Public routes only. Authenticated / API / commerce-flow routes are
// intentionally excluded and also disallowed in robots.ts. Product detail
// pages are enumerated from the live catalog so new items are indexed
// without a code change.
const STATIC_ROUTES: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "/", changeFrequency: "weekly", priority: 1.0 },
  { path: "/the-club", changeFrequency: "monthly", priority: 0.8 },
  { path: "/the-pride", changeFrequency: "monthly", priority: 0.7 },
  { path: "/golf-development", changeFrequency: "monthly", priority: 0.8 },
  { path: "/vimtra-ventures", changeFrequency: "monthly", priority: 0.7 },
  { path: "/players", changeFrequency: "monthly", priority: 0.8 },
  { path: "/fixtures", changeFrequency: "weekly", priority: 0.8 },
  { path: "/scores", changeFrequency: "hourly", priority: 0.6 },
  { path: "/leaderboards", changeFrequency: "daily", priority: 0.6 },
  { path: "/news", changeFrequency: "daily", priority: 0.8 },
  { path: "/gallery", changeFrequency: "weekly", priority: 0.5 },
  { path: "/partners", changeFrequency: "monthly", priority: 0.6 },
  { path: "/invest", changeFrequency: "monthly", priority: 0.7 },
  { path: "/shop", changeFrequency: "daily", priority: 0.9 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.5 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const products = await listProducts();
    productEntries = products.map((p) => ({
      url: `${SITE_URL}/product/${p.id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // If the DB is not reachable at build time (e.g. first deploy before the
    // migration has run) omit product URLs rather than fail the whole sitemap.
    productEntries = [];
  }

  return [...staticEntries, ...productEntries];
}
