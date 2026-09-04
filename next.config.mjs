/** @type {import('next').NextConfig} */

// Baseline security headers applied to every route. A stricter
// Content-Security-Policy (with nonces on inline styles/scripts and
// remote-image host allow-lists) is scheduled for the design-system
// consolidation milestone once the styling is refactored off inline
// style attributes. Keeping the two changes in separate PRs keeps
// blast-radius small if something regresses.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // Only enable HSTS in prod — sending it in local dev bricks http://localhost.
  ...(process.env.NODE_ENV === "production"
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(self), fullscreen=(self)",
  },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Local assets live in /public. Google thumbnail URLs are accepted for
    // product images entered through the admin catalog.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
