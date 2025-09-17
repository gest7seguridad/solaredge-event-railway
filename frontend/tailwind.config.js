/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f6f9',
          100: '#e1edf3',
          200: '#c3dbe7',
          300: '#a5c9db',
          400: '#87b7cf',
          500: '#709eb5',  // Main brand color from Solarland
          600: '#5a8299',
          700: '#486a7c',
          800: '#375160',
          900: '#253843',
        },
        solar: {
          yellow: '#FFC107',
          orange: '#FF9800',
        }
      },
      fontFamily: {
        'sans': ['Roboto', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}