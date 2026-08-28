import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const LIVE_ROOTS = ['layouts', 'pages', 'components', 'assets/css']
const SOURCE_EXTENSIONS = new Set(['.css', '.cjs', '.js', '.jsx', '.mjs', '.ts', '.tsx', '.vue'])
const STALE_FONT_FAMILIES = ['Menlo', 'Inter', 'Cuisine', 'ui-monospace']
const MIN_FONT_SIZE_PX = 12
const ROOT_FONT_SIZE_PX = 16
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

function lineAt(source, index) {
  return source.slice(0, index).split('\n').length
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

function auditSource(source, relativePath) {
  const violations = []
  const add = (index, message) => violations.push({ file: relativePath, line: lineAt(source, index), message })

  for (const match of source.matchAll(/font-size\s*:\s*(\d+(?:\.\d+)?)px\b/gi)) {
    if (Number(match[1]) < MIN_FONT_SIZE_PX) add(match.index, `font-size ${match[1]}px is below the 12px minimum`)
  }

  for (const match of source.matchAll(/\bfontSize\b\s*:\s*(['"`])\s*(\d+(?:\.\d+)?)px\b/gi)) {
    if (Number(match[2]) < MIN_FONT_SIZE_PX) add(match.index, `fontSize ${match[2]}px is below the 12px minimum`)
  }

  for (const declaration of source.matchAll(/\bfont\s*:\s*([^;}\n]*)/gi)) {
    const size = declaration[1].match(/(?:^|\s)(\d+(?:\.\d+)?)px(?=\s|\/|$)/i)
    if (size && Number(size[1]) < MIN_FONT_SIZE_PX) {
      add(declaration.index, `font shorthand size ${size[1]}px is below the 12px minimum`)
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

  for (const family of STALE_FONT_FAMILIES) {
    const expression = new RegExp(`\\b${family}\\b`, 'gi')
    for (const match of source.matchAll(expression)) {
      add(match.index, `stale font family "${family}" is not allowed`)
    }
  }

  for (const match of source.matchAll(/font-family\s*:[^;}]*\bmonospace\b/gi)) {
    add(match.index, 'bare font-family: monospace is not allowed')
  }

  return violations.sort((left, right) => left.file.localeCompare(right.file) || left.line - right.line || left.message.localeCompare(right.message))
}

export async function auditTypography(root = process.cwd()) {
  const violations = []

  for (const relativePath of await sourceFiles(root)) {
    const source = await readFile(path.join(root, relativePath), 'utf8')
    violations.push(...auditSource(source, relativePath))
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
