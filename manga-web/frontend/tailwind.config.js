/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Khai báo bộ màu theo mẫu thiết kế
        "primary": "#1349ec",
        "background-light": "#f6f6f8",
        "background-dark": "#101522",
      },
      fontFamily: {
        "display": ["Spline Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
}