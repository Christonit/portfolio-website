import { isSamePathIgnoringTrailingSlash } from "~/composables/useNavDirection";

function isProjectDetail(path: string) {
  return path.startsWith("/project/");
}

export default defineNuxtRouteMiddleware((to, from) => {
  if (import.meta.server) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || typeof document.startViewTransition === "function") {
    to.meta.pageTransition = false;
    to.meta.layoutTransition = false;
  }

  // A tap that lands before the initial page has hydrated is routed on the
  // client by `plugins/nav-direction.client.ts` (NuxtLink isn't interactive
  // yet). Running a View Transition for that hop stalls, because its DOM-update
  // callback waits on a page whose Suspense boundary is still resolving — the
  // stall-guard then has to force-skip it ~1.2s later, swallowing taps in the
  // meantime. While hydrating, take the instant hard swap instead.
  if (useNuxtApp().isHydrating) {
    to.meta.viewTransition = false;
    return;
  }

  // On a cold load of a prerendered route, Nuxt replaces the route twice to
  // line the URL up with the path its payload was rendered at (see
  // `isSamePathIgnoringTrailingSlash`). The second replace re-renders nothing —
  // same record, same already-resolved component — so `page:finish` never
  // fires, and the view transition Nuxt opened for it hangs on that hook.
  // Meanwhile the browser holds the transition's frozen snapshot over the live
  // page, so the site paints, looks ready, and eats every click until the
  // transition times out. Neither hop is a page change: don't transition.
  if (isSamePathIgnoringTrailingSlash(to.path, from.path)) {
    to.meta.viewTransition = false;
    return;
  }

  // Pager hop between two dossiers (nav-dir "none"): the sheet already
  // plays its own slide/fade on the payload, and CSS deliberately gives
  // ::view-transition-old/new(hud-page) `animation: none` here, so the
  // native view transition buys nothing visually. What it does buy is a
  // browser-owned snapshot of `hud-page` (with the mobile sheet panel
  // painted above the header via a descendant z-index) getting composited
  // against `site-nav`'s independently-captured snapshot — two separate
  // layers whose relative order isn't guaranteed to preserve that z-index
  // relationship, which is what flashes the header for a frame. Skipping
  // the view transition for this hop sidesteps that class of bug entirely
  // rather than chasing its stacking order.
  if (isProjectDetail(to.path) && isProjectDetail(from.path)) {
    to.meta.viewTransition = false;
  }
});
