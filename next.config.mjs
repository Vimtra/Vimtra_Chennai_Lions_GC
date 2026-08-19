/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Local assets live in /public/assets; no remote patterns needed yet.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
