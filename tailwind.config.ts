import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: {
          DEFAULT: "#12141C",
          panel: "#1B1E2B",
          soft: "#232739",
          line: "#2E3346",
        },
        sand: {
          DEFAULT: "#D4A24C",
          bright: "#E6BB6C",
          dim: "#8A6B3A",
        },
        oasis: {
          DEFAULT: "#2FB8A6",
          bright: "#4FDCC8",
          dim: "#1F7A6E",
        },
        clay: "#C9714A",
        ink: {
          DEFAULT: "#F2EFE9",
          muted: "#9BA0B4",
          faint: "#5C6178",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
        arabic: ["var(--font-arabic)", "sans-serif"],
      },
      backgroundImage: {
        "helix-glow": "radial-gradient(circle at 50% 0%, rgba(47,184,166,0.16), transparent 60%)",
        "sand-glow": "radial-gradient(circle at 80% 20%, rgba(212,162,76,0.14), transparent 55%)",
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
