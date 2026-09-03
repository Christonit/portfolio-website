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

const COLOUR_PROPERTIES =
  '(?:color|background|background-color|border(?:-(?:top|right|bottom|left|block|inline))?(?:-color)?' +
  '|outline(?:-color)?|fill|stroke|box-shadow|text-shadow|text-decoration-color|caret-color' +
  '|column-rule-color|-webkit-text-fill-color)'

const ARBITRARY_SPACING_UTILITY =
  /(?<![\w-])(-?(?:m[trblxy]?|p[trblxy]?|gap(?:-[xy])?|space-[xy])-\[\s*(-?\d*\.?\d+)(px|rem)\s*\])/g

const ARBITRARY_COLOUR_UTILITY =
  /(?<![\w-])((?:bg|text|border(?:-[trblxyse])?|outline|ring|fill|stroke|caret)-\[(#[0-9a-fA-F]{3,8})\])/g

/**
 * Every CSS named colour except `white`.
 *
 * `white` is the one keyword the ramp uses directly — it is the top of the
 * text scale, and it earned that by replacing a `--color-ink` token whose
 * entire content was "#ffffff". Blessing one keyword would otherwise open the
 * door to all 147 of the others, so the rest are named here and rejected.
 * `transparent` and `currentColor` are not colours in this sense and are not
 * listed.
 */
const NAMED_COLOURS = new Set(
  `aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood
   cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray
   darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen
   darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue
   firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew
   hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan
   lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray
   lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue
   mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred
   midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid
   palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple
   rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue
   slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat whitesmoke
   yellow yellowgreen`.split(/\s+/),
)

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

/** Scan static and bound class attributes without treating prose as a utility. */
function classAttributeRegions(source, relativePath) {
  if (path.extname(relativePath) !== '.vue') return []

  const regions = []
  for (const match of source.matchAll(/(?:^|\s)(?::|v-bind:)?class\s*=\s*(["'])([\s\S]*?)\1/g)) {
    regions.push({ text: match[2], offset: match.index + match[0].indexOf(match[2]) })
  }
  return regions
}

export function auditSource(source, relativePath) {
  const violations = []
  const masked = withoutComments(source)
  const add = (index, message) =>
    violations.push({ file: relativePath, line: lineAt(source, index), message })

  for (const { text, offset } of classAttributeRegions(masked, relativePath)) {
    for (const match of text.matchAll(ARBITRARY_COLOUR_UTILITY)) {
      add(offset + match.index, `arbitrary colour ${match[1]} — use a documented colour utility`)
    }

    for (const match of text.matchAll(ARBITRARY_SPACING_UTILITY)) {
      const [utility, value, unit] = match.slice(1)
      if (utility.startsWith('-') || value.startsWith('-')) continue

      const pixels = Number(value) * (unit === 'rem' ? 16 : 1)
      if (pixels === 0) continue
      const step = pixels / 4
      const onGrid = Number.isInteger(step) && SPACE_STEPS.has(step)
      add(
        offset + match.index,
        onGrid
          ? `arbitrary spacing ${utility} is hardcoded — use the matching scale utility`
          : `arbitrary spacing ${utility} (${pixels}px) is not a step on the space scale`,
      )
    }
  }

  for (const { text, offset } of styleRegions(masked, relativePath)) {
    // 1. Colour must come from the ramp.
    for (const match of text.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
      add(offset + match.index, `raw colour ${match[0]} — use a --color-* token`)
    }

    for (const declaration of text.matchAll(
      new RegExp(`(?<![\\w-])(${COLOUR_PROPERTIES})\\s*:\\s*([^;{}]+)`, 'g'),
    )) {
      for (const word of declaration[2].matchAll(/[a-zA-Z][a-zA-Z-]*/g)) {
        if (NAMED_COLOURS.has(word[0].toLowerCase())) {
          add(
            offset + declaration.index,
            `named colour \`${word[0]}\` — use a --color-* token (only \`white\` is in the ramp)`,
          )
        }
      }
    }

    // 2. Spacing must land on a step of the scale.
    for (const declaration of text.matchAll(
      new RegExp(`\\b(${SPACING_PROPERTIES})\\s*:\\s*([^;{}]+)(?:;|(?=\\s*}))`, 'g'),
    )) {
      const [, property, value] = declaration

      for (const length of value.matchAll(/(-\s*)?([0-9.]+)(px|rem)\b/g)) {
        // Corrective arithmetic answers to the thing it corrects, not the grid.
        if (length[1]) continue

        const pixels = Number(length[2]) * (length[3] === 'rem' ? 16 : 1)
        if (pixels === 0) continue
        const step = pixels / 4
        const onGrid = Number.isInteger(step) && SPACE_STEPS.has(step)
        add(
          offset + declaration.index,
          onGrid
            ? `${property} ${length[2]}${length[3]} is on the grid but hardcoded — use var(--space-${step})`
            : `${property} ${length[2]}${length[3]} (${pixels}px) is not a step on the space scale`,
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
