<script setup lang="ts">
import type { FeaturedSkill } from "~/components/StackIndex.vue";
import type { ProjectPreview } from "~/components/ProjectTooltip.vue";
import projectsJson from "~/data/projects.json";
import { useDossierOpen } from "~/composables/useDossierBackground";
import {
  isArticle,
  isExternalProjectHref,
  openProject,
  projectBadges,
  projectHref,
  projectMediaAlt,
} from "~/utils/projects";
import { SITE_DESCRIPTION, SITE_TITLE } from "~/utils/site";

usePageSeo({
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  pageType: "ProfilePage",
});

const projects = projectsJson as ProjectPreview[];
const featuredOrder = [
  "canopy-super-app",
  "stockstotrade",
  "timothy-sykes",
  "content-automation-ai",
];
const featuredProjects = featuredOrder
  .map((slug) => projects.find((project) => project.slug === slug))
  .filter((project): project is ProjectPreview => Boolean(project));
const articles = projects.filter(isArticle);
const hudKey = useHudNav();

const featuredSkills: FeaturedSkill[] = [
  { iconSrc: "/images/typescript-svgrepo-com.svg", name: "TYPESCRIPT" },
  { iconSrc: "/images/react-svgrepo-com.svg", name: "REACT" },
  { iconSrc: "/images/nextjs-svgrepo-com.svg", name: "NEXT.JS" },
  { iconSrc: "/images/vuejs-svgrepo-com.svg", name: "VUE.JS" },
  { iconSrc: "/images/nuxt-js-svgrepo-com.svg", name: "NUXT" },
  { iconSrc: "/images/nodejs-svgrepo-com.svg", name: "NODE.JS" },
  { iconSrc: "/images/aws-lambda-svgrepo-com.svg", name: "AWS" },
  {
    iconSrc: "/images/google-cloud-svgrepo-com.svg",
    name: "GOOGLE CLOUD PLATFORM",
  },
  { iconSrc: "/images/figma-svgrepo-com.svg", name: "FIGMA / UI DESIGN" },
  {
    iconSrc: "/images/graphql-svgrepo-com.svg",
    name: "GRAPHQL / REST APIS",
  },
  { iconSrc: "/images/python-127-svgrepo-com.svg", name: "PYTHON" },
  { iconSrc: "/images/database-svgrepo-com.svg", name: "DATABASES" },
  {
    iconSrc: "/images/headless.svg",
    name: "WORDPRESS / HEADLESS CMS",
  },
  { iconSrc: "/images/css.svg", name: "CSS / TAILWIND" },
];

/* The home page keeps rendering under an open dossier — that is what makes the
   sheet a sheet — so while one is up it stops answering: `inert` takes the
   pointer and focus targets, and these guards take the keys, which `inert`
   never sees because the listeners are on `window`. */
const sheetIsUp = useDossierOpen();

const focusedCard = ref<number | null>(null);
const cardRefs = ref<(HTMLElement | null)[]>([]);
const portraitHover = ref(false);

function bindCard(el: Element | null, index: number) {
  cardRefs.value[index] = el instanceof HTMLElement ? el : null;
}

function moveCardFocus(direction: number) {
  if (focusedCard.value === null) {
    focusedCard.value = direction > 0 ? 0 : featuredProjects.length - 1;
  } else {
    focusedCard.value = Math.min(
      Math.max(focusedCard.value + direction, 0),
      featuredProjects.length - 1,
    );
  }

  cardRefs.value[focusedCard.value]?.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
  });
}

watch(hudKey, (key) => {
  if (sheetIsUp.value) return;
  if (key === "ArrowRight" || key === "ArrowDown") moveCardFocus(1);
  if (key === "ArrowLeft" || key === "ArrowUp") moveCardFocus(-1);
});

function onKeydown(event: KeyboardEvent) {
  if (sheetIsUp.value) return;
  if (event.key !== "Enter" || focusedCard.value === null) return;
  const target = event.target as HTMLElement | null;
  if (
    target?.closest(
      'a, button, input, textarea, select, [contenteditable="true"]',
    )
  ) {
    return;
  }

  event.preventDefault();
  openProject(featuredProjects[focusedCard.value]);
}

onMounted(() => window.addEventListener("keydown", onKeydown));
onUnmounted(() => window.removeEventListener("keydown", onKeydown));
</script>

