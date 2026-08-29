import type { Directive } from "vue";

const observers = new WeakMap<HTMLElement, IntersectionObserver>();

/* The rise-and-fade is an arrival gesture for the first paint. Once the app
   has settled, a route change already carries its own page transition, so
   anything mounting inside the viewport would rise a second time on top of
   it — that double motion is what reads as jitter when tabbing between
   pages. After the initial render, on-screen items snap straight to rest and
   only off-screen ones keep their scroll reveal. */
let isFirstRender = true;

function isInViewport(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function applyDelay(el: HTMLElement, value: unknown) {
  if (typeof value === "number") {
    el.style.setProperty("--reveal-delay", `${value}ms`);
  }
}

function markPending(el: HTMLElement) {
  el.setAttribute("data-reveal", "");
}

function markShown(el: HTMLElement) {
  el.setAttribute("data-reveal", "shown");
}

/* Jump straight to rest with no travel. The transition has to be suppressed
   by hand: measuring the element (the viewport test) flushes style, so the
   pending state counts as a before-change style and the flip would otherwise
   animate. */
function snapShown(el: HTMLElement) {
  const previous = el.style.transition;
  el.style.transition = "none";
  markShown(el);
  void el.offsetHeight;
  requestAnimationFrame(() => {
    el.style.transition = previous;
  });
}

function observe(el: HTMLElement) {
  if (prefersReducedMotion()) {
    markShown(el);
    return;
  }

  if (!isFirstRender && isInViewport(el)) {
    snapShown(el);
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            markShown(el);
          });
        });
        io.unobserve(el);
        observers.delete(el);
      }
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -8% 0px",
    },
  );

  observers.set(el, io);
  io.observe(el);
}

/* `false` opts an element out entirely — used where the same markup renders
   both as a live page and as a static backdrop behind a modal sheet. */
const reveal: Directive<HTMLElement, number | false | undefined> = {
  created(el, binding) {
    if (binding.value === false) return;
    markPending(el);
    applyDelay(el, binding.value);
  },
  mounted(el, binding) {
    if (binding.value === false) {
      markShown(el);
      return;
    }
    applyDelay(el, binding.value);
    observe(el);
  },
  updated(el, binding) {
    if (binding.value === false) return;
    applyDelay(el, binding.value);
  },
  unmounted(el) {
    observers.get(el)?.disconnect();
    observers.delete(el);
  },
  getSSRProps(binding) {
    if (binding.value === false) return {};
    return {
      "data-reveal": "",
      style:
        typeof binding.value === "number"
          ? { "--reveal-delay": `${binding.value}ms` }
          : undefined,
    };
  },
};

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive("reveal", reveal);
  nuxtApp.hook("app:suspense:resolve", () => {
    isFirstRender = false;
  });
});
