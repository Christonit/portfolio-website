import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import { auditDesignTokens } from '../scripts/design-tokens-audit.mjs'

type Violation = { file: string; line: number; message: string }

async function withFixture(
  files: Record<string, string>,
  run: (root: string) => Promise<void>,
) {
  const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), 'design-tokens-'))

  try {
    await Promise.all(
      Object.entries(files).map(async ([relativePath, contents]) => {
        const destination = path.join(fixtureRoot, relativePath)
        await mkdir(path.dirname(destination), { recursive: true })
        await writeFile(destination, contents)
      }),
    )
    await run(fixtureRoot)
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true })
  }
}

const style = (css: string) => `<template><p /></template>\n<style>\n${css}\n</style>\n`

test('accepts spacing and colour that come from the tokens', async () => {
  await withFixture(
    {
      'components/Panel.vue': style(
        '.panel {\n  padding: var(--space-4);\n  gap: var(--space-2);\n  color: var(--color-prose);\n}',
      ),
    },
    async (root) => {
      assert.deepEqual(await auditDesignTokens(root), [])
    },
  )
})

test('reports raw colour literals in component styles', async () => {
  await withFixture(
    { 'components/Card.vue': style('.card {\n  border-color: #2a2a2a;\n}') },
    async (root) => {
      assert.deepEqual(await auditDesignTokens(root), [
        {
          file: 'components/Card.vue',
          line: 4,
          message: 'raw colour #2a2a2a — use a --color-* token',
        },
      ])
    },
  )
})

test('reports spacing that falls off the 4pt grid', async () => {
  await withFixture(
    { 'components/Row.vue': style('.row {\n  padding: 11px;\n  gap: 0.65rem;\n}') },
    async (root) => {
      assert.deepEqual(await auditDesignTokens(root), [
        {
          file: 'components/Row.vue',
          line: 4,
          message: 'padding 11px (11px) is not a step on the space scale',
        },
        {
          file: 'components/Row.vue',
          line: 5,
          message: 'gap 0.65rem (10.4px) is not a step on the space scale',
        },
      ])
    },
  )
})

test('reports 4pt-aligned spacing that is not a step on the scale', async () => {
  await withFixture(
    // 20px and 40px are multiples of 4 and used to be `--space-5` / `--space-10`.
    // The scale doubles every two steps, so neither is a step any more, and
    // "lands on the grid" is no longer a defence.
    { 'components/Row.vue': style('.row {\n  padding: 20px;\n  gap: 40px;\n}') },
    async (root) => {
      assert.deepEqual(await auditDesignTokens(root), [
        {
          file: 'components/Row.vue',
          line: 4,
          message: 'padding 20px (20px) is not a step on the space scale',
        },
        {
          file: 'components/Row.vue',
          line: 5,
          message: 'gap 40px (40px) is not a step on the space scale',
        },
      ])
    },
  )
})

test('reports on-scale spacing that is hardcoded rather than tokenised', async () => {
  await withFixture(
    { 'components/Row.vue': style('.row {\n  gap: 12px;\n}') },
    async (root) => {
      assert.deepEqual(await auditDesignTokens(root), [
        {
          file: 'components/Row.vue',
          line: 4,
          message: 'gap 12px is on the grid but hardcoded — use var(--space-3)',
        },
      ])
    },
  )
})

test('allows zero and negative corrective offsets', async () => {
  await withFixture(
    {
      // The negative pair cancels a known 1px edge on the source image; it
      // answers to that edge, not to the rhythm.
      'components/Bleed.vue': style(
        '.bleed {\n  padding: 0;\n  margin-inline: -2px;\n  margin-block: -2px;\n}',
      ),
    },
    async (root) => {
      assert.deepEqual(await auditDesignTokens(root), [])
    },
  )
})

test('ignores values named inside comment prose', async () => {
  await withFixture(
    {
      'components/Note.vue': style(
        '/* #2a2a2a and padding: 11px were consolidated away. */\n.note {\n  gap: var(--space-2);\n}',
      ),
    },
    async (root) => {
      assert.deepEqual(await auditDesignTokens(root), [])
    },
  )
})

test('ignores markup outside style blocks', async () => {
  await withFixture(
    {
      // Tailwind utilities are policed by the config replacing the scale, not
      // by this script — an off-scale class fails to compile instead.
      'components/Tag.vue':
        '<template><span class="p-3 text-muted">#2a2a2a</span></template>\n',
    },
    async (root) => {
      assert.deepEqual(await auditDesignTokens(root), [])
    },
  )
})

test('scans plain stylesheets end to end', async () => {
  await withFixture(
    { 'assets/css/globals.css': '.a {\n  padding: 18px;\n}\n' },
    async (root) => {
      const violations = (await auditDesignTokens(root)) as Violation[]
      assert.equal(violations.length, 1)
      assert.equal(violations[0].file, 'assets/css/globals.css')
      assert.match(violations[0].message, /not a step on the space scale/)
    },
  )
})

test('accepts the one keyword in the ramp and the non-colour keywords', async () => {
  await withFixture(
    {
      // `white` is the top of the text ramp — it replaced a `--color-ink`
      // token whose entire content was "#ffffff". `transparent` and
      // `currentColor` are not colours in this sense.
      'components/Head.vue': style(
        '.a {\n  color: white;\n  border: 1px solid white;\n  background: transparent;\n  outline-color: currentColor;\n}',
      ),
    },
    async (root) => {
      assert.deepEqual(await auditDesignTokens(root), [])
    },
  )
})

test('reports named colours other than white', async () => {
  await withFixture(
    { 'components/Bad.vue': style('.a {\n  color: red;\n}\n.b {\n  background-color: black;\n}') },
    async (root) => {
      assert.deepEqual(await auditDesignTokens(root), [
        {
          file: 'components/Bad.vue',
          line: 4,
          message: 'named colour `red` — use a --color-* token (only `white` is in the ramp)',
        },
        {
          file: 'components/Bad.vue',
          line: 7,
          message: 'named colour `black` — use a --color-* token (only `white` is in the ramp)',
        },
      ])
    },
  )
})

test('does not mistake shorthand or timing keywords for colours', async () => {
  await withFixture(
    {
      // `solid` sits in a border shorthand; `ease-out` is on a property this
      // check does not look at. Neither is a colour.
      'components/Fine.vue': style(
        '.a {\n  border: 1px solid var(--color-rule);\n  transition: color 150ms ease-out;\n  background: rgba(0, 0, 0, 0.5);\n}',
      ),
    },
    async (root) => {
      assert.deepEqual(await auditDesignTokens(root), [])
    },
  )
})
