import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Cores principais VinciPitch
        verde: {
          DEFAULT: '#00E676',
          50: '#E8FFF3',
          100: '#B9FFD9',
          200: '#8AFFBF',
          300: '#5BFFA5',
          400: '#2DFF8B',
          500: '#00E676',
          600: '#00B85E',
          700: '#008A47',
          800: '#005C2F',
          900: '#002E18',
        },
        roxo: {
          DEFAULT: '#4A148C',
          50: '#EDE7F6',
          100: '#D1C4E9',
          200: '#B39DDB',
          300: '#9575CD',
          400: '#7E57C2',
          500: '#6B21A8',
          600: '#5E35B1',
          700: '#4A148C',
          800: '#38006B',
          900: '#12005E',
        },
        fundo: {
          DEFAULT: '#0F172A',
          light: '#1E293B',
          lighter: '#334155',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
