import { isSamePathIgnoringTrailingSlash } from "~/composables/useNavDirection";

export default defineNuxtRouteMiddleware((to, from) => {
  if (import.meta.server) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || typeof document.startViewTransition === "function") {
    to.meta.pageTransition = false;
    to.meta.layoutTransition = false;
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
  }
});
