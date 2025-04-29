/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        'white': '#ffffff',
        'midnight': '#121063',
        'navlink': '#332d6e',
        'lavender': '#BFA9F2',
        'softgray': '#f7f2ff',
        blush: '#F4C6C6',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(186, 169, 242, 0.1), 0 2px 4px -1px rgba(186, 169, 242, 0.06)',
      },
      animation: {
        'fadeIn': 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      },
    },
  },
  plugins: [],
} 