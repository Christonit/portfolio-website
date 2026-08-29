/**
 * Nuxt opens a view transition in `router.beforeResolve` and closes it on
 * `page:finish`. A navigation that re-renders nothing never fires that hook, so
 * the transition stays open — and while it is open the browser paints its
 * frozen snapshot over the live page, which swallows every click until the
 * transition gives up four seconds later.
 *
 * `middleware/page-transitions.global.ts` heads off the one navigation known to
 * do this. This is the backstop for the rest: an unresponsive page is a far
 * worse failure than a transition that doesn't play, so cut any transition
 * still running well past the longest scripted one (--page-modal-dur, 420ms).
 */
const STALL_MS = 1200;

export default defineNuxtPlugin((nuxtApp) => {
  if (typeof document.startViewTransition !== "function") return;

  nuxtApp.hook("page:view-transition:start", (transition) => {
    let settled = false;
    const settle = () => {
      settled = true;
    };
    transition.finished.then(settle, settle);

    setTimeout(() => {
      if (!settled) transition.skipTransition();
    }, STALL_MS);
  });
});
