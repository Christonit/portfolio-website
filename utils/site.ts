import { joinURL, withTrailingSlash, withoutTrailingSlash } from "ufo";

export const SITE_URL = "https://chsantana.com";
export const SITE_NAME = "Christopher Santana";
export const SITE_TITLE = `${SITE_NAME} - Full Stack Engineer`;
export const SITE_DESCRIPTION =
  "Senior Full Stack Engineer in NYC, from Punta Cana. I build systems and user interfaces for high-traffic web apps and real-time quote systems used by 1M+ monthly users.";

/** Absolute URL in the form Netlify actually serves (trailing slash on every path except the origin root). */
export function pageUrl(path = "/") {
  const origin = withoutTrailingSlash(SITE_URL);
  const normalized = withoutTrailingSlash(path || "/") || "/";
  if (normalized === "/") return `${origin}/`;
  return withTrailingSlash(joinURL(origin, normalized));
}

export const LINKEDIN_URL = "https://www.linkedin.com/in/chrisalesant/";
export const GITHUB_URL = "https://github.com/chrisalesant";
export const X_URL = "https://x.com/chrisalesant";
export const EMAIL_ADDRESS = "hello@chsantana.com";
export const EMAIL_URL = `mailto:${EMAIL_ADDRESS}`;
export const RESUME_PATH = "/resume.pdf";
export const RESUME_FILENAME = "Christopher-Santana-Resume.pdf";
export const GA_MEASUREMENT_ID = "G-24DBCT825P";
export const IDENTITY_ID = `${SITE_URL}/#identity`;

export function pageTitle(section: string) {
  return `${SITE_NAME} - ${section}`;
}

export function formatProjectName(name: string) {
  return name.replace(/_/g, " ");
}
