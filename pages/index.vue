<script setup lang="ts">
import type { ProjectPreview } from "~/components/ProjectTooltip.vue";
import projectsJson from "~/data/projects.json";
import {
  isArticle,
  isExternalProjectHref,
  openProject,
  projectHref,
  projectMediaAlt,
} from "~/utils/projects";
import { SITE_DESCRIPTION, SITE_TITLE } from "~/utils/site";

usePageSeo({
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  pageType: "ProfilePage",
});

interface FeaturedSkill {
  iconSrc: string;
  name: string;
}

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

const focusedCard = ref<number | null>(null);
const cardRefs = ref<(HTMLElement | null)[]>([]);
const portraitHover = ref(false);

function bindCard(el: Element | null, index: number) {
  cardRefs.value[index] = el instanceof HTMLElement ? el : null;
}

function projectCounter(index: number) {
  return String(index + 1).padStart(3, "0");
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
  if (key === "ArrowRight" || key === "ArrowDown") moveCardFocus(1);
  if (key === "ArrowLeft" || key === "ArrowUp") moveCardFocus(-1);
});

function onKeydown(event: KeyboardEvent) {
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
  <div class="home-console">
    <div class="home-rail">
      <section class="identity-panel" aria-labelledby="identity-name">
        <div class="identity-copy">
          <h1 id="identity-name" class="identity-name">
            CHRISTOPHER<br />SANTANA
          </h1>

          <div class="identity-facts">
            <div>
              <p class="identity-role">FULL_STACK_ENGINEER</p>
            </div>
            <div>
              <p class="identity-mission">
                <span class="identity-mission__lead">
                  AI SYSTEMS, FRONTEND ARCHITECTURE, SEO &amp; DATA PIPELINES
                </span>
                <NuxtLink to="https://stockstotrade.com/">
                  // STOCKSTOTRADE
                </NuxtLink>
              </p>
            </div>
          </div>
        </div>

        <div
          class="identity-portrait"
          :class="{ 'is-hovered': portraitHover }"
          aria-hidden="true"
          @mouseenter="portraitHover = true"
          @mouseleave="portraitHover = false"
        >
          <PortraitPixelate :hovered="portraitHover" />
          <div class="identity-scanline" />
        </div>

        <HudCorners />
      </section>

      <section class="featured-work" aria-labelledby="featured-work-title">
        <div class="section-heading sr-only">
          <h2 id="featured-work-title">Featured projects</h2>
        </div>

        <ul class="featured-grid" role="list">
          <li
            v-for="(project, index) in featuredProjects"
            :key="project.slug"
            :ref="(el) => bindCard(el as Element | null, index)"
            v-reveal="index * 60"
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

                <div class="dossier-card__footer">
                  <span>{{ projectCounter(index) }}</span>
                </div>
              </div>
            </NuxtLink>
          </li>
        </ul>
      </section>

      <section class="index-module" aria-labelledby="tech-stack-title">
        <header class="index-module__header">
          <h2 id="tech-stack-title">TECH STACK</h2>
        </header>

        <!-- The list owns the reveal so one intersection drives the whole
             cascade; rows stagger off their grid row below. Two row vars
             because the grid drops to one column at phone widths. -->
        <ul class="stack-index" role="list" v-reveal>
          <li
            v-for="(skill, index) in featuredSkills"
            :key="skill.name"
            :style="{
              '--stack-row': Math.floor(index / 2),
              '--stack-row-narrow': index,
            }"
          >
            <span class="stack-index__label">
              <img :src="skill.iconSrc" alt="" width="18" height="18" />
              <strong>{{ skill.name }}</strong>
            </span>
          </li>
        </ul>
      </section>

      <section
        class="index-module articles-index"
        aria-labelledby="articles-index-title"
      >
        <header class="index-module__header">
          <h2 id="articles-index-title">ARTICLES</h2>
        </header>

        <ul role="list">
          <li
            v-for="(article, index) in articles"
            :key="article.slug"
            v-reveal="index * 60"
          >
            <NuxtLink
              :to="projectHref(article)"
              :external="isExternalProjectHref(article)"
              :target="isExternalProjectHref(article) ? '_blank' : undefined"
              :rel="
                isExternalProjectHref(article)
                  ? 'noopener noreferrer'
                  : undefined
              "
            >
              <span class="articles-index__thumb" aria-hidden="true">
                <img
                  v-if="article.image"
                  :src="article.image"
                  alt=""
                  loading="lazy"
                />
              </span>
              <span class="articles-index__copy">
                <strong>{{ article.name }}</strong>
                <small>READ ARTICLE</small>
              </span>
            </NuxtLink>
          </li>
        </ul>
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
}

.home-console::-webkit-scrollbar {
  display: none;
}

.home-rail {
  width: min(800px, calc(100% - 32px));
  margin-inline: auto;
  padding: 12px 0 72px;
}

.identity-panel {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 190px;
  min-height: 252px;
  overflow: hidden;
  /* Grain + tone are matched to the portrait plate so the whole card reads as
     one continuous surface instead of copy-panel-plus-photo. */
  background:
    var(--identity-grain),
    linear-gradient(90deg, rgba(255, 255, 255, 0.025), transparent 70%),
    #101010;
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
  background: repeating-linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.025) 0,
    rgba(255, 255, 255, 0.025) 1px,
    transparent 1px,
    transparent 4px
  );
  opacity: 0.65;
}

.identity-copy {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 22px 18px 20px;
}

