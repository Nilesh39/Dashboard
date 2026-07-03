/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        instagram: {
          bg: 'var(--color-bg, #000000)',
          primary: 'var(--color-primary, #E1306C)',
          secondary: 'var(--color-secondary, #F56040)',
          accent: 'var(--color-accent, #FCAF45)',
          purple: 'var(--color-purple, #833AB4)',
          blue: 'var(--color-blue, #405DE6)',
          text: 'var(--color-text, #FFFFFF)',
        }
      },
      fontFamily: {
        custom: ['var(--font-family, Inter)', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
