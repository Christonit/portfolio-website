/**
 * Refetches the Material Symbols subset in public/fonts/.
 *
 * The site self-hosts an eleven-icon cut of a font that ships 3.9 MB
 * unsubsetted. That saving is only safe while the cut covers every icon a
 * template actually asks for — a missing one renders as its literal ligature
 * text ("fingerprint" as five words, in the middle of the nav).
 *
 * So ICON_NAMES below is the source of truth. Add the icon here, run
 * `npm run fonts:icons`, and commit the new woff2.
 *
 * The audit that keeps the two honest is scripts/icon-coverage.mjs, which runs
 * as part of `npm test`.
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ICON_NAMES } from "./icon-names.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public/fonts/MaterialSymbolsOutlined-subset.woff2");

// A browser UA, or Google serves the ttf fallback instead of woff2.
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// @24,300,0,0 matches the fixed font-variation-settings in globals.css.
const CSS_URL =
  "https://fonts.googleapis.com/css2" +
  "?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,300,0,0" +
  `&icon_names=${[...ICON_NAMES].sort().join(",")}` +
  "&display=block";

const css = await fetch(CSS_URL, { headers: { "User-Agent": UA } }).then(
  (res) => {
    if (!res.ok) throw new Error(`${CSS_URL} → ${res.status}`);
    return res.text();
  },
);

const fontUrl = css.match(/src:\s*url\(([^)]+)\)/)?.[1];
if (!fontUrl) throw new Error(`No @font-face src in the response:\n${css}`);

const font = await fetch(fontUrl, { headers: { "User-Agent": UA } }).then(
  (res) => {
    if (!res.ok) throw new Error(`${fontUrl} → ${res.status}`);
    return res.arrayBuffer();
  },
);

await writeFile(OUT, Buffer.from(font));

console.log(
  `Wrote ${path.relative(ROOT, OUT)} — ${ICON_NAMES.length} icons, ${font.byteLength} bytes`,
);
