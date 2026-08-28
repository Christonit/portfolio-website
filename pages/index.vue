<script setup lang="ts">
import type { ProjectPreview } from "~/components/ProjectTooltip.vue";
import projectsJson from "~/data/projects.json";
import {
  isArticle,
  isExternalProjectHref,
  openProject,
  projectHref,
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
                CURRENTLY AT<br />
                <NuxtLink to="/project/stockstotrade">
                  STOCKSTOTRADE
                </NuxtLink>
              </p>
            </div>
          </div>
        </div>

        <div class="identity-portrait" aria-hidden="true">
          <img src="/images/og-image.webp" alt="" />
          <img
            class="identity-portrait__color"
            src="/images/og-image.webp"
            alt=""
          />
          <div class="identity-scanline" />
        </div>

        <div class="corner-tl-w" />
        <div class="corner-bl-w" />
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
          >
            <NuxtLink
              :to="projectHref(project)"
              :external="isExternalProjectHref(project)"
              :target="isExternalProjectHref(project) ? '_blank' : undefined"
              :rel="isExternalProjectHref(project) ? 'noopener noreferrer' : undefined"
              class="dossier-card"
              :class="{ 'is-focused': focusedCard === index }"
            >
              <span
                class="dossier-card__corner dossier-card__corner--tl"
                aria-hidden="true"
              />
              <span
                class="dossier-card__corner dossier-card__corner--br"
                aria-hidden="true"
              />

              <div class="dossier-card__image">
                <img
                  v-if="project.image"
                  :src="project.image"
                  :alt="`${project.name} featured work preview`"
                  loading="lazy"
                  decoding="async"
                />
                <span v-else class="material-symbols-outlined" aria-hidden="true">
                  {{ project.icon || "deployed_code" }}
                </span>
              </div>

              <div class="dossier-card__body">
                <h3>{{ project.name }}</h3>

                <div class="dossier-card__footer">
                  <span>{{ isArticle(project) ? "READ_ARTICLE" : "VIEW_PROJECT" }}</span>
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

        <ul class="stack-index" role="list">
          <li v-for="skill in featuredSkills" :key="skill.name">
            <span class="stack-index__label">
              <img :src="skill.iconSrc" alt="" width="18" height="18" />
              <strong>{{ skill.name }}</strong>
            </span>
            <span class="stack-index__rule" aria-hidden="true" />
          </li>
        </ul>
      </section>

      <section class="index-module articles-index" aria-labelledby="articles-index-title">
        <header class="index-module__header">
          <h2 id="articles-index-title">ARTICLES</h2>
        </header>

        <ul role="list">
          <li v-for="article in articles" :key="article.slug">
            <NuxtLink
              :to="projectHref(article)"
              :external="isExternalProjectHref(article)"
              :target="isExternalProjectHref(article) ? '_blank' : undefined"
              :rel="isExternalProjectHref(article) ? 'noopener noreferrer' : undefined"
            >
              <span class="articles-index__thumb" aria-hidden="true">
                <img v-if="article.image" :src="article.image" alt="" loading="lazy" />
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
  height: 100%;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
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
  background: #0a0a0a;
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
  font-size: clamp(2.15rem, 7.2vw, 3rem);
  font-weight: 650;
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
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.13em;
}

.identity-mission {
  margin-top: 3px;
  color: #c6c6c6;
  font-size: var(--font-size-min);
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
  min-width: 0;
  overflow: hidden;
  background: #0a0a0a;
}

.identity-portrait::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #0d0d0d 0%, transparent 26%, transparent 76%, #0d0d0d 100%);
  pointer-events: none;
}

.identity-portrait img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% center;
  filter: grayscale(0.68) contrast(1.08) brightness(0.92);
  transform: scale(var(--portrait-scale));
  transition: transform 180ms ease-out;
}

.identity-portrait .identity-portrait__color {
  position: absolute;
  inset: 0;
  z-index: 1;
  filter: saturate(1.06) contrast(1.04) brightness(0.98);
  opacity: 0;
  transition:
    opacity 180ms ease-out,
    transform 180ms ease-out;
}

.identity-panel:hover .identity-portrait img,
.identity-panel:focus-within .identity-portrait img {
  transform: scale(var(--portrait-hover-scale)) translate3d(-1.5%, 0, 0);
}

.identity-panel:hover .identity-portrait__color,
.identity-panel:focus-within .identity-portrait__color {
  opacity: 1;
}

