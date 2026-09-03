import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

/**
 * Guards the two scales that a component can silently step outside of: the
 * colour ramp and the space scale.
 *
 * The type scale does not need this — `tailwind.config.ts` replaces Tailwind's
 * `fontSize` and `spacing` maps, so an off-scale *utility* (`p-1.5`,
 * `text-2xl`) fails to compile and is caught the moment you look at the page.
 * What still compiles fine is a raw value inside a <style> block:
 * `padding: 11px` and `color: #2a2a2a` are perfectly valid CSS, and they are
 * how twelve undocumented greys and twenty-three spacing values accumulated
 * in the first place. This is the check for those.
 */

const LIVE_ROOTS = ['layouts', 'pages', 'components', 'assets/css']
const SOURCE_EXTENSIONS = new Set(['.css', '.vue'])

const SPACING_PROPERTIES =
  '(?:padding|margin|gap|row-gap|column-gap)(?:-(?:top|right|bottom|left|inline|block))?'

/**
 * N x 4px, mirroring `--space-N` in globals.css. Ten steps, not every multiple
 * of four: the scale doubles every two steps (4 8 12 16 24 32 48 64 96 128).
 * A value that lands on the 4pt grid but not on a step — 20px, 28px, 40px —
 * is still a violation, because "on the grid" was never the hard part.
 */
const SPACE_STEPS = new Set([1, 2, 3, 4, 6, 8, 12, 16, 24, 32])

function lineAt(source, index) {
  return source.slice(0, index).split('\n').length
}

/**
 * Comment prose explains the values that were consolidated away, so it names
 * greys on purpose. Blank it out rather than teaching the patterns to ignore
 * `#2a2a2a` — the point is that a *declaration* may not contain one.
 */
function withoutComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ' '))
}

/** Only look inside <style> blocks of an SFC; a .css file is all style. */
function styleRegions(source, relativePath) {
  if (path.extname(relativePath) === '.css') return [{ text: source, offset: 0 }]

  const regions = []
  for (const match of source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
    regions.push({ text: match[1], offset: match.index + match[0].indexOf(match[1]) })
  }
  return regions
}

export function auditSource(source, relativePath) {
  const violations = []
  const masked = withoutComments(source)
  const add = (index, message) =>
    violations.push({ file: relativePath, line: lineAt(source, index), message })

  for (const { text, offset } of styleRegions(masked, relativePath)) {
    // 1. Colour must come from the ramp.
    for (const match of text.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
      add(offset + match.index, `raw colour ${match[0]} — use a --color-* token`)
    }

    // 2. Spacing must land on a step of the scale.
    for (const declaration of text.matchAll(
      new RegExp(`\\b(${SPACING_PROPERTIES})\\s*:\\s*([^;{}]+);`, 'g'),
    )) {
      const [, property, value] = declaration
      // Corrective arithmetic answers to the thing it corrects, not the grid.
      if (/(?:^|[\s:(])-\s*[0-9.]/.test(value)) continue

      for (const length of value.matchAll(/([0-9.]+)(px|rem)\b/g)) {
        const pixels = Number(length[1]) * (length[2] === 'rem' ? 16 : 1)
        if (pixels === 0) continue
        const step = pixels / 4
        const onGrid = Number.isInteger(step) && SPACE_STEPS.has(step)
        add(
          offset + declaration.index,
          onGrid
            ? `${property} ${length[1]}${length[2]} is on the grid but hardcoded — use var(--space-${step})`
            : `${property} ${length[1]}${length[2]} (${pixels}px) is not a step on the space scale`,
        )
      }
    }
  }

  return violations
}

async function sourceFiles(root) {
  const files = []

  async function visit(relativePath) {
    let entries
    try {
      entries = await readdir(path.join(root, relativePath), { withFileTypes: true })
    } catch (error) {
      if (error.code === 'ENOENT') return
      throw error
    }

    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      const childPath = path.join(relativePath, entry.name)
      if (entry.isDirectory()) await visit(childPath)
      else if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) files.push(childPath)
    }
  }

  for (const directory of LIVE_ROOTS) await visit(directory)
  return files.sort((a, b) => a.localeCompare(b))
}

export async function auditDesignTokens(root = process.cwd()) {
  const violations = []

  for (const relativePath of await sourceFiles(root)) {
    const source = await readFile(path.join(root, relativePath), 'utf8')
    violations.push(...auditSource(source, relativePath))
  }

  return violations.sort(
    (left, right) =>
      left.file.localeCompare(right.file) ||
      left.line - right.line ||
      left.message.localeCompare(right.message),
  )
}

async function runCli() {
  const root = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd()
  const violations = await auditDesignTokens(root)

  if (violations.length === 0) {
    console.log('Design token audit passed.')
    return
  }

  for (const violation of violations) {
    console.error(`${violation.file}:${violation.line} ${violation.message}`)
  }
  process.exitCode = 1
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
