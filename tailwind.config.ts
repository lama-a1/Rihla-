import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: {
          DEFAULT: "var(--color-night)",
          panel: "var(--color-night-panel)",
          soft: "var(--color-night-soft)",
          line: "var(--color-night-line)",
        },
        sand: {
          DEFAULT: "var(--color-sand)",
          bright: "var(--color-sand-bright)",
          dim: "var(--color-sand-dim)",
        },
        oasis: {
          DEFAULT: "var(--color-oasis)",
          bright: "var(--color-oasis-bright)",
          dim: "var(--color-oasis-dim)",
        },
        clay: "var(--color-clay)",
        ink: {
          DEFAULT: "var(--color-ink)",
          muted: "var(--color-ink-muted)",
          faint: "var(--color-ink-faint)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
        arabic: ["var(--font-arabic)", "sans-serif"],
      },
      backgroundImage: {
        "helix-glow": "radial-gradient(circle at 50% 0%, rgba(168,112,58,0.16), transparent 60%)",
        "sand-glow": "radial-gradient(circle at 80% 20%, rgba(201,162,39,0.14), transparent 55%)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        pulseSlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        strandFlow: {
          "0%": { backgroundPosition: "0% 0%" },
          "100%": { backgroundPosition: "0% 100%" },
        },
      },
      animation: {
        pulseSlow: "pulseSlow 2.6s ease-in-out infinite",
        rise: "rise 0.5s ease-out both",
        strandFlow: "strandFlow 6s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
