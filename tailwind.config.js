/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"] ,
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
      colors: {
        "cyber-dark": "#0b1020",
        "cyber-glow": "#4fd1ff",
        "cyber-accent": "#8b5cf6",
      },
      boxShadow: {
        glass: "0 20px 60px rgba(15, 23, 42, 0.45)",
      },
    },
  },
  plugins: [],
};
