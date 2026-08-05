import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "hsl(250, 80%, 95%)",
          100: "hsl(250, 80%, 90%)",
          500: "hsl(250, 80%, 60%)",
          600: "hsl(250, 80%, 55%)",
          700: "hsl(250, 80%, 50%)",
        },
        surface: {
          0: "hsl(0, 0%, 4%)",
          1: "hsl(0, 0%, 7%)",
          2: "hsl(0, 0%, 10%)",
          3: "hsl(0, 0%, 14%)",
        },
        attendance: {
          safe: "hsl(142, 71%, 45%)",
          warning: "hsl(38, 92%, 50%)",
          danger: "hsl(0, 84%, 60%)",
        }
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
      }
    },
  },
  plugins: [],
};
export default config;
