import type { Config } from 'tailwindcss'

const config = {
  darkMode: ['class'],
  content: ['./pages/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-montserrat)'],
        mono: ['var(--font-big-shoulders-display)'],
      },
      colors: {
        border: 'var(--border)',
        'border-s': 'var(--border-s)',
        'border-t': 'var(--border-t)',
        input: 'var(--input)',
        ring: 'hsl(var(--ring))',
        background: 'var(--bg-secondary)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--background)',
          foreground: 'var(--text-primary)',
        },
        secondary: {
          DEFAULT: 'var(--bg-secondary)',
          foreground: 'var(--text-secondary)',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'var(--bg-quaternary)',
          foreground: 'var(--text-quaternary)',
        },
        accent: {
          DEFAULT: 'var(--bg-tertiary)',
          foreground: 'var(--text-tertiary)',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      gridTemplateColumns: {
        card: 'repeat(auto-fill, minmax(200px, 1fr))',
      },
      dropShadow: {
        custom: '2px 4px 5px #000',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config

export default config
