export const SITE_URL = "https://chsantana.com";
export const SITE_NAME = "Christopher Santana";
export const SITE_TITLE = `${SITE_NAME} - Full Stack Engineer`;
export const SITE_DESCRIPTION =
  "Senior Full Stack Engineer in NYC, from Punta Cana. I build systems and user interfaces for high-traffic web apps and real-time quote systems used by 1M+ monthly users.";

export const LINKEDIN_URL = "https://www.linkedin.com/in/chrisalesant/";
export const GITHUB_URL = "https://github.com/chrisalesant";
export const IDENTITY_ID = `${SITE_URL}/#identity`;

export function pageTitle(section: string) {
  return `${SITE_NAME} - ${section}`;
}

export function formatProjectName(name: string) {
  const known: Record<string, string> = {
    "CANOPY SUPER APP": "Canopy Super App",
    "TIMOTHY SYKES": "Timothy Sykes",
    STOCKS_TO_TRADE: "StocksToTrade",
  };
  if (known[name]) return known[name];
  return name
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
