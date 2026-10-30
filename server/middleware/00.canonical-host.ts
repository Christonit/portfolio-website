const CANONICAL_HOST = "chsantana.com";
const WWW_HOST = `www.${CANONICAL_HOST}`;
const HOST_AS_PATH = `/${CANONICAL_HOST}`;

function isDevHost(hostname: string) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname === "[::1]"
  );
}

export default defineEventHandler((event) => {
  if (import.meta.prerender) return;

  let url: URL;
  try {
    url = getRequestURL(event, { xForwardedHost: true });
  } catch {
    return;
  }

  const hostname = url.hostname.toLowerCase();
  if (isDevHost(hostname)) return;

  let pathname = url.pathname;
  let needsRedirect = false;

  if (pathname === HOST_AS_PATH || pathname.startsWith(`${HOST_AS_PATH}/`)) {
    pathname = pathname.slice(HOST_AS_PATH.length) || "/";
    needsRedirect = true;
  }

  if (hostname === WWW_HOST) {
    needsRedirect = true;
  }

  if (!needsRedirect) return;

  const dest = new URL(url.href);
  dest.protocol = "https:";
  dest.port = "";
  if (hostname === WWW_HOST) dest.hostname = CANONICAL_HOST;
  dest.pathname = pathname;
  return sendRedirect(event, dest.href, 301);
});
