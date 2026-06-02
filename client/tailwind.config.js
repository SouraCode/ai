/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f2f7f5',
          100: '#e2ede9',
          200: '#c6ded3',
          300: '#9dc2b4',
          400: '#6fa08f',
          500: '#4f8372',
          600: '#3d685a',
          700: '#315449',
          800: '#1e3f35',
          900: '#1a332c',
          950: '#0d1d19',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-hover': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'glow': '0 0 15px rgba(111, 160, 143, 0.4)',
      }
    },
  },
  plugins: [],
}
