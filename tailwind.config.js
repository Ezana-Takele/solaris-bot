/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0c10",
        surface: "#12161f",
        "surface-light": "#1a2130",
        border: "#232b3e",
        brand: {
          green: "#00ffa3",
          emerald: "#10b981",
          cyan: "#00e5ff",
          purple: "#a855f7",
          rose: "#ff3366",
        },
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 0.8, filter: 'drop-shadow(0 0 8px rgba(0,255,163,0.6))' },
          '50%': { opacity: 0.4, filter: 'drop-shadow(0 0 2px rgba(0,255,163,0.2))' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        }
      },
      animation: {
        glow: 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        scan: 'scanline 8s linear infinite',
      }
    },
  },
  plugins: [],
};

