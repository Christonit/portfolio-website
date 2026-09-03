<script setup lang="ts">
import { LINKEDIN_URL } from "~/utils/site";

/**
 * The bottom bar below the xl breakpoint. Lifted out of `layouts/default.vue`
 * so the design system can mount the real one rather than restate its classes
 * — a static replica in that page is how the old `.system-button` and
 * `.system-badge` ended up documenting components that did not exist.
 *
 * `preview` is the design-system case: the bar renders in flow, at any
 * viewport, with routing and the dossier interlock off. Nothing else about it
 * changes, so what that page shows is what ships.
 */
const props = withDefaults(defineProps<{ preview?: boolean }>(), {
  preview: false,
});

const route = useRoute();
const router = useRouter();
const background = useDossierBackground();
const dossierClosing = useDossierClosing();

const items = [
  { label: "HOME", path: "/", icon: "analytics" },
  { label: "PROJECTS", path: "/projects", icon: "grid_view" },
  { label: "ABOUT", path: "/bio", icon: "fingerprint" },
  {
    label: "CONNECT",
    path: LINKEDIN_URL,
    iconSrc: "/images/paper-airplane-svgrepo-com.svg",
    // Opens a new tab, like the LinkedIn icon in the header does. It used to
    // navigate away in-tab on mobile only.
    external: true,
  },
];

/* The page the bar is really showing: the one under the sheet when a dossier
   is open over it, so opening a project from home does not move the highlight
   to PROJECTS. Mirrors `normalizedPath` in the layout, which the header uses
   for the same reason. */
const normalizedPath = computed(
  () => (background.value?.path ?? route.path).replace(/\/+$/, "") || "/",
);

// Routes resolve with a trailing slash (`nuxtLink.trailingSlash: "append"` in
// nuxt.config.ts), so comparing against the raw `route.path` never matches
// "/projects" or "/bio" — only "/" survives untouched.
const isActive = (path: string) => {
  if (props.preview) return path === "/";
  if (path === "/projects") {
    return (
      normalizedPath.value === "/projects" ||
      normalizedPath.value.startsWith("/project/")
    );
  }
  return normalizedPath.value === path;
};

/**
 * A tapped link wears its destination state from the moment it is tapped,
 * rather than waiting for the route to land — the highlight would otherwise
 * drop for the frames between the two, and the frozen view-transition snapshot
 * makes that gap legible.
 */
const pendingPath = ref<string | null>(null);
const isPending = (path: string) => pendingPath.value === path;

// A modified click opens a tab and leaves this document where it is, and an
// off-site href never comes back through the router — neither would ever clear
// the pending state, so neither sets it.
function markPending(event: MouseEvent, path: string) {
  if (props.preview) return;
  if (event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (!path.startsWith("/")) return;
  pendingPath.value = path;
}

// afterEach also fires for navigations that fail or get redirected, so the
// pending link can't stay lit after a hop that never lands.
router.afterEach(() => {
  pendingPath.value = null;
});

function tone(path: string) {
  if (isActive(path)) return "bg-white text-black";
  if (isPending(path)) return "text-white bg-surface";
  return "text-muted hover:text-white hover:bg-surface";
}
</script>

<template>
  <nav
    :class="[
      'flex h-16 bg-panel/95 backdrop-blur-xl border-t border-white/10',
      preview
        ? 'relative border border-surface'
        : 'xl:hidden fixed bottom-0 inset-x-0 z-nav-mobile shadow-[0_-8px_32px_rgba(0,0,0,0.6)]',
    ]"
    :aria-label="preview ? 'Mobile navigation sample' : undefined"
    :inert="(!preview && dossierClosing) || undefined"
  >
    <component
      :is="preview ? 'span' : 'NuxtLink'"
      v-for="item in items"
      :key="item.path"
      :to="preview ? undefined : item.path"
      :target="!preview && item.external ? '_blank' : undefined"
      :rel="!preview && item.external ? 'noopener noreferrer' : undefined"
      :aria-label="
        !preview && item.external ? `${item.label} (opens in a new tab)` : undefined
      "
      :class="[
        'group flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-150',
        tone(item.path),
      ]"
      @click="markPending($event, item.path)"
    >
      <!-- alt="" — the label below it already says CONNECT, and naming the
           icon too had screen readers announce the link twice. -->
      <img
        v-if="item.iconSrc"
        :src="item.iconSrc"
        alt=""
        class="h-4 w-4 shrink-0"
        :class="
          isActive(item.path)
            ? 'brightness-0'
            : isPending(item.path)
              ? 'brightness-0 invert opacity-100'
              : 'brightness-0 invert opacity-60 group-hover:opacity-100'
        "
        draggable="false"
      />
      <span v-else class="material-symbols-outlined icon-md leading-none">{{
        item.icon
      }}</span>
      <span class="text-label-ui uppercase tracking-widest">{{
        item.label
      }}</span>
    </component>
  </nav>
</template>
