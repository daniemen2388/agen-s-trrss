/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary': '#121212',
        'background': '#FFFFFF',
        'background-alt': '#FDFDFD',
        'text': '#444444',
        'heading': '#040404',
        dark: {
          'primary': '#FFFFFF',
          'background': '#222222',
          'background-alt': '#1C1C1C',
          'text': '#E5E5E5',
          'heading': '#FFFFFF',
          'nav': '#1C1C1C'
        }
      },
      fontFamily: {
        'signika': ['Signika', 'sans-serif'],
        'heebo': ['Heebo', 'sans-serif'],
      },
    },
  },
  plugins: [],
}