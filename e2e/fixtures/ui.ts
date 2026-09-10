import { expect, type Locator, type Page } from "@playwright/test";
import { LINKEDIN_URL } from "./site";

/**
 * Locators for the two navigation shells and the dossier sheet.
 *
 * Nothing on this site carries a `data-testid`, so these lean on the same
 * hooks a user or a crawler has: hrefs, ARIA roles and labels. Where a test
 * has to reach for a class it is because the state has no other signal — the
 * active-tab styling is the only case.
 */

/** The three tabs the header shows at `xl` and up, and the bottom bar below. */
export const NAV_TABS = {
  HOME: "/",
  PROJECTS: "/projects/",
  ABOUT: "/bio/",
} as const;

export type NavTab = keyof typeof NAV_TABS;

/**
 * The sticky header. It is present at every width — below `xl` it keeps the
 * wordmark and the resume/email/LinkedIn cluster and drops the three tabs.
 */
export const header = (page: Page) => page.locator("nav.site-nav");

/** The fixed bottom bar: in the DOM at every width, visible only below `xl`. */
export const bottomBar = (page: Page) => page.locator("nav:not(.site-nav)");

/**
 * Whichever bar owns the tabs at this viewport, narrowed to the tabs
 * themselves. The header carries the wordmark too, and that points at `/` as
 * well, so a bare `a[href="/"]` inside it matches two links.
 */
const tabList = (page: Page, isMobile: boolean) =>
  isMobile ? bottomBar(page) : header(page).locator("ul");

/**
 * By href rather than by name: the bottom bar's labels sit next to a Material
 * Symbols ligature, so its links are announced as "analytics HOME" and an
 * exact-name lookup would only ever match the header.
 */
export const navLink = (page: Page, isMobile: boolean, tab: NavTab) =>
  tabList(page, isMobile).locator(`a[href="${NAV_TABS[tab]}"]`);

/**
 * Active tabs have no `aria-current` to check — `layouts/default.vue` and
 * `MobileNav.vue` both compute the state from the path *under* an open dossier
 * rather than from the route, so the styling is the only signal either one
 * exposes. Desktop lights the underline, mobile inverts to a white plate.
 */
export async function expectNavActive(
  page: Page,
  isMobile: boolean,
  tab: NavTab,
) {
  await expect(navLink(page, isMobile, tab)).toHaveClass(
    isMobile ? /bg-white/ : /after:bg-white/,
  );
}

export async function expectNavInactive(
  page: Page,
  isMobile: boolean,
  tab: NavTab,
) {
  await expect(navLink(page, isMobile, tab)).not.toHaveClass(
    isMobile ? /bg-white/ : /after:bg-white/,
  );
}

/** The bottom bar's fourth item, which leaves the site instead of routing. */
export const connectLink = (page: Page) =>
  bottomBar(page).locator(`a[href="${LINKEDIN_URL}"]`);

// ── Dossier sheet ────────────────────────────────────────────────

/** `ProjectSheet.vue` renders the panel as `role="dialog"`, teleported to body. */
export const dossier = (page: Page) => page.getByRole("dialog");

export const dossierTitle = (page: Page) =>
  dossier(page).getByRole("heading", { level: 1 });

export const closeDossierButton = (page: Page) =>
  dossier(page).getByRole("button", { name: "Close project" });

/** The pager rails sit outside the dialog, in the gutters beside the panel. */
export const pagerRail = (page: Page, direction: "Previous" | "Next") =>
  page.locator(`a[aria-label^="${direction} project:"]`);

export async function openDossier(card: Locator) {
  const page = card.page();
  await card.click();
  await expect(dossier(page)).toBeVisible();
  return dossier(page);
}

export async function closeDossier(page: Page) {
  await closeDossierButton(page).click();
  await expect(dossier(page)).toHaveCount(0);
}

// ── Page-level helpers ───────────────────────────────────────────

/**
 * Vue has taken ownership of the server-rendered markup.
 *
 * `__vue_app__` on the mount root, rather than the `data-v-app` attribute you
 * would look for on a client-rendered app: `createSSRApp` hydrates in place and
 * never writes that attribute, so it is not a signal here. The property is
 * assigned inside `mount()`, which both paths share.
 */
export function waitForHydration(page: Page) {
  return page.waitForFunction(
    () => "__vue_app__" in (document.querySelector("#__nuxt") ?? {}),
  );
}

/**
 * Nuxt links are real anchors in the server HTML, so a click that lands before
 * hydration still navigates — as a full page load, which is a different code
 * path from the one the dossier and the tab transitions take. A dossier opened
 * that way renders the cold-load backdrop instead of layering over the page it
 * was opened from, and dismissing it goes somewhere else entirely.
 */
export async function gotoHydrated(page: Page, path: string) {
  const response = await page.goto(path);
  await waitForHydration(page);
  return response;
}

/**
 * Everything on the page has resolved to real bytes.
 *
 * Card previews are lazy, and most of them start below the fold at both
 * viewports, so they are promoted to eager here rather than scrolled into
 * view — the scroll container is a different element on every page and at
 * every breakpoint.
 */
export async function expectNoBrokenImages(page: Page) {
  const broken = await page.evaluate(async () => {
    const images = [...document.querySelectorAll("img")];
    const settled = images.map((image) => {
      image.loading = "eager";
      if (image.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        image.addEventListener("load", () => resolve(), { once: true });
        image.addEventListener("error", () => resolve(), { once: true });
      });
    });

    await Promise.race([
      Promise.all(settled),
      new Promise((resolve) => setTimeout(resolve, 10_000)),
    ]);

    return images
      .filter((image) => image.naturalWidth === 0)
      .map((image) => image.getAttribute("src") ?? "(no src)");
  });

  expect(broken, "images that failed to load").toEqual([]);
}

/** Decorative images carry `alt=""`; what matters is that none omit it. */
export async function expectEveryImageHasAlt(page: Page) {
  const missing = await page.evaluate(() =>
    [...document.querySelectorAll("img")]
      .filter((image) => image.getAttribute("alt") === null)
      .map((image) => image.getAttribute("src") ?? "(no src)"),
  );

  expect(missing, "images with no alt attribute").toEqual([]);
}

/** Every same-origin href on the page, deduplicated and otherwise untouched. */
export async function internalLinkHrefs(page: Page) {
  const hrefs = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLAnchorElement>("a[href]")].map((a) =>
      a.getAttribute("href"),
    ),
  );

  return [
    ...new Set(
      hrefs.filter(
        (href): href is string =>
          Boolean(href) && href!.startsWith("/") && !href!.startsWith("//"),
      ),
    ),
  ];
}
