/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Để sau này bật chế độ tối/sáng
  theme: {
    extend: {
      colors: {
        "primary": "#008e9e", // Màu xanh ngọc chủ đạo
        "background-light": "#f8fafc",
        "background-dark": "#0f172a",
        "surface-dark": "#1e293b",
        "border-dark": "#334155"
      },
      fontFamily: {
        "display": ["Manrope", "sans-serif"] // Font chữ hiện đại
      }
    },
  },
  plugins: [],
}