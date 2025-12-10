/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{html,js,jsx,ts,tsx,mdx}',
    './app/**/*.{js,jsx,ts,tsx,mdx}',   // app router (Next)
    './pages/**/*.{js,jsx,ts,tsx}',     // pages router (Next)
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          100: 'var(--bg-100)',
          200: 'var(--bg-200)',
          card: 'var(--bg-card)',
          border: 'var(--bg-border)',
        },
        text: {
          100: 'var(--text-100)',
          200: 'var(--text-200)',
          300: 'var(--text-300)',
        },
        blue: {
          DEFAULT: 'var(--blue)',
          hover: 'var(--blue-hover)',
          sub: 'var(--blue-sub)',
        },
        purple: {
          DEFAULT: 'var(--purple)',
          hover: 'var(--purple-hover)',
          sub: 'var(--purple-sub)',
        },
        success: 'var(--success)',
        warning: 'var(--warning)',
        error: 'var(--error)',
      },
    },
  },
  plugins: [],
};
