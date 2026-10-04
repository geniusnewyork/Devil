/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#050505",
          panel: "#0D0D0D",
          panelHover: "#141414",
          border: "#1F1F1F",
          red: "#FF003C",
          crimson: "#DC143C",
          green: "#00FF66",
          cyan: "#00F5FF",
          purple: "#9D00FF",
          blue: "#0066FF",
          muted: "#888888",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "Courier New", "monospace"],
      },
      animation: {
        "rgb-flow": "rgbFlow 6s linear infinite",
        "pulse-fast": "pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scanline": "scanline 8s linear infinite",
        "glitch": "glitch 0.4s ease-in-out infinite",
      },
      keyframes: {
        rgbFlow: {
          "0%, 100%": { borderColor: "#FF003C", boxShadow: "0 0 15px rgba(255, 0, 60, 0.3)" },
          "25%": { borderColor: "#9D00FF", boxShadow: "0 0 15px rgba(157, 0, 255, 0.3)" },
          "50%": { borderColor: "#0066FF", boxShadow: "0 0 15px rgba(0, 102, 255, 0.3)" },
          "75%": { borderColor: "#00FF66", boxShadow: "0 0 15px rgba(0, 255, 102, 0.3)" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        },
        glitch: {
          "0%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 2px)" },
          "40%": { transform: "translate(-2px, -2px)" },
          "60%": { transform: "translate(2px, 2px)" },
          "80%": { transform: "translate(2px, -2px)" },
          "100%": { transform: "translate(0)" },
        },
      },
    },
  },
  plugins: [],
};
