/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        'app-bg': '#0A0A0F',
        'app-card': '#12121A',
        'text-primary': '#FFFFFF',
        'text-secondary': '#A0A0B2',
        'accent-purple': '#7B61FF',
        'accent-blue': '#4DAFFF',
        'accent-pink': '#FF4DA6',
      },
    },
  },
  plugins: [],
};
