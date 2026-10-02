/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          bg: '#F6F3EC',
          surface: '#FDFCF9',
          border: '#DDD8CB',
          text: '#1F2421',
          muted: '#6B6F68',
          accent: '#1F5E4B',
          accentHover: '#174A3B',
          accentTint: '#E3EEE8',
          codeBg: '#1E2420',
          codeText: '#E6E2D6',
        },
        status: {
          approved: '#2F7D4F',
          active: '#2F7D4F',
          pending: '#B7791F',
          rejected: '#B3402F',
          deprecated: '#7A7F87',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}
