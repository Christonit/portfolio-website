export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || typeof document.startViewTransition === "function") {
    to.meta.pageTransition = false;
    to.meta.layoutTransition = false;
  }
});
