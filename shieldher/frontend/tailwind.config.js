/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-background)',
        primary: 'var(--bg-primary)',
        'primary-hover': 'var(--bg-primary-hover)',
        danger: 'var(--bg-danger)',
        safe: 'var(--bg-safe)',
        card: 'var(--bg-card)',
        'card-border': 'var(--bg-card-border)',
        text: 'var(--text-main)',
        muted: 'var(--text-muted)'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      borderRadius: {
        'xl': '16px',
        'full': '9999px',
      }
    },
  },
  plugins: [],
}
