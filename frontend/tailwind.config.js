/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Define a custom color palette for the QuantumPay brand
      colors: {
        primary: {
          light: '#6D28D9', // A lighter shade of purple
          DEFAULT: '#4F46E5', // Indigo-600 as the main brand color
          dark: '#3730A3',  // A darker shade for hover states
        },
        secondary: {
          light: '#10B981', // A lighter green for success states
          DEFAULT: '#059669', // Emerald-600 as a secondary accent
          dark: '#047857',   // A darker green for hover
        },
        neutral: {
          '50': '#F8FAFC',
          '100': '#F1F5F9',
          '200': '#E2E8F0',
          '300': '#CBD5E1',
          '400': '#94A3B8',
          '500': '#64748B',
          '600': '#475569',
          '700': '#334155',
          '800': '#1E293B',
          '900': '#0F172A',
          '950': '#020617',
        },
      },
      // Extend the font family to include modern, clean fonts
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        display: ['Lexend', ...defaultTheme.fontFamily.sans],
      },
      // Define custom keyframes and animations for a dynamic UI
      keyframes: {
        'fade-in-down': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        'glow': {
          '0%, 100%': {
             boxShadow: '0 0 5px #4F46E5, 0 0 10px #4F46E5, 0 0 15px #4F46E5'
          },
          '50%': {
             boxShadow: '0 0 10px #6D28D9, 0 0 20px #6D28D9, 0 0 30px #6D28D9'
          }
        },
        'shimmer': {
          '0%': {
             backgroundPosition: '-1000px 0'
          },
          '100%': {
             backgroundPosition: '1000px 0'
          }
        }
      },
      animation: {
        'fade-in-down': 'fade-in-down 0.5s ease-out forwards',
        'glow': 'glow 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite linear',
      },
    },
  },
  plugins: [
    // This plugin provides better default styling for form elements.
    require('@tailwindcss/forms'),
  ],
}