<template>
  <div class="home-console" :inert="sheetIsUp || undefined">
    <div class="home-rail">
      <section
        id="hero-banner"
        class="identity-panel"
        aria-labelledby="identity-name"
        @mouseenter="portraitHover = true"
        @mouseleave="portraitHover = false"
        @touchstart.passive="portraitHover = true"
        @touchend.passive="portraitHover = false"
        @touchcancel.passive="portraitHover = false"
      >
        <div class="identity-copy">
          <h1 id="identity-name" class="identity-name text-display">
            CHRISTO<wbr />PHER<br />SANTANA
          </h1>

          <div class="identity-facts">
            <div>
              <p class="identity-role text-title-ui">
                FULL_STACK_ENGINEER<span class="identity-role__location"
                  >// NYC</span
                >
              </p>
            </div>
            <div>
              <p class="identity-mission text-body-compact">
                <span class="identity-mission__lead">
                  AI SYSTEMS, FRONTEND ARCHITECTURE, SEO &amp; DATA PIPELINES
                </span>
                <NuxtLink to="https://stockstotrade.com/">
                  @STOCKSTOTRADE
                </NuxtLink>
              </p>
            </div>
          </div>
        </div>

        <!-- <div class="identity-portrait" aria-hidden="true">
          <PortraitPixelate :hovered="portraitHover" />
        </div> -->

        <HudCorners />
      </section>

      <section
        id="featured-work"
        class="featured-work"
        aria-labelledby="featured-work-title"
      >
        <div class="section-heading sr-only">
          <h2 id="featured-work-title">Featured projects</h2>
        </div>

        <ul class="featured-grid" role="list">
          <li
            v-for="(project, index) in featuredProjects"
            :key="project.slug"
            :ref="(el) => bindCard(el as Element | null, index)"
          >
            <NuxtLink
              :to="projectHref(project)"
              :external="isExternalProjectHref(project)"
              :target="isExternalProjectHref(project) ? '_blank' : undefined"
              :rel="
                isExternalProjectHref(project)
                  ? 'noopener noreferrer'
                  : undefined
              "
              class="dossier-card group"
              :class="{ 'is-focused': focusedCard === index }"
            >
              <HudCorners reveal="hover" />

              <div class="dossier-card__image">
                <img
                  v-if="project.image"
                  :src="project.image"
                  :alt="projectMediaAlt(project)"
                  loading="lazy"
                  decoding="async"
                />
                <span
                  v-else
                  class="material-symbols-outlined"
                  aria-hidden="true"
                >
                  {{ project.icon || "deployed_code" }}
                </span>
              </div>

              <div class="dossier-card__body">
                <h3>{{ project.name }}</h3>

                <p class="dossier-card__summary">
                  {{ project.description || project.tasks[0] }}
                </p>

                <ul
                  v-if="projectBadges(project).length"
                  class="dossier-card__tags"
                  role="list"
                >
                  <li v-for="badge in projectBadges(project)" :key="badge">
                    <span class="text-label-data">{{ badge }}</span>
                  </li>
                </ul>
              </div>

              <span class="dossier-card__cta">
                {{ isArticle(project) ? "READ_ARTICLE" : "VIEW_PROJECT" }}
                <span class="dossier-card__cta-arrow" aria-hidden="true"
                  >&rarr;</span
                >
              </span>
            </NuxtLink>
          </li>
        </ul>
      </section>

      <section
        class="index-module"
        id="tech-stack-list"
        aria-labelledby="tech-stack-title"
      >
        <header class="index-module__header">
          <h2 id="tech-stack-title" class="text-heading-section">TECH STACK</h2>
        </header>

        <StackIndex :skills="featuredSkills" />
      </section>

      <section
        id="articles-list"
        class="index-module articles-index"
        aria-labelledby="articles-index-title"
      >
        <header class="index-module__header">
          <h2 id="articles-index-title" class="text-heading-section">
            ARTICLES
          </h2>
        </header>

        <ArticlesIndex :articles="articles" />
      </section>
    </div>
  </div>
</template>

<style scoped>
.home-console {
  /* Film grain lifted from the portrait plate — blended, not painted, so the
     tone underneath stays put and only the texture comes through. */
  --identity-grain: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23g)'/%3E%3C/svg%3E");
  height: 100%;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding-bottom: 64px;
}

.home-console::-webkit-scrollbar {
  display: none;
}

.home-rail {
  width: min(800px, calc(100% - 32px));
  margin-inline: auto;
  /* Top gap matches the hero's bottom gap (.featured-work margin-top). */
  padding: 40px 0 72px;
}

