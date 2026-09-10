/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"] },
      colors: {
        primary: { DEFAULT: "#2563eb", foreground: "#ffffff" },
        accent: { DEFAULT: "#f59e0b", foreground: "#111827" },
      },
      borderRadius: { "2xl": "1rem", "3xl": "1.5rem" },
    },
  },
  plugins: [],
};
