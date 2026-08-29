import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: [
    './components/**/*.{ts,tsx,vue}',
    './layouts/**/*.{ts,tsx,vue}',
    './pages/**/*.{ts,tsx,vue}',
    './app.vue',
  ],
  theme: {
    // Six sizes site-wide. `fontSize` replaces (rather than extends)
    // Tailwind's default scale so `text-md`/`text-xl`/`text-2xl` etc.
    // simply don't exist — the scale can't drift back open.
    fontSize: {
      '2xs': ['var(--text-2xs)', { lineHeight: '1.2' }], //  10px — micro labels
      xs: ['var(--text-xs)', { lineHeight: '1.35' }], //     12px — labels, meta
      sm: ['var(--text-sm)', { lineHeight: '1.5' }], //      14px — compact body
      base: ['var(--text-base)', { lineHeight: '1.6' }], //  16px — reading copy
      lg: ['var(--text-lg)', { lineHeight: '1.15' }], //     20px — titles
      display: ['var(--text-display)', { lineHeight: '0.92' }], // page hero
    },
    // Two cuts only — the pair actually loaded from Google Fonts.
    fontWeight: {
      normal: '400',
      semibold: '600',
    },
    extend: {
      fontFamily: {
        // Tomorrow is the reading face; Departure Mono is the HUD voice
        // and is opted into with `font-mono`, never inherited.
        sans: ['Tomorrow', 'sans-serif'],
        display: ['Tomorrow', 'sans-serif'],
        mono: ['Departure Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
      },
      borderRadius: {
        none: '0px',
        DEFAULT: '0px',
        sm: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        '2xl': '0px',
        full: '9999px',
      },
    },
  },
  plugins: [],
} satisfies Config
