import type { Config } from "tailwindcss";

/**
 * Brand tokens for the Vimtra Chennai Lions GC site.
 * Arbitrary-value markup elsewhere in the codebase resolves against these.
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
        // -------- Grandstand foundation additions (P0) --------
        // Additive-only — pre-existing tokens above are untouched so
        // legacy pages render exactly as before. Migrated pages opt in.
        paper: "#FDFBF7",
        stone: "#E8E3D9",
        charcoal: "#24201D",
        slate: { DEFAULT: "#2E2926", 700: "#3A3532" },
      },
      fontFamily: {
        // Resolves to the CSS variable set by next/font/google in app/layout.tsx.
        // The literal family names remain as fallbacks so any residual raw
        // reference still lands on the correct face during the swap window.
        sora: ["var(--font-sora)", "Sora", "sans-serif"],
        manrope: ["var(--font-manrope)", "Manrope", "sans-serif"],
        // P0 addition — editorial serif for long-form / lead paragraphs.
        // Loaded from next/font/google in app/layout.tsx.
        fraunces: ["var(--font-fraunces)", "Fraunces", "Georgia", "serif"],
      },
      maxWidth: {
        "screen-content": "1280px",
        // P0 additions — the Grandstand container scale.
        prose: "720px",
        page: "1200px",
        wide: "1400px",
      },
      borderRadius: {
        // P0 additions — namespaced so existing rounded-[NNpx] usages continue.
        "gs-xs": "4px",
        "gs-sm": "8px",
        "gs-md": "12px",
        "gs-lg": "20px",
        "gs-xl": "28px",
      },
      boxShadow: {
        // P0 additions — three elevation levels for light + dark surfaces.
        "gs-1": "0 1px 2px rgba(26,21,19,0.06), 0 8px 24px -12px rgba(26,21,19,0.16)",
        "gs-2": "0 2px 4px rgba(26,21,19,0.08), 0 24px 48px -20px rgba(26,21,19,0.32)",
        "gs-3": "0 8px 16px rgba(26,21,19,0.10), 0 40px 80px -30px rgba(26,21,19,0.44)",
        "gs-1-dark":
          "0 1px 2px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04)",
        "gs-2-dark":
          "0 2px 6px rgba(0,0,0,0.30), 0 12px 28px -14px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)",
      },
      transitionDuration: {
        // P0 additions — Grandstand motion durations.
        fast: "150ms",
        base: "300ms",
        slow: "700ms",
        hero: "1200ms",
      },
      transitionTimingFunction: {
        // P0 additions — three easings covering hover / reveal / snap.
        gs: "cubic-bezier(0.2, 0.7, 0.2, 1)",
        "gs-out": "cubic-bezier(0.16, 0.84, 0.24, 1)",
        "gs-swift": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
