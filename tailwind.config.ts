import type { Config } from "tailwindcss";

/**
 * Brand tokens ported verbatim from the static site's tailwind config
 * (assets/lions.js) so existing arbitrary-value markup keeps working.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        crimson: { 600: "#C4202A", 700: "#B11C25", 800: "#A8181F", 900: "#871119" },
        cream: { 50: "#FBF9F4", 100: "#F4F0E8" },
        gold: { 400: "#E6C57E", 500: "#C39A52", deep: "#3A1A06" },
        ink: "#1A1513",
        muted: "#6B635C",
      },
      fontFamily: {
        sora: ["Sora", "sans-serif"],
        manrope: ["Manrope", "sans-serif"],
      },
      maxWidth: {
        "screen-content": "1280px",
      },
    },
  },
  plugins: [],
};

export default config;