.identity-scanline {
  position: absolute;
  inset: 0;
  z-index: 2;
  background: repeating-linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.055) 0,
    rgba(255, 255, 255, 0.055) 1px,
    transparent 1px,
    transparent 3px
  );
  opacity: 0.35;
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
  min-height: 250px;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #292929;
  background: rgba(11, 11, 11, 0.88);
  color: #e2e2e2;
  text-decoration: none;
  transition:
    border-color 150ms ease,
    background-color 150ms ease;
}

.dossier-card:hover,
.dossier-card:focus-visible,
.dossier-card.is-focused {
  border-color: rgba(103, 245, 122, 0.72);
  background: #0a0a0a;
  outline: none;
}

.dossier-card__corner {
  position: absolute;
  z-index: 3;
  width: 14px;
  height: 14px;
  border-color: #67f57a;
  opacity: 0.42;
  pointer-events: none;
  transition: opacity 150ms ease;
}

.dossier-card__corner--tl {
  top: -1px;
  left: -1px;
  border-top: 2px solid #67f57a;
  border-left: 2px solid #67f57a;
}

.dossier-card__corner--br {
  right: -1px;
  bottom: -1px;
  border-right: 2px solid #67f57a;
  border-bottom: 2px solid #67f57a;
}

.dossier-card:hover .dossier-card__corner,
.dossier-card:focus-visible .dossier-card__corner,
.dossier-card.is-focused .dossier-card__corner {
  opacity: 1;
}

.dossier-card__image {
  position: relative;
  display: flex;
  aspect-ratio: 16 / 8.5;
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
  height: 100%;
  object-fit: cover;
  object-position: top center;
}

.dossier-card__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 12px;
  min-height: 92px;
  padding: 16px 16px 14px;
}

.dossier-card__body h3 {
  overflow: hidden;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.015em;
  line-height: 1.1;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.dossier-card__footer {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 8px;
  margin-top: auto;
  padding-top: 3px;
  color: #fff;
  font-family: monospace;
  font-size: var(--font-size-min);
  font-weight: 700;
  letter-spacing: 0.11em;
}

.dossier-card__footer span:last-child {
  color: #3f3f3f;
  font-weight: 400;
}

.index-module {
  position: relative;
  margin-top: 40px;
  overflow: hidden;
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
  font-family: monospace;
  font-size: 16px;
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

.stack-index li {
  display: flex;
  min-height: 42px;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding: 0 12px;
}

.stack-index__label {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #d6d6d6;
  font-size: 12px;
  letter-spacing: 0.02em;
}

.stack-index__label img {
  filter: brightness(0) invert(1);
  opacity: 0.42;
}

.stack-index__rule {
  width: 44px;
  height: 1px;
  background: #343434;
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
  transition: background-color 120ms ease, color 120ms ease;
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
  font-size: 16px;
  letter-spacing: 0.015em;
  line-height: 1.2;
  text-transform: uppercase;
}

.articles-index small {
  color: #919191;
  font-family: monospace;
  font-size: var(--font-size-min);
  letter-spacing: 0.12em;
}

@media (max-width: 639px) {
  .home-rail {
    width: min(100% - 24px, 800px);
    padding-top: 10px;
  }

  .identity-panel {
    grid-template-columns: minmax(0, 1fr) 34%;
    min-height: 238px;
  }

  .identity-copy {
    padding: 18px 12px 16px;
  }

  .identity-name {
    font-size: clamp(1.75rem, 9.3vw, 2.5rem);
  }

  .identity-role {
    font-size: var(--font-size-min);
    letter-spacing: 0.08em;
  }

  .identity-mission {
    font-size: var(--font-size-min);
  }

  .identity-portrait img {
    object-position: 49% center;
  }

  .identity-portrait {
    --portrait-hover-scale: 1.37;
    --portrait-scale: 1.35;
  }

  .featured-work,
  .index-module {
    margin-top: 28px;
  }

  .featured-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .dossier-card {
    min-height: 0;
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
    font-size: 14px;
  }
}

@media (min-width: 1280px) {
  .home-rail {
    padding-bottom: 48px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .dossier-card,
  .dossier-card__corner,
  .identity-portrait img,
  .articles-index a {
    transition: none;
  }

  .identity-panel:hover .identity-portrait img,
  .identity-panel:focus-within .identity-portrait img {
    transform: scale(var(--portrait-scale));
  }
}
</style>
