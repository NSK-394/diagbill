/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    'bg-blue-100', 'text-blue-700', 'bg-blue-600',
    'bg-teal-100', 'text-teal-700', 'bg-teal-600',
    'bg-purple-100', 'text-purple-700', 'bg-purple-600',
    'bg-orange-100', 'text-orange-700', 'bg-orange-600',
    'bg-green-100', 'text-green-700',
    'bg-red-100', 'text-red-700',
    'bg-yellow-100', 'text-yellow-700',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
        },
        teal: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
        },
        surface: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

