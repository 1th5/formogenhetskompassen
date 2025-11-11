// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // brand
        primary: "#001B2B",
        secondary: "#0E5E4B",
        accent: "#C47A2C",

        // semantic
        success: "#0E5E4B",
        warning: "#C47A2C",
        danger: "#C88C3C",
        info: "#4A84C1",

        // surfaces
        surface: {
          light: "#F4F0EA",
          dark: "#19222B",
          white: "#FFFFFF",
        },

        // wealth ladder levels
        level: {
          1: "#6A7174", // lön till lön
          2: "#0E5E4B", // vardagstrygghet
          3: "#C47A2C", // restaurangfrihet
          4: "#4A84C1", // resefrihet
          5: "#001B2B", // geografisk frihet
          6: "#C88C3C", // påverkansfrihet
        },
      },
      fontFamily: {
        serif: ["DM Serif Display", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1.25rem",
        "2xl": "1.5rem",
        full: "9999px",
      },
      boxShadow: {
        subtle: "0 6px 20px rgba(0,27,43,0.04)",
        card: "0 12px 30px rgba(0,27,43,0.08)",
      },
      backgroundImage: {
        "glass-light":
          "linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(244,240,234,0.55) 100%)",
        "glass-dark":
          "linear-gradient(135deg, rgba(0,27,43,0.28) 0%, rgba(0,27,43,0.05) 60%)",
      },
    },
  },
  plugins: [],
};

export default config;


