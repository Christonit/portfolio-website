<script setup lang="ts">
import type { TestimonialContent } from "~/sanity/mapPortfolio";

const props = defineProps<{ testimonials: TestimonialContent[] }>();
const activeIndex = ref(0);

const active = computed(() => props.testimonials[activeIndex.value]);

watch(
  () => props.testimonials.length,
  (length) => {
    if (activeIndex.value >= length) activeIndex.value = 0;
  },
);

function select(index: number) {
  activeIndex.value = index;
}

function move(direction: number) {
  const count = props.testimonials.length;
  if (!count) return;
  activeIndex.value = (activeIndex.value + direction + count) % count;
}

function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
</script>

<template>
  <section
    class="testimonial-module"
    aria-labelledby="testimonials-title"
    @keydown.left.prevent="move(-1)"
    @keydown.right.prevent="move(1)"
  >
    <h2 id="testimonials-title" class="sr-only">Testimonials</h2>

    <div v-if="active" class="testimonial-stage">
      <button
        v-if="testimonials.length > 1"
        type="button"
        class="testimonial-stage__arrow is-prev"
        aria-label="Previous testimonial"
        @click="move(-1)"
      >
        ←
      </button>

      <Transition name="testimonial-swap" mode="out-in">
        <figure :key="active.id" class="testimonial-quote">
          <blockquote>“{{ active.quote }}”</blockquote>
          <figcaption>
            <img
              :src="`${active.photoUrl}?w=96&h=96&fit=crop&auto=format`"
              :alt="active.photoAlt"
              width="48"
              height="48"
              loading="lazy"
            />
            <span class="testimonial-quote__identity">
              <a
                :href="active.linkedinUrl"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ active.name }}
              </a>
              <span v-if="active.role">{{ active.role }}</span>
              <a
                v-else-if="active.websiteUrl"
                :href="active.websiteUrl"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ hostname(active.websiteUrl) }}
              </a>
            </span>
          </figcaption>
        </figure>
      </Transition>

      <button
        v-if="testimonials.length > 1"
        type="button"
        class="testimonial-stage__arrow is-next"
        aria-label="Next testimonial"
        @click="move(1)"
      >
        →
      </button>
    </div>

    <div v-else class="testimonial-empty">
      <p>Worked with me? Add your perspective to the record.</p>
      <NuxtLink to="/testimonial">
        SUBMIT_A_TESTIMONIAL <span aria-hidden="true">→</span>
      </NuxtLink>
    </div>

    <div
      v-if="testimonials.length > 1"
      class="testimonial-dots"
      role="group"
      aria-label="Choose testimonial"
    >
      <button
        v-for="(testimonial, index) in testimonials"
        :key="testimonial.id"
        type="button"
        :class="{ 'is-active': index === activeIndex }"
        :aria-label="`Show testimonial from ${testimonial.name}`"
        :aria-current="index === activeIndex ? 'true' : undefined"
        @click="select(index)"
      />
    </div>

    <div v-if="testimonials.length" class="testimonial-module__share-row">
      <NuxtLink to="/testimonial" class="testimonial-module__share">
        SHARE_FEEDBACK <span aria-hidden="true">→</span>
      </NuxtLink>
    </div>
  </section>
</template>

<style scoped>
.testimonial-module {
  position: relative;
  margin-top: var(--space-8);
  border: 1px solid var(--color-rule);
  background:
    linear-gradient(135deg, rgb(var(--color-surface-rgb) / 14%), transparent 45%),
    var(--color-panel);
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 2%);
}

.testimonial-module__share-row {
  display: flex;
  justify-content: center;
  border-top: 1px solid var(--color-rule);
  padding: var(--space-3) var(--space-4) var(--space-4);
}

.testimonial-module__share {
  color: var(--color-muted);
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  letter-spacing: 0.14em;
  transition: color 150ms ease;
}

