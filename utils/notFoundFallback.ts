import { SITE_NAME } from "./site";

/**
 * A no-JS 404, injected into the prerendered 404.html at build time.
 *
 * Nuxt hardcodes /404.html (with /200.html and /index.html) as a SPA shell —
 * `PRERENDER_NO_SSR_ROUTES` in @nuxt/nitro-server — so no route rule can make
 * it server-render. The file Netlify serves for every unmatched URL was
 * `<div id="__nuxt"></div>` and nothing else: a black screen until the bundle
 * landed, and the whole ErrorConsole was JS-only.
 *
 * So the fallback lives *outside* `#__nuxt`, where Vue never looks at it and
 * there is nothing to mismatch against. It paints with the document, and the
 * `:has()` rule below drops it the moment Nuxt mounts and fills `#__nuxt` —
 * no script, no flash of both.
 *
 * The real ErrorConsole still takes over once hydrated; this only has to hold
 * the screen until then, and to be the entire experience for a reader without
 * JavaScript.
 */
const FALLBACK_ID = "static-404";

const STYLES = `
#${FALLBACK_ID} {
  position: fixed;
  inset: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #131313;
  color: #e2e2e2;
  font-family: "Departure Mono", ui-monospace, monospace;
  text-align: center;
}
/* Nuxt has mounted — the interactive console is up, so stand down. */
#__nuxt:has(*) ~ #${FALLBACK_ID} { display: none; }
#${FALLBACK_ID} .static-404__code {
  margin: 0;
  font-family: "Tomorrow", sans-serif;
  font-size: clamp(4rem, 18vw, 8rem);
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.03em;
  color: #fff;
}
#${FALLBACK_ID} .static-404__label {
  margin: 0 0 12px;
  font-size: 12px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: #919191;
}
#${FALLBACK_ID} .static-404__copy {
  margin: 16px 0 28px;
  max-width: 34ch;
  font-family: "Tomorrow", sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: #c6c6c6;
}
#${FALLBACK_ID} a {
  display: inline-block;
  border: 1px solid rgba(255, 255, 255, 0.28);
  padding: 12px 20px;
  min-height: 44px;
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  text-decoration: none;
  color: #fff;
}
#${FALLBACK_ID} a:hover,
#${FALLBACK_ID} a:focus-visible { background: #fff; color: #000; }
`;

const MARKUP = `
<div id="${FALLBACK_ID}">
  <div>
    <p class="static-404__label">// ERR_404 &nbsp; PAGE_NOT_FOUND</p>
    <p class="static-404__code">404</p>
    <p class="static-404__copy">The path you requested isn't mapped on this system. Confirm the URL, or return to the console.</p>
    <a href="/">Return home</a>
  </div>
</div>`;

/**
 * Rewrites the prerendered shell: the real title and description in place of
 * the home page's (nothing rendered server-side, so `error.vue`'s head never
 * reached this file), plus the fallback itself after `#__nuxt`.
 */
export function injectNotFoundFallback(html: string): string {
  const title = `${SITE_NAME} - Page Not Found`;
  const description = `This page isn't on ${SITE_NAME}'s site.`;

  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(
      /<meta name="description" content="[^"]*">/,
      `<meta name="description" content="${description}">`,
    )
    .replace("</head>", `<style>${STYLES}</style></head>`)
    .replace('<div id="__nuxt"></div>', `<div id="__nuxt"></div>${MARKUP}`);
}
