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

  // Any hop that touches a dossier — opening the sheet, dismissing it, or
  // stepping the pager between two of them — is animated by ProjectSheet, not
  // by the page swap (nav-dir "none" gives ::view-transition-old/new(hud-page)
  // `animation: none`). A view transition here buys nothing and costs the two
  // things that make the sheet look chopped:
  //
  //  1. The browser holds a frozen snapshot over the live DOM until the
  //     transition's animations finish, and Nuxt only ends it on `page:finish`.
  //     The sheet mounts and starts its 400ms entrance *underneath* that
  //     snapshot, so the first frames are never painted — the panel pops in
  //     mid-flight instead of rising from the bottom.
  //  2. `hud-page` and `site-nav` are captured as independent groups, and the
  //     mobile sheet panel (a descendant of hud-page that covers the header)
  //     can't rely on its z-index surviving that split — which is what flashes
  //     the header for a frame.
  //
  // Both disappear if the swap is a plain hard cut under the sheet.
  if (isProjectDetail(to.path) || isProjectDetail(from.path)) {
    to.meta.viewTransition = false;
  }
});
