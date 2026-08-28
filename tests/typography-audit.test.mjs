import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import { auditTypography } from '../scripts/typography-audit.mjs'

async function withFixture(files, run) {
  const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), 'typography-audit-'))

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

test('allows compliant live Vue and CSS typography', async () => {
  await withFixture(
    {
      'app.vue': '<template><main class="text-label-data">Ready</main></template>\n',
      'assets/css/globals.css': '@font-face { font-family: "Departure Mono"; font-weight: 400; }\n.card { font-size: 12px; }\n',
      'components/Status.vue': '<template><p class="text-[12px]">Online</p></template>\n',
      'public/export.svg': '<text font-size="8">Excluded artwork</text>\n',
    },
    async (fixtureRoot) => {
      assert.deepEqual(await auditTypography(fixtureRoot), [])
    },
  )
})

test('reports sub-12 pixel sizes with their file and line', async () => {
  await withFixture(
    {
      'components/Metric.vue': '<template>\n  <span class="text-[11px]">11</span>\n</template>\n',
      'assets/css/globals.css': '.tiny {\n  font-size: 10px;\n}\n',
    },
    async (fixtureRoot) => {
      assert.deepEqual(await auditTypography(fixtureRoot), [
        {
          file: 'assets/css/globals.css',
          line: 2,
          message: 'font-size 10px is below the 12px minimum',
        },
        {
          file: 'components/Metric.vue',
          line: 2,
          message: 'Tailwind text-[11px] is below the 12px minimum',
        },
      ])
    },
  )
})

test('reports stale font families with their file and line', async () => {
  await withFixture(
    {
      'pages/index.vue': '<template><p class="font-[Inter]">Hello</p></template>\n',
      'assets/css/globals.css': '.terminal {\n  font-family: Menlo, monospace;\n}\n',
    },
    async (fixtureRoot) => {
      assert.deepEqual(await auditTypography(fixtureRoot), [
        {
          file: 'assets/css/globals.css',
          line: 2,
          message: 'bare font-family: monospace is not allowed',
        },
        {
          file: 'assets/css/globals.css',
          line: 2,
          message: 'stale font family "Menlo" is not allowed',
        },
        {
          file: 'pages/index.vue',
          line: 1,
          message: 'stale font family "Inter" is not allowed',
        },
      ])
    },
  )
})
