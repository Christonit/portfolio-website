<script setup lang="ts">
import { pageTitle } from "~/utils/site";

useSeoMeta({
  robots: "noindex, nofollow",
});

usePageSeo({
  title: pageTitle("Share Feedback"),
  description:
    "Leave a testimonial about working with Christopher Santana. Submissions are reviewed before they appear on the site.",
  pageType: "CollectionPage",
});
</script>

<template>
  <div class="testimonial-rail">
    <header class="flex flex-col gap-4 pt-2">
      <span class="hud-label">// TESTIMONIAL</span>
      <h1 class="hud-title">SHARE YOUR PERSPECTIVE</h1>
      <p class="testimonial-lede text-body-compact text-muted">
        Add a short note about working together. Submissions are reviewed
        before they appear on the site.
      </p>
    </header>

    <TestimonialForm />
  </div>
</template>

<style scoped>
.testimonial-rail {
  display: flex;
  width: min(800px, calc(100% - 32px));
  flex-direction: column;
  gap: var(--space-8);
  margin-inline: auto;
  padding-top: var(--space-4);
  padding-bottom: var(--space-24);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.testimonial-rail::-webkit-scrollbar {
  display: none;
}

.testimonial-lede {
  max-width: 60ch;
  text-wrap: pretty;
}

@media (min-width: 1280px) {
  .testimonial-rail {
    height: 100%;
    overflow-y: auto;
    padding-bottom: var(--space-8);
  }
}

@media (max-width: 639px) {
  .testimonial-rail {
    width: min(800px, calc(100% - 24px));
  }
}
</style>
