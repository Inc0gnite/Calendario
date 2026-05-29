import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // ── Colores del sistema de diseño ──
      colors: {
        brand: {
          blue: "#5B8DEF",
          green: "#5EC7A1",
          purple: "#A78BFA",
          red: "#F97373",
        },
        bg: {
          light: "#F7F8FA",
          dark: "#111315",
        },
        surface: {
          light: "#FFFFFF",
          dark: "#1C1F21",
        },
        border: {
          light: "#E5E7EB",
          dark: "#2A2D30",
        },
      },

      // ── Fuentes ──
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },

      // ── Border radius ──
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },

      // ── Sombras suaves ──
      boxShadow: {
        soft: "0 2px 12px rgba(0, 0, 0, 0.06)",
        card: "0 4px 24px rgba(0, 0, 0, 0.08)",
        float: "0 8px 32px rgba(0, 0, 0, 0.12)",
      },

      // ── Animaciones ──
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        "scale-in": "scale-in 0.15s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
