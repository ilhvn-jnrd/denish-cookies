import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: "#FFD100",
          yellowHover: "#ECC200",
          indigo: "#2E1A7A",
          indigoDark: "#1E0E57",
          indigoLight: "#42289E",
          red: "#E32636",
          redHover: "#C81B2A",
          cream: "#FFFDF5",
          creamWarm: "#FFF9E6",
          creamCard: "#FFFFFF",
          surface: "#FBF8F1",
          gold: "#D9A404",
          amber: "#FFB703",
        },
      },
      fontFamily: {
        heading: ["var(--font-fredoka)", "cursive", "sans-serif"],
        body: ["var(--font-jakarta)", "sans-serif"],
      },
      boxShadow: {
        cookie: "0 10px 25px -5px rgba(46, 26, 122, 0.08), 0 8px 10px -6px rgba(46, 26, 122, 0.05)",
        cookieHover: "0 20px 30px -10px rgba(46, 26, 122, 0.16), 0 10px 15px -5px rgba(255, 209, 0, 0.25)",
        cookieRed: "0 10px 25px -5px rgba(227, 38, 54, 0.3)",
      },
      borderRadius: {
        "3xl": "1.75rem",
      },
    },
  },
  plugins: [],
};

export default config;
