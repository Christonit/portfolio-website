/**
 * Fails if a template renders a Material Symbol the subset font does not carry.
 *
 * Self-hosting an eleven-icon cut of Material Symbols saves ~3.9 MB, and the
 * price is that a missing glyph does not degrade — the ligature never forms and
 * the icon renders as its own name in words. This catches that at test time
 * rather than in production.
 *
 * Three ways an icon name reaches the DOM, all covered below:
 *   <span class="material-symbols-outlined">close</span>   literal in a template
 *   { label: "HOME", icon: "analytics" }                   a nav/config object
 *   "icon": "hexagon"                                      data/projects.json
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ICON_NAMES } from "./icon-names.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROOTS = ["layouts", "pages", "components", "data"];
const EXTENSIONS = new Set([".vue", ".ts", ".json"]);

async function sourceFiles(dir) {
  const found = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await sourceFiles(full)));
    else if (EXTENSIONS.has(path.extname(entry.name))) found.push(full);
  }
  return found;
}

/** `<span class="material-symbols-outlined …">close</span>` and fallbacks. */
function literalSpanIcons(source) {
  const names = [];
  const spans = source.matchAll(
    /<span[^>]*material-symbols-outlined[^>]*>([\s\S]*?)<\/span/g,
  );
  for (const [, body] of spans) {
    const text = body.trim();
    if (!text) continue;
    if (text.includes("{{")) {
      // The object-literal pass covers `{{ item.icon }}`; quoted `||`/`??`
      // fallbacks live only in the template and must be collected here.
      names.push(
        ...[...text.matchAll(/(?:\|\||\?\?)\s*["']([a-z0-9_]+)["']/g)].map(
          (match) => match[1],
        ),
      );
      continue;
    }
    names.push(text);
  }
  return names;
}

/** `icon: "analytics"` and `"icon": "hexagon"`. */
function objectIcons(source) {
  return [...source.matchAll(/["']?icon["']?\s*:\s*["']([a-z0-9_]+)["']/g)].map(
    (match) => match[1],
  );
}

const known = new Set(ICON_NAMES);
const problems = [];

for (const root of ROOTS) {
  for (const file of await sourceFiles(path.join(ROOT, root))) {
    const source = await readFile(file, "utf8");
    const relative = path.relative(ROOT, file);
    for (const name of [...literalSpanIcons(source), ...objectIcons(source)]) {
      if (!known.has(name)) {
        problems.push(
          `${relative}: "${name}" is not in the subset — add it to ` +
            `scripts/icon-names.mjs and run \`npm run fonts:icons\``,
        );
      }
    }
  }
}

if (problems.length) {
  for (const problem of problems) console.error(problem);
  process.exit(1);
}

console.log(`icon coverage ok — ${ICON_NAMES.length} icons in the subset`);
