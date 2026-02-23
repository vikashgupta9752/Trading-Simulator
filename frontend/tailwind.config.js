/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'groww-primary': '#3B82F6', // Neon Blue
        'groww-green': '#22D3EE',   // Neon Cyan (Up/Buy)
        'groww-red': '#F472B6',     // Neon Pink (Down/Sell)
        'groww-blue': '#6366F1',    // Indigo
        'groww-dark': '#F8FAFC',    // White (Text)
        'groww-gray': '#94A3B8',    // Slate 400
        'groww-light': '#0F1020',   // Deep Indigo Background
        'groww-card': '#1A1B2E',    // Dark Card Background
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
