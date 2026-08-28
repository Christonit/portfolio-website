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
      'assets/css/globals.css': '@font-face { font-family: "Departure Mono"; font-weight: 400; }\n.card { font-size: 12px; font: 12px/1 Tomorrow, sans-serif; }\n',
      'components/Status.js': 'export const style = { fontSize: "12px" }\n',
      'components/Status.vue': '<template><p class="text-[12px] text-[0.75rem] font-mono">Online</p></template>\n',
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

test('reports typed arbitrary Tailwind sizes below 12px with their file and line', async () => {
  await withFixture(
    {
      'components/Metric.vue': '<template>\n  <span class="text-[length:11px]">11</span>\n</template>\n',
    },
    async (fixtureRoot) => {
      assert.deepEqual(await auditTypography(fixtureRoot), [
        {
          file: 'components/Metric.vue',
          line: 2,
          message: 'Tailwind text-[length:11px] is below the 12px minimum',
        },
      ])
    },
  )
})

test('reports sub-12 sizes in JavaScript styles, CSS font shorthands, and rem utilities', async () => {
  await withFixture(
    {
      'components/InlineMetric.js': 'export const style = {\n  fontSize: "10px",\n}\n',
      'components/Metric.vue': '<template>\n  <span class="text-[0.625rem]">10</span>\n</template>\n',
      'assets/css/globals.css': '.tiny {\n  font: 10px/1 Tomorrow, sans-serif;\n}\n',
    },
    async (fixtureRoot) => {
      assert.deepEqual(await auditTypography(fixtureRoot), [
        {
          file: 'assets/css/globals.css',
          line: 2,
          message: 'font shorthand size 10px is below the 12px minimum',
        },
        {
          file: 'components/InlineMetric.js',
          line: 2,
          message: 'fontSize 10px is below the 12px minimum',
        },
        {
          file: 'components/Metric.vue',
          line: 2,
          message: 'Tailwind text-[0.625rem] computes to 10px, below the 12px minimum',
        },
      ])
    },
  )
})

test('reports arbitrary monospace font-family utilities with their file and line', async () => {
  await withFixture(
    {
      'pages/index.vue': '<template>\n  <code class="font-[monospace]">status</code>\n</template>\n',
    },
    async (fixtureRoot) => {
      assert.deepEqual(await auditTypography(fixtureRoot), [
        {
          file: 'pages/index.vue',
          line: 2,
          message: 'arbitrary font family "monospace" is not allowed',
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

test('reports monospace declarations inside font-face rules', async () => {
  await withFixture(
    {
      'assets/css/globals.css': '@font-face {\n  font-family: monospace;\n}\n',
    },
    async (fixtureRoot) => {
      assert.deepEqual(await auditTypography(fixtureRoot), [
        {
          file: 'assets/css/globals.css',
          line: 2,
          message: 'bare font-family: monospace is not allowed',
        },
      ])
    },
  )
})

test('excludes artwork utilities while retaining in-scope OG views', async () => {
  await withFixture(
    {
      'components/SvgArtwork.vue': '<template><span class="text-[8px]">excluded</span></template>\n',
      'components/RasterArtwork.vue': '<template><span class="text-[8px]">excluded</span></template>\n',
      'components/CanvasArtwork.vue': '<template><span class="text-[8px]">excluded</span></template>\n',
      'components/CanvasArtwork.js': 'export const labelStyle = { fontSize: "8px" }\n',
      'components/ExportArtwork.vue': '<template><span class="text-[8px]">excluded</span></template>\n',
      'components/preview.svg': '<svg><text font-size="8">excluded</text></svg>\n',
      'components/preview.png': 'excluded raster artifact\n',
      'components/OgImageExporter.vue': '<template>\n  <span class="text-[10px]">scanned</span>\n</template>\n',
      'pages/og-export.vue': '<style>\n.card { font-size: 11px; }\n</style>\n',
    },
    async (fixtureRoot) => {
      assert.deepEqual(await auditTypography(fixtureRoot), [
        {
          file: 'components/OgImageExporter.vue',
          line: 2,
          message: 'Tailwind text-[10px] is below the 12px minimum',
        },
        {
          file: 'pages/og-export.vue',
          line: 2,
          message: 'font-size 11px is below the 12px minimum',
        },
      ])
    },
  )
})
