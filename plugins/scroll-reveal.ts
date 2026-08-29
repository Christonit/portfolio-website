import type { Directive } from "vue";

const observers = new WeakMap<HTMLElement, IntersectionObserver>();

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

function observe(el: HTMLElement) {
  if (prefersReducedMotion()) {
    markShown(el);
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
});
