/**
 * The site's public origin, for links that leave the app (verification
 * emails, order emails, sitemap).
 *
 * Source of truth is NEXT_PUBLIC_SITE_URL. In development a localhost
 * fallback is fine. In production it is not: a verification link pointing at
 * http://localhost:3000 is a dead link in a real inbox, so this module never
 * fabricates one silently there — it tries Vercel's own production hostname
 * (VERCEL_PROJECT_PRODUCTION_URL, injected by the platform) with a loud
 * warning, and otherwise throws `SiteUrlError` so the caller can refuse to
 * send rather than send a broken link.
 *
 * Pure env reads, no secrets, safe to import anywhere.
 */

export class SiteUrlError extends Error {
  constructor() {
    super(
      "NEXT_PUBLIC_SITE_URL is not set. Set it to the site's public origin (e.g. https://www.example.com) in the deployment environment."
    );
    this.name = "SiteUrlError";
  }
}

const DEV_FALLBACK = "http://localhost:3000";

function isProduction(): boolean {
  return process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
}

let warned = false;

/**
 * Absolute origin without a trailing slash.
 *
 * `strict` (default true) throws in production when nothing usable is
 * configured. Pass `strict: false` for informational uses (sitemap host,
 * display-only hostnames) where a fallback is preferable to a crash.
 */
export function getSiteOrigin(opts: { strict?: boolean } = {}): string {
  const strict = opts.strict ?? true;
  const configured = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim().replace(/\/$/, "");
  if (configured) return configured;

  if (!isProduction()) return DEV_FALLBACK;

  const vercelHost = (process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "").trim();
  if (vercelHost) {
    if (!warned) {
      warned = true;
      console.error(
        `[site-url] NEXT_PUBLIC_SITE_URL is not set in production — falling back to https://${vercelHost}. Set NEXT_PUBLIC_SITE_URL explicitly.`
      );
    }
    return `https://${vercelHost}`;
  }

  if (strict) throw new SiteUrlError();
  if (!warned) {
    warned = true;
    console.error("[site-url] NEXT_PUBLIC_SITE_URL is not set in production; using localhost for a non-critical link.");
  }
  return DEV_FALLBACK;
}

/** Hostname only, for email copy such as "sign in at www.example.com". */
export function getSiteHost(): string {
  return getSiteOrigin({ strict: false }).replace(/^https?:\/\//, "");
}
