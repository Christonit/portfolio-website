import type { RouteLocationNormalizedLoaded } from "vue-router";
import type { ShallowRef } from "vue";

export type DossierDismissalNavigation =
  | { type: "back" }
  | { type: "replace"; to: string };

/**
 * A client-opened dossier occupies one modal history entry, so dismissal
 * consumes that entry. A cold load has no background entry to return to and
 * replaces the dossier URL with the projects board instead.
 */
export function dossierDismissalNavigation(
  background: Pick<RouteLocationNormalizedLoaded, "fullPath"> | null,
): DossierDismissalNavigation {
  return background
    ? { type: "back" }
    : { type: "replace", to: "/projects" };
}

/** Pager steps stay inside the modal's single history entry. */
export function dossierPagerNavigation(slug: string): {
  type: "replace";
  to: string;
} {
  return { type: "replace", to: `/project/${slug}/` };
}

/** Shared by click and keyboard controls while the sheet is leaving. */
export function dossierControlsAreBlocked(closing: boolean) {
  return closing;
}

type DossierFocusTarget = {
  focus(options?: FocusOptions): void;
};

/** Restore focus only after Vue has removed the background page's inert state. */
export async function restoreDossierFocus(
  target: DossierFocusTarget | null,
  afterUpdate: () => Promise<unknown>,
) {
  await afterUpdate();
  target?.focus({ preventScroll: true });
}

/**
 * A dossier is a sheet over a page, not a page of its own.
 *
 * The URL still changes — every project is a real, crawlable, prerendered
 * route — but on the client the page you opened it from stays mounted
 * underneath. That is the whole point of a modal: opening one from the home
 * page must not quietly swap the home page for the projects board, and
 * dismissing it has to put you back exactly where you were, on the same
 * component instance, at the same scroll offset.
 *
 * `background` holds that page's route. `<NuxtPage :route>` in `app.vue`
 * renders it for as long as a dossier is up, so the router can move to
 * `/project/[slug]` without the page underneath re-rendering at all.
 *
 * It stays null for a cold load of a dossier URL — there is no page behind it
 * then, so `pages/project/[slug].vue` renders the projects board as a backdrop
 * and the sheet dismisses to `/projects`.
 */
export function isDossierPath(path: string) {
  return path.startsWith("/project/");
}

type BackgroundHolder = {
  _dossierBackground?: ShallowRef<RouteLocationNormalizedLoaded | null>;
};

export function useDossierBackground(): ShallowRef<RouteLocationNormalizedLoaded | null> {
  const holder = useNuxtApp() as unknown as BackgroundHolder;
  const existing = holder._dossierBackground;
  if (existing) return existing;

  const background = shallowRef<RouteLocationNormalizedLoaded | null>(null);
  holder._dossierBackground = background;

  // Server-side there is never a page behind the sheet: a request for a
  // dossier URL renders that dossier and nothing else.
  if (!import.meta.client) return background;

  const nuxtApp = useNuxtApp();
  const router = useRouter();

  // Claimed before the navigation lands, so the frozen route is already in
  // place by the time Vue re-renders for the new URL — a frame in which
  // `<NuxtPage>` had switched to the dossier page would be a frame of the
  // board flashing up behind the sheet.
  router.beforeEach((to, from) => {
    if (!isDossierPath(to.path)) return;
    // A pager step keeps the backdrop it started on, and a cold load
    // (`from` unmatched) has none to keep.
    if (isDossierPath(from.path) || !from.matched.length) return;
    background.value = from;
  });

  // Released only once the navigation has actually completed — the sheet holds
  // the route change back until its dismissal animation has played out, and
  // dropping the backdrop any earlier would swap the page underneath a panel
  // that is still on screen.
  router.afterEach((to, from) => {
    if (!isDossierPath(to.path)) background.value = null;

    // Nuxt only republishes the route `useRoute()` reads once the page
    // component it swapped in has resolved, or when the hop didn't change that
    // component at all. Pinning <NuxtPage> means neither happens: the URL moves
    // to a dossier and back while the component underneath sits still, so
    // nothing would ever tell the rest of the app the route had changed — the
    // sheet would never open, and the header would never notice it had. `sync`
    // is the same handle <NuxtPage> reaches for when a page does resolve.
    if (isDossierPath(to.path) || isDossierPath(from.path)) {
      (nuxtApp._route as unknown as { sync?: () => void }).sync?.();
    }
  });

  return background;
}

/**
 * Whether a dossier sheet is up. The page underneath is still mounted and
 * still listening, so it has to stand down while the sheet has the floor —
 * `inert` for pointers and focus, and a guard on any window-level key handler,
 * which `inert` does not reach.
 */
export function useDossierOpen() {
  // The router's own route, not `useRoute()`: a page rendering underneath a
  // sheet is pinned to the route it was opened on, so asking it where we are
  // would always answer "not on a dossier".
  const router = useRouter();
  return computed(() => isDossierPath(router.currentRoute.value.path));
}

/** Whether a dossier dismissal is holding the current route open for motion. */
export function useDossierClosing() {
  return useState<boolean>("dossier-closing", () => false);
}
