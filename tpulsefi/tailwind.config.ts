import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // World App Colors
        "world-black": "hsl(var(--world-black))",
        "world-white": "hsl(var(--world-white))",
        "world-gray": {
          50: "hsl(var(--world-gray-50))",
          100: "hsl(var(--world-gray-100))",
          200: "hsl(var(--world-gray-200))",
          300: "hsl(var(--world-gray-300))",
          400: "hsl(var(--world-gray-400))",
          500: "hsl(var(--world-gray-500))",
          600: "hsl(var(--world-gray-600))",
          700: "hsl(var(--world-gray-700))",
          800: "hsl(var(--world-gray-800))",
          900: "hsl(var(--world-gray-900))",
        },
        "world-blue": {
          50: "hsl(var(--world-blue-50))",
          100: "hsl(var(--world-blue-100))",
          200: "hsl(var(--world-blue-200))",
          300: "hsl(var(--world-blue-300))",
          400: "hsl(var(--world-blue-400))",
          500: "hsl(var(--world-blue-500))",
          600: "hsl(var(--world-blue-600))",
          700: "hsl(var(--world-blue-700))",
          800: "hsl(var(--world-blue-800))",
          900: "hsl(var(--world-blue-900))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
