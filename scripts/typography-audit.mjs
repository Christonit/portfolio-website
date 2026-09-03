import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const LIVE_ROOTS = ['layouts', 'pages', 'components', 'assets/css']
const SOURCE_EXTENSIONS = new Set(['.css', '.cjs', '.js', '.jsx', '.mjs', '.ts', '.tsx', '.vue'])
const STALE_FONT_FAMILIES = ['Menlo', 'Inter', 'Cuisine', 'ui-monospace']
const MIN_FONT_SIZE_PX = 12
const ROOT_FONT_SIZE_PX = 16
/* The one documented tier below the 12px floor: Departure Mono micro-labels
   and tags, where the mono face and wide tracking carry legibility that size
   alone would not. Everything else answers to MIN_FONT_SIZE_PX, and nothing
   at all may go under ABSOLUTE_MIN_FONT_SIZE_PX.

   This exists because the floor used to be unenforceable in practice: the
   checks below only ever saw literal lengths, so `font-size: var(--text-2xs)`
   — and any future `--text-tiny: 8px` — walked straight past a guard whose
   whole job was to stop exactly that. */
const SUB_FLOOR_TYPE_TOKENS = new Set(['--text-2xs'])
const ABSOLUTE_MIN_FONT_SIZE_PX = 10
const ARTWORK_UTILITY_NAMES = new Set([
  'svg',
  'raster',
  'canvas',
  'export-artwork',
  'svg-artwork',
  'raster-artwork',
  'canvas-artwork',
  'exportartwork',
  'svgartwork',
  'rasterartwork',
  'canvasartwork',
])
const FONT_CONTEXT_PATTERNS = [
  /font-family\s*:[^;}\n]*/gi,
  /\bfontFamily\b\s*:[^,}\n]*/gi,
  /\bfont\s*:[^;}\n]*/gi,
  /\.font\s*=\s*(['"`])[^\n]*?\1/gi,
  /font-\[[^\]\n]+\]/gi,
]

function lineAt(source, index) {
  return source.slice(0, index).split('\n').length
}

function toPixels(value, unit) {
  return Number(value) * (unit.toLowerCase() === 'rem' ? ROOT_FONT_SIZE_PX : 1)
}

function sizeMessage(label, value, unit) {
  const normalizedUnit = unit.toLowerCase()
  const size = `${value}${normalizedUnit}`
  const computedPixels = toPixels(value, normalizedUnit)
  const computation = normalizedUnit === 'rem' ? ` computes to ${computedPixels}px,` : ' is'
  return `${label} ${size}${computation} below the 12px minimum`
}

/** Collect `--text-*: <length>` declarations so var() references resolve. */
function collectTypeTokens(source, relativePath, tokens) {
  for (const match of source.matchAll(/(--text-[a-z0-9-]+)\s*:\s*([^;}\n]+)/gi)) {
    const [, token, rawValue] = match
    const size = rawValue.trim().match(/^(\d*\.?\d+)(px|rem)$/i)
    // Fluid values (clamp/calc) have no single size to check — skipped by design.
    if (!size) continue
    tokens.set(token.toLowerCase(), {
      pixels: toPixels(size[1], size[2]),
      value: `${size[1]}${size[2].toLowerCase()}`,
      file: relativePath,
      line: lineAt(source, match.index),
    })
  }
}

function auditTypeTokens(tokens) {
  const violations = []

  for (const [token, { pixels, value, file, line }] of tokens) {
    const allowed = SUB_FLOOR_TYPE_TOKENS.has(token)
    if (pixels < ABSOLUTE_MIN_FONT_SIZE_PX) {
      violations.push({
        file,
        line,
        message: `type token ${token} ${value} is below the ${ABSOLUTE_MIN_FONT_SIZE_PX}px absolute minimum`,
      })
    } else if (pixels < MIN_FONT_SIZE_PX && !allowed) {
      violations.push({
        file,
        line,
        message: `type token ${token} ${value} is below the ${MIN_FONT_SIZE_PX}px minimum and is not a documented micro-label token`,
      })
    }
  }

  return violations
}

function isExcludedArtwork(relativePath) {
  return relativePath
    .toLowerCase()
    .split('/')
    .some((segment) => ARTWORK_UTILITY_NAMES.has(segment.replace(/\.(?:css|cjs|js|jsx|mjs|ts|tsx|vue|svg|png|jpe?g|webp|gif)$/i, '')))
}

async function sourceFiles(root) {
  const files = []

  async function visit(relativePath) {
    const absolutePath = path.join(root, relativePath)
    let entries

    try {
      entries = await readdir(absolutePath, { withFileTypes: true })
    } catch (error) {
      if (error.code === 'ENOENT') return
      throw error
    }

    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      const childPath = path.join(relativePath, entry.name)
      if (entry.isDirectory()) {
        await visit(childPath)
      } else if (SOURCE_EXTENSIONS.has(path.extname(entry.name)) && !isExcludedArtwork(childPath)) {
        files.push(childPath)
      }
    }
  }

  try {
    await readFile(path.join(root, 'app.vue'))
    files.push('app.vue')
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }

  for (const directory of LIVE_ROOTS) await visit(directory)
  return files.sort((a, b) => a.localeCompare(b))
}

