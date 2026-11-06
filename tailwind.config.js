/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
   
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 10px 50px -12px rgba(243, 111, 33, 0.35)',
      },
    },
  },
  plugins: [],
}
