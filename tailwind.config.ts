import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // No dark mode class — light institutional by default
  theme: {
    extend: {
      colors: {
        // Brand accent
        accent: {
          DEFAULT: "#0080FF",
          light: "#3399FF",
          dark: "#0066CC",
        },
        // Semantic surface
        surface: {
          0: "#FFFFFF",
          1: "#F8F9FB",
          2: "#F1F3F7",
          3: "#E8ECF2",
        },
        // Semantic text
        text: {
          primary: "#0F1724",
          secondary: "#3D4B5C",
          tertiary: "#6B7A8E",
          disabled: "#9BA8B5",
        },
        // Status
        critical: {
          DEFAULT: "#C0392B",
          bg: "#FEF2F2",
          border: "#FECACA",
        },
        high: {
          DEFAULT: "#D35400",
          bg: "#FFF7ED",
          border: "#FED7AA",
        },
        medium: {
          DEFAULT: "#B7791F",
          bg: "#FFFBEB",
          border: "#FDE68A",
        },
        low: {
          DEFAULT: "#276749",
          bg: "#F0FFF4",
          border: "#A7F3D0",
        },
        // Border
        border: {
          DEFAULT: "#DDE2EA",
          strong: "#C5CDD8",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "Consolas", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(15, 23, 36, 0.06), 0 1px 2px -1px rgba(15, 23, 36, 0.04)",
        sm: "0 1px 2px 0 rgba(15, 23, 36, 0.05)",
        md: "0 2px 6px 0 rgba(15, 23, 36, 0.08)",
      },
      spacing: {
        sidebar: "240px",
        "sidebar-sm": "56px",
        header: "56px",
      },
    },
  },
  plugins: [],
};

export default config;
