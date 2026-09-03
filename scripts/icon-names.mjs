/**
 * Every Material Symbol the site renders.
 *
 * The icon font in public/fonts/ is subset to exactly this list, so a name
 * that is used but missing here does not fall back — it renders as the
 * ligature text itself. `npm run fonts:icons` rebuilds the font from this
 * list; `scripts/icon-coverage.mjs` fails the test run if a template asks for
 * something the list does not carry.
 */
export const ICON_NAMES = [
  "add",
  "analytics",
  "article",
  "auto_awesome",
  "candlestick_chart",
  "close",
  "deployed_code",
  "fingerprint",
  "fullscreen",
  "grid_view",
  "hexagon",
];
