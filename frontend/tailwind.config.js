/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'clarity-bg': '#f8fafc',
        'clarity-card': '#ffffff',
        'clarity-text': '#1e293b',
        'clarity-muted': '#64748b',
        'clarity-high': '#ef4444',
        'clarity-medium': '#f59e0b',
        'clarity-low': '#10b981',
        'clarity-done': '#cbd5e1'
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
