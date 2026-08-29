import assert from 'node:assert/strict'
import { execFile as execFileCallback } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import test from 'node:test'

const execFile = promisify(execFileCallback)

test('text-label-data applies the Departure Mono family contract', async () => {
  const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), 'typography-tailwind-'))
  const inputPath = path.join(fixtureRoot, 'input.css')
  const contentPath = path.join(fixtureRoot, 'fixture.vue')
  const outputPath = path.join(fixtureRoot, 'output.css')
  const configPath = path.join(process.cwd(), 'tailwind.config.ts')
  const cliPath = path.join(process.cwd(), 'node_modules', 'tailwindcss', 'lib', 'cli.js')

  try {
    await writeFile(inputPath, '@tailwind utilities;\n')
    await writeFile(contentPath, '<template><span class="text-label-data">Status</span></template>\n')
    await execFile(process.execPath, [cliPath, '-c', configPath, '-i', inputPath, '-o', outputPath, '--content', contentPath])

    const css = await readFile(outputPath, 'utf8')
    const rules = css.match(/\.text-label-data\s*\{[^}]*\}/g) ?? []

    assert.ok(
      rules.some((rule) => /font-family:\s*(?:"Departure Mono"|Departure Mono),\s*monospace/.test(rule)),
      'text-label-data must include the Departure Mono font family',
    )
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true })
  }
})

test('text-label-ui keeps navigation labels in Tomorrow', async () => {
  const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), 'typography-tailwind-'))
  const inputPath = path.join(fixtureRoot, 'input.css')
  const contentPath = path.join(fixtureRoot, 'fixture.vue')
  const outputPath = path.join(fixtureRoot, 'output.css')
  const configPath = path.join(process.cwd(), 'tailwind.config.ts')
  const cliPath = path.join(process.cwd(), 'node_modules', 'tailwindcss', 'lib', 'cli.js')

  try {
    await writeFile(inputPath, '@tailwind utilities;\n')
    await writeFile(contentPath, '<template><span class="text-label-ui">About</span></template>\n')
    await execFile(process.execPath, [cliPath, '-c', configPath, '-i', inputPath, '-o', outputPath, '--content', contentPath])

    const css = await readFile(outputPath, 'utf8')
    const rules = css.match(/\.text-label-ui\s*\{[^}]*\}/g) ?? []

    assert.ok(
      rules.some((rule) => /font-family:\s*Tomorrow,\s*sans-serif/.test(rule)),
      'text-label-ui must stay on the Tomorrow family, not the mono HUD face',
    )
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true })
  }
})
