import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        foreground: "#FFFFFF",
        primary: {
          DEFAULT: "#C5FF4A",
          foreground: "#000000",
          muted: "rgba(197, 255, 74, 0.1)",
        },
        muted: {
          DEFAULT: "#1A1A1A",
          foreground: "#888888",
        },
        border: {
          DEFAULT: "#2A2A2A",
          subtle: "rgba(255, 255, 255, 0.05)",
        },
        card: {
          DEFAULT: "#0D0D0D",
          hover: "#141414",
          foreground: "#E5E5E5",
        },
        accent: {
          DEFAULT: "#C5FF4A",
          foreground: "#000000",
        },
        destructive: {
          DEFAULT: "#FF4A4A",
          foreground: "#FFFFFF",
        },
      },
      fontFamily: {
        heading: ["PT Serif", "Georgia", "Times New Roman", "serif"],
        body: ["Inter Tight", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
        terminal: ["JetBrains Mono", "Courier New", "monospace"],
      },
      fontSize: {
        "display-xl": [
          "5.75rem",
          { lineHeight: "1.05", letterSpacing: "-0.03em" },
        ],
        "display-lg": [
          "5rem",
          { lineHeight: "1.05", letterSpacing: "-0.03em" },
        ],
        "display-md": [
          "3.5rem",
          { lineHeight: "1.1", letterSpacing: "-0.02em" },
        ],
        "display-sm": [
          "2.5rem",
          { lineHeight: "1.15", letterSpacing: "-0.02em" },
        ],
        "heading-lg": ["2rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        "heading-md": [
          "1.5rem",
          { lineHeight: "1.3", letterSpacing: "-0.01em" },
        ],
        "heading-sm": ["1.25rem", { lineHeight: "1.4" }],
      },
      spacing: {
        "0.5": "4px",
        "1": "8px",
        "2": "16px",
        "3": "24px",
        "4": "32px",
        "5": "40px",
        "6": "48px",
        "8": "64px",
        "10": "80px",
        "12": "96px",
      },
      borderRadius: {
        none: "0px",
        sm: "2px",
        DEFAULT: "4px",
        md: "6px",
        lg: "8px",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        marquee: "marquee 30s linear infinite",
        "ascii-float": "asciiFloat 8s ease-in-out infinite",
        "spark-pulse-l": "sparkPulseL 7s ease-in-out infinite",
        "spark-pulse-r": "sparkPulseR 9s ease-in-out infinite",
        "breath-lime": "breathLime 4.5s ease-in-out infinite",
        "scanline-drift": "scanlineDrift 0.1s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(197, 255, 74, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(197, 255, 74, 0.6)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        asciiFloat: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        sparkPulseL: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
        sparkPulseR: {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "0.9" },
        },
        breathLime: {
          "0%, 100%": { color: "rgba(197, 255, 74, 0.6)" },
          "50%": { color: "rgba(197, 255, 74, 1)" },
        },
        scanlineDrift: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(3px)" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        noise: "url('/noise.png')",
      },
    },
  },
  plugins: [typography],
};

export default config;
