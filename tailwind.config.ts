import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111111",
        parchment: "#f8f5ef",
        mist: "#ebe5db",
        ember: "#f87171",
        glow: "#fbbf24",
      },
      boxShadow: {
        ambient: "0 25px 80px rgba(17, 17, 17, 0.08)",
      },
      fontFamily: {
        sans: ["Inter", "Geist", "system-ui", "sans-serif"],
        serif: ["Merriweather", "Source Serif 4", "Georgia", "serif"],
      },
      keyframes: {
        pulseEdge: {
          "0%, 100%": { opacity: "0.15" },
          "50%": { opacity: "0.4" },
        },
      },
      animation: {
        pulseEdge: "pulseEdge 2.5s ease-in-out infinite",
      },
    },
  },
  plugins: [typography],
};

export default config;