.identity-name {
  margin-top: 10px;
  color: #fff;
  font-size: var(--text-display);
  font-weight: 600;
  letter-spacing: -0.025em;
  line-height: 0.86;
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
  position: relative;
  min-width: 0;
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

.identity-scanline {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background: repeating-linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.055) 0,
    rgba(255, 255, 255, 0.055) 1px,
    transparent 1px,
    transparent 3px
  );
  opacity: 0.35;
  animation: identity-scan-crawl 5s linear infinite;
  transition: opacity 320ms ease;
}

/* Bright band that sweeps down the portrait like a scanner beam. */
.identity-scanline::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(103, 245, 122, 0.12) 46%,
    rgba(255, 255, 255, 0.22) 50%,
    rgba(103, 245, 122, 0.12) 54%,
    transparent 100%
  );
  background-size: 100% 42%;
  background-repeat: no-repeat;
  mix-blend-mode: screen;
  animation: identity-scan-sweep 3.6s linear infinite;
}

/* Hovering the portrait clears the scan effects for a clean read. */
.identity-portrait.is-hovered .identity-scanline {
  opacity: 0;
}

@keyframes identity-scan-crawl {
  to {
    background-position: 0 30px;
  }
}

@keyframes identity-scan-sweep {
  0% {
    background-position: 0 -50%;
  }
  100% {
    background-position: 0 150%;
  }
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
    transform 150ms ease,
    background-color 150ms ease;
  --hud-corner-size: 16px;
  --hud-corner-inset: 0px;
}

.dossier-card:hover,
.dossier-card:focus-visible,
.dossier-card.is-focused {
  border-color: rgba(103, 245, 122, 0.72);
  background: #0a0a0a;
  outline: none;
  transform: translateY(-2px);
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
  width: 100%;
  /* Sources carry a 1px white edge top and bottom — bleed the image past the
     frame so the overflow clip eats it. */
  height: calc(100% + 2px);
  margin-block: -1px;
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
  gap: 6px;
  padding: 14px 16px 12px;
}

.dossier-card__body h3 {
  overflow: hidden;
  color: #fff;
  font-size: var(--text-sm);
  font-weight: 600;
  letter-spacing: -0.015em;
  line-height: 1.1;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.dossier-card__footer {
  display: flex;
  align-items: end;
  justify-content: flex-end;
  color: #3f3f3f;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.11em;
}

.index-module {
  position: relative;
  margin-top: 40px;
  overflow-x: hidden;
  background: rgba(16, 16, 16, 0.5);
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

.stack-index,
.articles-index > ul {
  position: relative;
  z-index: 1;
}

.stack-index {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

/* The <ul> carries the observer but not the motion — the rows do. */
.stack-index[data-reveal] {
  opacity: 1;
  transform: none;
  transition: none;
  will-change: auto;
}

.stack-index li {
  display: flex;
  min-height: 42px;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding: 0 12px;
  opacity: 0;
  transform: translateY(var(--scroll-reveal-distance));
  transition:
    opacity var(--scroll-reveal-dur) var(--scroll-reveal-ease)
      var(--stack-delay),
    transform var(--scroll-reveal-dur) var(--scroll-reveal-ease)
      var(--stack-delay);
  --stack-delay: calc(var(--stack-row, 0) * 70ms);
}

.stack-index[data-reveal="shown"] li {
  opacity: 1;
  transform: translateY(0);
}

.stack-index li:nth-child(odd) {
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}

.stack-index__label {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #d6d6d6;
  font-size: var(--text-xs);
  letter-spacing: 0.02em;
}

.stack-index__label img {
  filter: brightness(0) invert(1);
  opacity: 0.42;
}

.articles-index {
  margin-top: 48px;
}

.articles-index li {
  border-bottom: 1px solid rgba(255, 255, 255, 0.045);
}

.articles-index a {
  display: grid;
  grid-template-columns: 144px minmax(0, 1fr);
  align-items: center;
  gap: 20px;
  min-height: 104px;
  padding: 12px 0;
  color: #d6d6d6;
  text-decoration: none;
  transition:
    background-color 120ms ease,
    color 120ms ease;
}

.articles-index a:hover,
.articles-index a:focus-visible {
  background: rgba(255, 255, 255, 0.035);
  color: #fff;
  outline: none;
}

.articles-index__thumb {
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border: 1px solid #292929;
  background: #0b0b0b;
}

.articles-index__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.articles-index__copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 10px;
}

.articles-index strong {
  font-size: var(--text-sm);
  letter-spacing: 0.015em;
  line-height: 1.2;
  text-transform: uppercase;
}

.articles-index small {
  color: #919191;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.12em;
}

@media (max-width: 639px) {
  .home-rail {
    width: min(100% - 24px, 800px);
    padding-top: 10px;
  }

  .identity-panel {
    grid-template-columns: minmax(0, 1fr);
    min-height: 0;
  }

  .identity-portrait {
    order: -1;
    height: 168px;
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

  .stack-index {
    grid-template-columns: 1fr;
  }

  .stack-index li:nth-child(odd) {
    border-right: none;
  }

  .stack-index li {
    --stack-delay: calc(var(--stack-row-narrow, 0) * 45ms);
  }

  .articles-index {
    margin-top: 36px;
  }

  .articles-index a {
    grid-template-columns: 96px minmax(0, 1fr);
    gap: 12px;
    min-height: 84px;
  }

  .articles-index strong {
    font-size: var(--text-sm);
  }
}

@media (min-width: 1280px) {
  .home-rail {
    padding-bottom: 48px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .identity-scanline,
  .identity-scanline::after {
    animation: none;
  }

  .stack-index li {
    opacity: 1;
    transform: none;
    transition: none;
  }

  .dossier-card,
  .dossier-card__image img,
  .articles-index a {
    transition: none;
  }

  .dossier-card:hover,
  .dossier-card:focus-visible,
  .dossier-card.is-focused {
    transform: none;
  }
}
</style>
