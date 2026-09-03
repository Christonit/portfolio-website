import type { Config, PluginAPI } from 'tailwindcss/types/config'
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

// The space scale, mirroring `--space-N` in globals.css: key N is N × 4px, so
// `p-3` and `var(--space-3)` are the same 12px. Ten steps, growing by
// alternating 1.5× / 1.33× so the scale doubles every two.
//
// Declared as a replacement for Tailwind's `spacing` (not an extension) for
// two reasons. Its fractional keys `0.5` / `1.5` / `2.5` / `3.5` land on
// 2/6/10/14px and break the 4pt grid outright. And its whole numbers, while
// on the grid, offer every multiple of it — 16, 20 and 24 all present means
// there is no answer to "which gap goes here", which is how 23 distinct
// spacing values accumulated. Dropping both here is what makes the scale
// enforceable: `p-5` and `p-1.5` stop compiling instead of quietly working.
//
// This governs `h-*`/`w-*` as well as padding and gaps. That is intended:
// component heights drifted the same way spacing did.
//
// `px` stays for genuine 1px hairlines, which are lines, not space.
const spacing = {
  0: '0px',
  px: '1px',
  ...Object.fromEntries(
    [1, 2, 3, 4, 6, 8, 12, 16, 24, 32].map((step) => [
      step,
      `var(--space-${step})`,
    ]),
  ),
} as const

// The documented palette, plus the CSS-wide and monochrome values templates
// use directly. Declared as a replacement so Tailwind's chromatic defaults do
// not remain available alongside the single signal accent.
const colors = {
  inherit: 'inherit',
  current: 'currentColor',
  transparent: 'transparent',
  black: '#000',
  white: '#fff',
  // Fills
  panel: 'rgb(var(--color-panel-rgb) / <alpha-value>)',
  canvas: 'rgb(var(--color-canvas-rgb) / <alpha-value>)',
  surface: 'rgb(var(--color-surface-rgb) / <alpha-value>)',
  // Lines
  rule: 'rgb(var(--color-rule-rgb) / <alpha-value>)',
  // Text
  muted: 'rgb(var(--color-muted-rgb) / <alpha-value>)',
  prose: 'rgb(var(--color-prose-rgb) / <alpha-value>)',
  body: 'rgb(var(--color-body-rgb) / <alpha-value>)',
  // Accent
  signal: 'rgb(var(--color-signal-rgb) / <alpha-value>)',
} as const

export default {
  darkMode: ['class'],
  content: [
    './components/**/*.{ts,tsx,vue}',
    './layouts/**/*.{ts,tsx,vue}',
    './pages/**/*.{ts,tsx,vue}',
    './app.vue',
    './error.vue',
  ],
  theme: {
    colors,
    spacing,
    // One radius: none. Declared as a replacement so the rest of Tailwind's
    // scale does not exist — see the note in the removed `extend` block.
    borderRadius: {
      DEFAULT: '0px',
      full: '9999px', // circular avatars and dots; nothing else
    },
    // Six sizes site-wide. `fontSize` replaces (rather than extends)
    // Tailwind's default scale so `text-md`/`text-xl`/`text-2xl` etc.
    // simply don't exist — the scale can't drift back open.
    fontSize: {
      '2xs': ['var(--text-2xs)', { lineHeight: '1.2' }], //  10px — micro labels
      xs: ['var(--text-xs)', { lineHeight: '1.35' }], //     12px — labels, meta
      sm: ['var(--text-sm)', { lineHeight: '1.5' }], //      14px — compact body
      base: ['var(--text-base)', { lineHeight: '1.6' }], //  16px — reading copy
      lg: ['var(--text-lg)', { lineHeight: '1.15' }], //     20px — titles
      // No `display` step here. `typography.ts` already emits a `.text-display`
      // utility from the documented Display token, and a step by that name in
      // this scale does not compete with it — Tailwind merges both into a
      // single rule where the plugin's declarations, coming last, simply win.
      // The entry that used to sit here was dead weight that read like a
      // second source of truth. The one fluid hero size lives on
      // `--text-hero`, which `.identity-name` consumes directly.
    },
    // Two cuts only — the pair actually loaded from Google Fonts.
    fontWeight: {
      normal: '400',
      semibold: '600',
    },
    extend: {
      fontFamily: {
        // Tomorrow is the reading face; Departure Mono is the HUD voice
        // and is opted into with `font-mono`, never inherited. `sans` is
        // load-bearing beyond the `font-sans` utility — Tailwind's preflight
        // sets `html { font-family }` from it. There was a `display` key here
        // too, byte-identical to `sans` and never applied; the semantic
        // `.text-display` utility gets its family from `typographyFamilies`
        // above, not from this map.
        sans: ['Tomorrow', 'sans-serif'],
        mono: ['Departure Mono', 'ui-monospace', 'monospace'],
      },
      // The cross-component stacking order, defined in globals.css. Templates
      // reach for these instead of `z-50` / `z-[1000]` / `z-[9999]`, which is
      // how the header, the sheet and the tooltip ended up on three different
      // orders of magnitude with nothing stating how they related.
      zIndex: {
        nav: 'var(--z-nav)',
        'nav-mobile': 'var(--z-nav-mobile)',
        tooltip: 'var(--z-tooltip)',
      },
    },
  },
  plugins: [
    ({ addUtilities }: PluginAPI) => {
      addUtilities(semanticTypographyUtilities)
    },
  ],
} satisfies Config
