/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060911',
          900: '#0B0F19',
          850: '#0F1626',
          800: '#141D33',
          700: '#1E2A4A',
          600: '#2A3B66'
        },
        cyber: {
          blue: '#00F0FF',
          cyan: '#00D8F6',
          electric: '#2563EB',
          accent: '#38BDF8',
          hot: '#FF3B30',
          orange: '#FF9500',
          warm: '#FFCC00'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Roboto Mono', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(0, 240, 255, 0.3)',
        'glow-blue': '0 0 30px -5px rgba(37, 99, 235, 0.4)',
        'glow-orange': '0 0 25px -5px rgba(255, 149, 0, 0.35)',
        'glow-red': '0 0 30px -5px rgba(255, 59, 48, 0.4)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'grid-flow': 'gridFlow 20s linear infinite',
      },
      keyframes: {
        gridFlow: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '40px 40px' },
        }
      }
    },
  },
  plugins: [],
}