function auditSource(source, relativePath, tokens = new Map()) {
  const violations = []
  const add = (index, message) => violations.push({ file: relativePath, line: lineAt(source, index), message })

  // `font-size: var(--text-…)` / `fontSize: 'var(--text-…)'`. A reference to
  // the documented sub-floor token is fine; a reference to anything else that
  // resolves under the floor is the same violation as writing the number.
  for (const match of source.matchAll(/(?:font-size\s*:|\bfontSize\b\s*:)\s*['"`]?\s*var\(\s*(--text-[a-z0-9-]+)/gi)) {
    const token = match[1].toLowerCase()
    const resolved = tokens.get(token)
    if (!resolved || SUB_FLOOR_TYPE_TOKENS.has(token)) continue
    if (resolved.pixels < MIN_FONT_SIZE_PX) {
      add(match.index, `font-size var(${token}) resolves to ${resolved.value}, below the ${MIN_FONT_SIZE_PX}px minimum`)
    }
  }

  for (const match of source.matchAll(/font-size\s*:\s*(\d*\.?\d+)(px|rem)\b/gi)) {
    if (toPixels(match[1], match[2]) < MIN_FONT_SIZE_PX) {
      add(match.index, sizeMessage('font-size', match[1], match[2]))
    }
  }

  for (const match of source.matchAll(/\bfontSize\b\s*:\s*(['"`])\s*(\d*\.?\d+)(px|rem)\b/gi)) {
    if (toPixels(match[2], match[3]) < MIN_FONT_SIZE_PX) {
      add(match.index, sizeMessage('fontSize', match[2], match[3]))
    }
  }

  for (const declaration of source.matchAll(/\bfont\s*:\s*([^;}\n]*)/gi)) {
    const size = declaration[1].match(/(?:^|\s)(\d*\.?\d+)(px|rem)(?=\s|\/|$)/i)
    if (size && toPixels(size[1], size[2]) < MIN_FONT_SIZE_PX) {
      add(declaration.index, sizeMessage('font shorthand size', size[1], size[2]))
    }
  }

  for (const match of source.matchAll(/text-\[\s*(?:(length)\s*:\s*)?(\d+(?:\.\d+)?)(px|rem)\s*\]/gi)) {
    const computedPixels = Number(match[2]) * (match[3].toLowerCase() === 'rem' ? ROOT_FONT_SIZE_PX : 1)
    if (computedPixels < MIN_FONT_SIZE_PX) {
      const value = `${match[1] ? 'length:' : ''}${match[2]}${match[3].toLowerCase()}`
      const computation = match[3].toLowerCase() === 'rem' ? ` computes to ${computedPixels}px,` : ' is'
      add(match.index, `Tailwind text-[${value}]${computation} below the 12px minimum`)
    }
  }

  for (const match of source.matchAll(/font-\[\s*(?:family\s*:\s*)?['"]?monospace['"]?\s*\]/gi)) {
    add(match.index, 'arbitrary font family "monospace" is not allowed')
  }

  for (const pattern of FONT_CONTEXT_PATTERNS) {
    for (const context of source.matchAll(pattern)) {
      for (const family of STALE_FONT_FAMILIES) {
        const expression = new RegExp(`\\b${family}\\b`, 'i')
        const familyIndex = context[0].search(expression)
        if (familyIndex !== -1) {
          add(context.index + familyIndex, `stale font family "${family}" is not allowed`)
        }
      }
    }
  }

  for (const match of source.matchAll(/font-family\s*:[^;}]*\bmonospace\b/gi)) {
    add(match.index, 'bare font-family: monospace is not allowed')
  }

  return violations.sort((left, right) => left.file.localeCompare(right.file) || left.line - right.line || left.message.localeCompare(right.message))
}

export async function auditTypography(root = process.cwd()) {
  const violations = []
  const sources = []
  const tokens = new Map()

  // Two passes: the type tokens have to be known before a var() reference to
  // one of them can be judged.
  for (const relativePath of await sourceFiles(root)) {
    const source = await readFile(path.join(root, relativePath), 'utf8')
    sources.push([relativePath, source])
    collectTypeTokens(source, relativePath, tokens)
  }

  violations.push(...auditTypeTokens(tokens))

  for (const [relativePath, source] of sources) {
    violations.push(...auditSource(source, relativePath, tokens))
  }

  return violations.sort((left, right) => left.file.localeCompare(right.file) || left.line - right.line || left.message.localeCompare(right.message))
}

async function runCli() {
  const root = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd()
  const violations = await auditTypography(root)

  if (violations.length === 0) {
    console.log('Typography audit passed.')
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
