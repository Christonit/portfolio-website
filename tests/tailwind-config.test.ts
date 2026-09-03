import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const jiti = require('jiti')(fileURLToPath(import.meta.url), {
  interopDefault: true,
})
const resolveConfig = require('tailwindcss/resolveConfig')
const config = jiti(path.resolve('tailwind.config.ts'))
const colors = resolveConfig(config).theme.colors

test('the Tailwind colour palette excludes undocumented defaults', () => {
  assert.equal(colors.red, undefined)
  assert.equal(colors.blue, undefined)
  assert.equal(colors.signal, 'rgb(var(--color-signal-rgb) / <alpha-value>)')
  assert.equal(colors.white, '#fff')
})
