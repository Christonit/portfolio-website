import type { Config } from 'tailwindcss'
import { typography } from './utils/typography'

const typographyFamilies = {
  display: 'Tomorrow, sans-serif',
  sans: 'Tomorrow, sans-serif',
  mono: '"Departure Mono", monospace',
} as const

const semanticTypographyUtilities = Object.fromEntries(
  Object.entries(typography).map(([name, style]) => [
    `.text-${name}`,
    {
      fontFamily: typographyFamilies[style.familyRole],
      fontSize: style.size,
      fontWeight: String(style.weight),
      lineHeight: style.lineHeight,
    },
  ]),
)

export default {
  darkMode: ['class'],
  content: [
    './components/**/*.{ts,tsx,vue}',
    './layouts/**/*.{ts,tsx,vue}',
    './pages/**/*.{ts,tsx,vue}',
    './app.vue',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Tomorrow', 'sans-serif'],
        mono: ['Departure Mono', 'monospace'],
        display: ['Tomorrow', 'sans-serif'],
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
  plugins: [
    ({ addUtilities }) => {
      addUtilities(semanticTypographyUtilities)
    },
  ],
} satisfies Config