.testimonial-module__share:hover,
.testimonial-module__share:focus-visible {
  color: var(--color-signal);
  outline: none;
}

.testimonial-stage {
  position: relative;
  display: grid;
  min-height: 280px;
  place-items: center;
  padding: var(--space-10) var(--space-12) var(--space-8);
}

.testimonial-quote {
  display: grid;
  width: min(100%, 34rem);
  gap: var(--space-6);
  justify-items: center;
  margin: 0;
  text-align: center;
}

.testimonial-quote blockquote {
  color: white;
  font-family: var(--font-sans);
  font-size: var(--text-lg);
  line-height: 1.5;
  text-wrap: balance;
}

.testimonial-quote figcaption {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  text-align: left;
}

.testimonial-quote img {
  width: 3rem;
  height: 3rem;
  flex: 0 0 auto;
  border: 1px solid var(--color-rule);
  border-radius: 50%;
  object-fit: cover;
}

.testimonial-quote__identity {
  display: grid;
  gap: var(--space-1);
}

.testimonial-quote__identity > a:first-child {
  color: var(--color-body);
  font-size: var(--text-sm);
}

.testimonial-quote__identity > :last-child {
  color: var(--color-muted);
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  letter-spacing: 0.04em;
}

.testimonial-quote__identity a:hover,
.testimonial-quote__identity a:focus-visible {
  color: var(--color-signal);
  outline: none;
}

.testimonial-stage__arrow {
  position: absolute;
  top: 50%;
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  place-items: center;
  border: 1px solid var(--color-rule);
  color: var(--color-muted);
  font-family: var(--font-mono);
  transform: translateY(-50%);
  transition:
    border-color 150ms ease,
    color 150ms ease;
}

.testimonial-stage__arrow.is-prev {
  left: var(--space-4);
}

.testimonial-stage__arrow.is-next {
  right: var(--space-4);
}

.testimonial-stage__arrow:hover,
.testimonial-stage__arrow:focus-visible {
  border-color: var(--color-signal);
  color: var(--color-signal);
  outline: none;
}

.testimonial-dots {
  display: flex;
  justify-content: center;
  gap: var(--space-2);
  padding: 0 var(--space-4) var(--space-5);
}

.testimonial-dots button {
  width: 1.5rem;
  height: 1rem;
  position: relative;
}

.testimonial-dots button::after {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  border: 1px solid var(--color-muted);
  background: transparent;
  content: "";
  transform: translate(-50%, -50%);
}

.testimonial-dots button.is-active::after {
  border-color: var(--color-signal);
  background: var(--color-signal);
}

.testimonial-dots button:focus-visible {
  outline: 1px solid var(--color-signal);
}

.testimonial-empty {
  display: grid;
  min-height: 220px;
  place-items: center;
  align-content: center;
  gap: var(--space-5);
  padding: var(--space-8);
  color: var(--color-prose);
  text-align: center;
}

.testimonial-empty a {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  border: 1px solid var(--color-signal);
  color: var(--color-signal);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.12em;
  padding: var(--space-3) var(--space-4);
}

.testimonial-empty a:hover,
.testimonial-empty a:focus-visible {
  background: var(--color-signal);
  color: var(--color-canvas);
  outline: none;
}

.testimonial-swap-enter-active,
.testimonial-swap-leave-active {
  transition:
    opacity 160ms ease,
    transform 160ms ease;
}

.testimonial-swap-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.testimonial-swap-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

@media (max-width: 639px) {
  .testimonial-stage {
    min-height: 300px;
    padding: var(--space-8) var(--space-6);
  }

  .testimonial-quote blockquote {
    font-size: var(--text-base);
  }

  .testimonial-stage__arrow {
    top: auto;
    bottom: var(--space-3);
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .testimonial-swap-enter-active,
  .testimonial-swap-leave-active,
  .testimonial-module__share,
  .testimonial-stage__arrow {
    transition: none;
  }
}
</style>
