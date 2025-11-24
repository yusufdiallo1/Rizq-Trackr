import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        /**
         * Mobile: 0px - 640px (default, no prefix needed)
         * Tablet range utilities
         * - `tablet:` applies between 641px and 1024px
         *   (keeps default Tailwind `md`/`lg` breakpoints intact)
         */
        tablet: { min: "641px", max: "1024px" },
        /**
         * Desktop: 1025px+
         * Use default `lg:` breakpoint (1024px+) for desktop
         */
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "#10b981",
          dark: "#059669",
          light: "#6ee7b7",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#f59e0b",
          dark: "#d97706",
          light: "#fbbf24",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        cream: {
          DEFAULT: "#fef3c7",
          light: "#fefce8",
        },
        surface: {
          DEFAULT: "#ffffff",
          warm: "#fffbeb",
        },
        income: {
          DEFAULT: "#10b981",
          light: "#d1fae5",
        },
        expense: {
          DEFAULT: "#f87171",
          light: "#fee2e2",
        },
        success: "#22c55e",
        error: "#ef4444",
        charcoal: {
          DEFAULT: "#1f2937",
          dark: "#111827",
        },
      },
      fontFamily: {
        heading: ["Inter", "Poppins", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["Roboto Mono", "JetBrains Mono", "monospace"],
      },
      /**
       * Tablet-friendly typography helpers
       * (can be used via `text-body`, `text-body-sm` etc. where useful)
       */
      fontSize: {
        body: ["15px", { lineHeight: "1.6" }],
        "body-sm": ["13px", { lineHeight: "1.6" }],
        "tablet-heading": ["2rem", { lineHeight: "1.2", fontWeight: "700" }],
        "tablet-body": ["16px", { lineHeight: "1.6" }],
        "tablet-caption": ["14px", { lineHeight: "1.5" }],
      },
      spacing: {
        "tablet-section": "2rem",
        "tablet-card": "1.5rem",
        "tablet-gap": "1.5rem",
        "mobile-xs": "4px",
        "mobile-sm": "8px",
        "mobile-md": "12px",
        "mobile-lg": "16px",
        "mobile-xl": "20px",
        "mobile-2xl": "24px",
        "mobile-nav": "56px",
        "mobile-tab": "64px",
        "tablet-xs": "6px",
        "tablet-sm": "12px",
        "tablet-md": "16px",
        "tablet-lg": "20px",
        "tablet-xl": "24px",
        "tablet-2xl": "32px",
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "16px",
        xl: "24px",
        "tablet-card": "20px",
        "tablet-modal": "24px",
        "mobile-card": "16px",
        "mobile-input": "12px",
        "mobile-button": "12px",
      },
      boxShadow: {
        card: "0 2px 8px rgba(0, 0, 0, 0.08)",
        "card-hover": "0 4px 16px rgba(0, 0, 0, 0.12)",
        elevated: "0 8px 24px rgba(0, 0, 0, 0.15)",
        islamic: "0 4px 12px rgba(16, 185, 129, 0.15)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

