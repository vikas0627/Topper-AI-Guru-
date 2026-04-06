/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6366f1",
        secondary: "#f97316",
      },
      backgroundImage: {
        'indigo-gradient': 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
      }
    },
  },
  plugins: [],
}
