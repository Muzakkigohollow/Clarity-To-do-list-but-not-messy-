/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core surfaces
        'clarity-bg':      '#0f0f11',
        'clarity-surface': '#18181b',
        'clarity-card':    '#1c1c1f',
        'clarity-border':  '#2a2a2f',
        'clarity-hover':   '#222227',

        // Text scale
        'clarity-text':    '#f4f4f5',
        'clarity-subtext': '#a1a1aa',
        'clarity-muted':   '#52525b',

        // Accent — violet
        'clarity-accent':  '#7c3aed',
        'clarity-accent-light': '#8b5cf6',
        'clarity-accent-glow': 'rgba(124, 58, 237, 0.25)',

        // Priority semantic colors
        'clarity-high':   '#ef4444',
        'clarity-medium': '#f59e0b',
        'clarity-low':    '#22c55e',
        'clarity-done':   '#3f3f46',

        // Status
        'clarity-success': '#22c55e',
        'clarity-error':   '#ef4444',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'xs':   ['11px', { lineHeight: '1.5', letterSpacing: '0.04em' }],
        'sm':   ['13px', { lineHeight: '1.5' }],
        'base': ['15px', { lineHeight: '1.6' }],
        'lg':   ['17px', { lineHeight: '1.5' }],
        'xl':   ['20px', { lineHeight: '1.4' }],
        '2xl':  ['24px', { lineHeight: '1.3' }],
        '3xl':  ['30px', { lineHeight: '1.2' }],
        '4xl':  ['36px', { lineHeight: '1.1' }],
      },
      boxShadow: {
        'card':   '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        'card-lg':'0 4px 16px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)',
        'glow':   '0 0 20px rgba(124, 58, 237, 0.3)',
        'glow-sm':'0 0 8px rgba(124, 58, 237, 0.25)',
      },
      borderRadius: {
        'xl':  '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      keyframes: {
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%':   { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'check-pop': {
          '0%':   { transform: 'scale(0)' },
          '70%':  { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'shimmer':   'shimmer 2s linear infinite',
        'fade-in':   'fade-in 0.25s ease-out forwards',
        'slide-in':  'slide-in 0.2s ease-out forwards',
        'scale-in':  'scale-in 0.2s ease-out forwards',
        'check-pop': 'check-pop 0.2s ease-out forwards',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
    },
  },
  plugins: [],
}
