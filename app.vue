<script setup lang="ts">
import type { NavDir } from "~/composables/useNavDirection";
import {
  isDossierPath,
  useDossierBackground,
} from "~/composables/useDossierBackground";

useIdentitySchema();

const route = useRoute();
const navDir = useNavDirection();

const TRANSITION_NAMES: Record<NavDir, string> = {
  forward: "hud-forward",
  back: "hud-back",
  "modal-in": "hud-modal-in",
  "modal-out": "hud-modal-out",
  // Any hop that touches a dossier: the sheet animates itself over a page that
  // has to stay put, so the page swap has no motion of its own.
  none: "hud-none",
};

/**
 * Always an object, never `false`, even for the hops that don't animate.
 * Dropping the prop changes the shape of what <NuxtPage> renders — the
 * <Transition> wrapper disappears from the vnode tree — and Vue tears the page
 * down and builds it again, which is the one thing pinning the route below is
 * here to prevent. `hud-none` is a name with no keyframes behind it.
 */
const pageTransition = computed(() => ({
  name: TRANSITION_NAMES[navDir.value] ?? "hud-forward",
}));

/**
 * A dossier is a sheet, so the page it was opened over keeps rendering
 * underneath it: pinning <NuxtPage> to that route means the router can walk to
 * /project/[slug] — and step between dossiers — without the page below ever
 * re-rendering. Open one from the home page and you are still on the home
 * page; dismiss it and you land back on the same instance, mid-scroll.
 *
 * Null for a cold load of a dossier URL, where there is nothing behind the
 * sheet yet and pages/project/[slug].vue draws the board as a backdrop.
 */
const background = useDossierBackground();

/* Mounted only while the URL is a dossier, so the sheet's head — title,
   canonical, schema — lasts exactly as long as the sheet does. */
const sheetIsUp = computed(() => isDossierPath(route.path));
</script>

<template>
  <NuxtLayout>
    <NuxtPage :route="background ?? undefined" :transition="pageTransition" />
  </NuxtLayout>

  <ProjectDossierOverlay v-if="sheetIsUp" />

  <DevOnly>
    <DevAgentation />
  </DevOnly>
</template>