.identity-panel {
  position: relative;
  display: flex;
  min-height: 252px;
  overflow: hidden;
  /* Grain + tone are matched to the portrait plate so the whole card reads as
     one continuous surface instead of copy-panel-plus-photo. */
  background:
    var(--identity-grain),
    linear-gradient(90deg, rgba(255, 255, 255, 0.025), transparent 70%), #101010;
  background-size:
    180px 180px,
    auto,
    auto;
  background-blend-mode: overlay, normal, normal;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.025);
}

.identity-panel::after,
.index-module::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: repeating-linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.025) 0,
    rgba(255, 255, 255, 0.025) 1px,
    transparent 1px,
    transparent 4px
  );
  background-size: 100% 4px;
  opacity: 0.65;
  animation: scanline-scan 6s linear infinite;
}

@keyframes scanline-scan {
  from {
    background-position: 0 0;
  }

  to {
    background-position: 0 120px;
  }
}

.identity-copy {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 22px 18px 20px;
  width: 100%;
}

.identity-name {
  margin-top: 10px;
  color: #fff;
  font-size: var(--text-display);
  font-weight: 600;
  /* `.text-display` ships a fixed 40px leading sized for its own fixed 44px.
     This heading overrides the size with the fluid token, so the leading has
     to be proportional too — otherwise the two lines collide at desktop and
     drift apart at phone widths. */
  line-height: 0.92;
  letter-spacing: -0.025em;
  text-transform: uppercase;
  text-wrap: balance;
}

.identity-facts {
  display: grid;
  gap: 12px;
  margin-top: auto;
}

.identity-role {
  margin-top: 2px;
  color: #fff;
  font-size: var(--text-sm);
  font-weight: 600;
  letter-spacing: 0.13em;
}

.identity-role__location {
  margin-left: 8px;
  color: #c6c6c6;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 400;
  letter-spacing: 0.08em;
  white-space: nowrap;
}

.identity-mission {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 3px;
  color: #c6c6c6;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  line-height: 1.35;
  text-transform: uppercase;
}

.identity-mission a {
  color: #fff;
  text-decoration: underline;
  text-decoration-color: rgba(255, 255, 255, 0.4);
  text-underline-offset: 2px;
}

.identity-mission a:hover,
.identity-mission a:focus-visible {
  color: #67f57a;
}

.identity-portrait {
  --portrait-hover-scale: 1.2;
  --portrait-scale: 1.18;

  position: relative;
  min-width: 262px;
  overflow: hidden;
  background: #101010;
}

.identity-portrait::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    #101010 0%,
    rgba(16, 16, 16, 0) 34%,
    rgba(16, 16, 16, 0) 78%,
    #101010 100%
  );
  pointer-events: none;
}

.featured-work {
  margin-top: 40px;
}

.featured-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.featured-grid > li {
  min-width: 0;
}

.dossier-card {
  position: relative;
  display: flex;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #292929;
  background: rgba(11, 11, 11, 0.88);
  color: #e2e2e2;
  text-decoration: none;
  transition:
    border-color 150ms ease,
    background-color 150ms ease;
  /* Corner marks answer the pointer — hidden at rest, green on hover, and
     stationary, so a row of cards stays quiet until you aim at one. */
  --hud-corner-size: 18px;
  --hud-corner-inset: 0px;
  --distance-micro: 0px;
}

.dossier-card:hover,
.dossier-card:focus-visible,
.dossier-card.is-focused {
  border-color: rgba(103, 245, 122, 0.72);
  background: #0a0a0a;
  outline: none;
}

.dossier-card__image {
  position: relative;
  display: flex;
  aspect-ratio: 16 / 8;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-bottom: 1px solid #262626;
  background: #111;
  color: #919191;
}

.dossier-card__image::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 72%, rgba(0, 0, 0, 0.32));
  pointer-events: none;
}

.dossier-card__image img {
  /* Sources carry a 1px white edge on all four sides — bleed the image past
     the frame on every axis so the overflow clip eats it. */
  width: calc(100% + 4px);
  height: calc(100% + 4px);
  margin-block: -2px;
  margin-inline: -2px;
  object-fit: cover;
  object-position: top center;
  /* No hover scale: the crop is already tight, so zooming clipped the artwork
     against the card edge. Tone-only response instead. */
  transition: filter 180ms ease;
}

.dossier-card:hover .dossier-card__image img,
.dossier-card:focus-visible .dossier-card__image img,
.dossier-card.is-focused .dossier-card__image img {
  filter: saturate(1.08) contrast(1.04);
}

.dossier-card__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 7px;
  padding: 14px 16px 16px;
}

