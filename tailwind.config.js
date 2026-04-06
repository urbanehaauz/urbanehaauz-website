/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./index.tsx",
    "./App.tsx",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./context/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        urbane: {
          green: '#8C5E45',
          darkGreen: '#1C1917',
          lightGreen: '#BCAAA4',
          mist: '#F9F8F6',
          gold: '#C5A059',
          goldLight: '#E5C558',
          orange: '#E07A5F',
          blue: '#4A90E2',
          charcoal: '#2C241F',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 10px 40px -10px rgba(28, 25, 23, 0.08)',
        'gold': '0 4px 20px -5px rgba(197, 160, 89, 0.4)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(28, 25, 23, 0.6))',
        'gold-gradient': 'linear-gradient(135deg, #C5A059 0%, #B08D55 100%)',
        'green-gradient': 'linear-gradient(135deg, #8C5E45 0%, #5D4037 100%)',
      },
    },
  },
  plugins: [],
};
