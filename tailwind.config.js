/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // These map to CSS variables — both themes work automatically
        surface: {
          base:    "var(--bg-base)",
          raised:  "var(--bg-raised)",
          overlay: "var(--bg-overlay)",
          muted:   "var(--bg-muted)",
          border:  "var(--border)",
        },
        tx: {
          primary:   "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary:  "var(--text-tertiary)",
        },
        ca: {
          blue:   "rgb(var(--rgb-blue) / <alpha-value>)",
          purple: "rgb(var(--rgb-purple) / <alpha-value>)",
          teal:   "rgb(var(--rgb-teal) / <alpha-value>)",
          amber:  "rgb(var(--rgb-amber) / <alpha-value>)",
          red:    "rgb(var(--rgb-red) / <alpha-value>)",
        },
        hint: {
          1: "var(--hint-1)",
          2: "var(--hint-2)",
          3: "var(--hint-3)",
          4: "var(--hint-4)",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in":    "fadeIn 0.15s ease-out",
        "slide-up":   "slideUp 0.2s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
      },
      keyframes: {
        fadeIn:  { "0%": { opacity: "0" },  "100%": { opacity: "1" } },
        slideUp: {
          "0%":   { transform: "translateY(6px)", opacity: "0" },
          "100%": { transform: "translateY(0)",   opacity: "1" },
        },
      },
      boxShadow: {
        overlay: "var(--shadow-overlay)",
      },
    },
  },
  plugins: [],
};