.dossier-card__body h3 {
  min-width: 0;
  overflow: hidden;
  color: #fff;
  font-size: var(--text-sm);
  font-weight: 600;
  letter-spacing: -0.015em;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

/* Two lines of context under the name — same summary the projects index
   shows, clamped so every card in the row keeps the same body height. */
.dossier-card__summary {
  display: -webkit-box;
  overflow: hidden;
  margin: 0;
  color: var(--color-muted);
  font-size: var(--text-xs);
  line-height: 1.55;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

/* Same tag badges the projects index cards carry. `margin-top: auto` parks the
   row on the body's bottom edge, so badges line up across a row of cards
   whether a summary runs one line or two. */
.dossier-card__tags {
  display: flex;
  flex-wrap: wrap;
  margin: 0;
  margin-top: auto;
  padding: 3px 0 0;
  gap: 6px;
  list-style: none;
}

.dossier-card__tags span {
  display: inline-flex;
  align-items: center;
  border: 1px solid #3a3a3a;
  padding: 3px 6px;
  color: #c6c6c6;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

/* Reads as the card's button: full-width strip on the bottom edge, lit by the
   card's own hover state since the whole card is the link. */
.dossier-card__cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 11px 16px;
  border-top: 1px solid #262626;
  background: rgba(255, 255, 255, 0.025);
  color: #fff;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.14em;
  transition:
    background-color 150ms ease,
    border-color 150ms ease,
    color 150ms ease;
}

.dossier-card:hover .dossier-card__cta,
.dossier-card:focus-visible .dossier-card__cta,
.dossier-card.is-focused .dossier-card__cta {
  border-color: rgba(103, 245, 122, 0.34);
  background: rgba(103, 245, 122, 0.1);
  color: var(--color-signal);
}

.dossier-card__cta-arrow {
  transition: transform 150ms ease;
}

.dossier-card:hover .dossier-card__cta-arrow,
.dossier-card:focus-visible .dossier-card__cta-arrow,
.dossier-card.is-focused .dossier-card__cta-arrow {
  transform: translateX(4px);
}

@media (prefers-reduced-motion: reduce) {
  .dossier-card,
  .dossier-card__cta,
  .dossier-card__cta-arrow {
    transition: none;
  }

  .dossier-card:hover,
  .dossier-card:focus-visible,
  .dossier-card.is-focused,
  .dossier-card:hover .dossier-card__cta-arrow,
  .dossier-card:focus-visible .dossier-card__cta-arrow,
  .dossier-card.is-focused .dossier-card__cta-arrow {
    transform: none;
  }
}

.index-module {
  position: relative;
  margin-top: 40px;
  overflow: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
  background: rgba(16, 16, 16, 0.5);
}

.index-module::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

.index-module__header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 48px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  color: #777;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 600;
  letter-spacing: 0.14em;
}

.index-module__header h2 {
  font: inherit;
}

.articles-index {
  margin-top: 48px;
}

@media (max-width: 639px) {
  .home-rail {
    width: min(100% - 24px, 800px);
    padding-top: 28px;
  }

  .identity-panel {
    flex-direction: column;
  }

  .identity-portrait {
    --portrait-hover-scale: 1.24;
    --portrait-scale: 1.22;

    order: -1;
    height: 324px;
  }

  .identity-portrait::after {
    background: linear-gradient(180deg, rgba(16, 16, 16, 0) 42%, #101010 100%);
  }

  .identity-copy {
    padding: 16px 14px 18px;
  }

  .identity-name {
    margin-top: 0;
  }

  .identity-facts {
    gap: 8px;
    margin-top: 16px;
  }

  .identity-role {
    font-size: var(--text-xs);
    letter-spacing: 0.08em;
  }

  .identity-role__location {
    margin-left: 6px;
    font-size: var(--text-2xs);
  }

  .identity-mission {
    font-size: var(--text-2xs);
  }

  /* Departure Mono runs wider than the body face, so the mission line no
     longer fits on one row at phone widths — let it wrap instead of clip. */
  .identity-mission__lead {
    text-wrap: balance;
  }

  .featured-work,
  .index-module {
    margin-top: 28px;
  }

  .featured-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .dossier-card {
    min-height: 0;
  }

  .articles-index {
    margin-top: 36px;
  }
}

@media (min-width: 1280px) {
  .home-rail {
    padding-bottom: 48px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .identity-panel::after,
  .index-module::after {
    animation: none;
  }

  .dossier-card,
  .dossier-card__image img {
    transition: none;
  }

  .identity-panel:hover .identity-portrait img,
  .identity-panel:focus-within .identity-portrait img {
    transform: scale(var(--portrait-scale));
  }
}
</style>
