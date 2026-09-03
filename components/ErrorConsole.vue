<script setup lang="ts">
const props = defineProps<{
  statusCode: number;
  requestPath?: string;
  detail?: string;
}>();

const emit = defineEmits<{
  home: [];
  projects: [];
  retry: [];
}>();

type SecondaryAction = "projects" | "retry";

interface ErrorCopy {
  kicker: string;
  title: string;
  signal: string;
  qualifier: string;
  status: string;
  body: string;
  secondary: { label: string; action: SecondaryAction };
}

const notFoundCopy: ErrorCopy = {
  kicker: "ERR_404",
  title: "Page not found",
  signal: "PAGE_NOT_FOUND",
  qualifier: "COORDINATES_UNKNOWN",
  status: "NOT_FOUND",
  body: "The path you requested isn't mapped on this system. Confirm the URL, or return to the console.",
  secondary: { label: "VIEW_PROJECTS", action: "projects" },
};

const faultCopy: ErrorCopy = {
  kicker: "ERR_500",
  title: "Server error",
  signal: "INTERNAL_FAULT",
  qualifier: "SERVER_EXCEPTION",
  status: "FAULT",
  body: "Something on this side failed. The console is still here — return home, or retry the request.",
  secondary: { label: "RETRY_REQUEST", action: "retry" },
};

const copy = computed<ErrorCopy>(() => {
  if (props.statusCode === 404) return notFoundCopy;
  if (props.statusCode >= 500) {
    return {
      ...faultCopy,
      kicker: `ERR_${props.statusCode}`,
    };
  }
  return {
    kicker: `ERR_${props.statusCode}`,
    title: "Request failed",
    signal: "REQUEST_FAILED",
    qualifier: "UNEXPECTED_STATUS",
    status: "FAILED",
    body: "This request didn't complete. Return to the console and try again.",
    secondary: { label: "VIEW_PROJECTS", action: "projects" },
  };
});

const codeLabel = computed(() => String(props.statusCode).padStart(3, "0"));

const pathLabel = computed(() => {
  const path = props.requestPath?.trim();
  if (!path) return null;
  try {
    const url = new URL(path, "https://chsantana.com");
    return url.pathname + url.search;
  } catch {
    return path;
  }
});

// Narrowed rather than passed through: `emit` is three separate one-arg
// signatures, and a union of their names matches none of them.
function onSecondary() {
  if (copy.value.secondary.action === "projects") emit("projects");
  else emit("retry");
}
</script>

<template>
  <div class="error-console">
    <div class="error-rail">
      <section
        class="error-panel"
        :aria-labelledby="`error-title-${statusCode}`"
      >
        <header class="error-panel__header">
          <span class="hud-label">// {{ copy.kicker }}</span>
          <span class="error-panel__status text-label-data">
            STATUS&nbsp;&nbsp;{{ copy.status }}
          </span>
        </header>

        <div class="error-panel__body">
          <p class="error-panel__kicker text-label-data" v-reveal="0">
            {{ copy.signal }}
            <span class="error-panel__qualifier"
              >// {{ copy.qualifier }}</span
            >
          </p>

          <h1 :id="`error-title-${statusCode}`" class="error-panel__code" v-reveal="40">
            <span class="sr-only">{{ copy.title }}</span>
            <span aria-hidden="true">{{ codeLabel }}</span>
          </h1>

          <p class="error-panel__copy text-body-compact" v-reveal="80">
            {{ copy.body }}
          </p>

          <dl v-if="pathLabel" class="error-panel__meta" v-reveal="120">
            <div>
              <dt>PATH</dt>
              <dd>{{ pathLabel }}</dd>
            </div>
            <div>
              <dt>CODE</dt>
              <dd>{{ codeLabel }}</dd>
            </div>
          </dl>

          <p v-if="detail" class="error-panel__detail text-label-data">
            {{ detail }}
          </p>
        </div>

        <div class="error-panel__actions">
          <button
            type="button"
            class="error-panel__cta"
            @click="emit('home')"
          >
            RETURN_HOME
            <span class="error-panel__cta-arrow" aria-hidden="true">&rarr;</span>
          </button>
        </div>

        <HudCorners />
      </section>

      <button
        type="button"
        class="error-secondary text-label-data"
        @click="onSecondary"
      >
        {{ copy.secondary.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.error-console {
  /* Same grain plate as the home identity panel so this reads as the
     same console, not a separate error theme. */
  --identity-grain: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23g)'/%3E%3C/svg%3E");
  display: flex;
  min-height: 100%;
  align-items: center;
  align-items: safe center;
  justify-content: center;
  padding: var(--space-6) 0 var(--space-12);
}

.error-rail {
  display: flex;
  width: min(800px, calc(100% - 32px));
  flex-direction: column;
  align-items: stretch;
  gap: var(--space-4);
}

.error-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background:
    var(--identity-grain),
    linear-gradient(90deg, rgba(255, 255, 255, 0.025), transparent 70%),
    var(--color-panel);
  background-size:
    180px 180px,
    auto,
    auto;
  background-blend-mode: overlay, normal, normal;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.025);
  --hud-corner-size: 14px;
  --hud-corner-inset: 0px;
}

.error-panel::after {
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

.error-panel__header {
  position: relative;
  z-index: 2;
  display: flex;
  min-height: 48px;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: 0 var(--space-6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.error-panel__status {
  color: var(--color-muted);
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.error-panel__body {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-8) var(--space-6) var(--space-6);
  text-align: center;
}

.error-panel__kicker {
  color: white;
  font-size: var(--text-sm);
  font-weight: 600;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.error-panel__qualifier {
  margin-left: var(--space-2);
  color: var(--color-prose);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 400;
  letter-spacing: 0.08em;
}

.error-panel__code {
  margin-top: var(--space-4);
  color: white;
  font-family: var(--font-sans);
  font-size: clamp(3.5rem, 12vh + 6vw, 7rem);
  font-weight: 600;
  line-height: 0.85;
  letter-spacing: -0.05em;
  text-transform: uppercase;
}

.error-panel__copy {
  max-width: 52ch;
  margin-top: var(--space-6);
  margin-inline: auto;
  color: var(--color-prose);
  text-wrap: pretty;
}

.error-panel__meta {
  display: grid;
  grid-template-columns: auto auto;
  justify-content: center;
  gap: var(--space-4) var(--space-8);
  margin-top: var(--space-6);
}

.error-panel__meta div {
  display: grid;
  gap: var(--space-1);
  min-width: 0;
}

.error-panel__meta dt {
  color: var(--color-muted);
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.error-panel__meta dd {
  overflow: hidden;
  color: var(--color-body);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.04em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.error-panel__detail {
  margin-top: var(--space-4);
  color: var(--color-muted);
  overflow-wrap: anywhere;
}

.error-panel__actions {
  position: relative;
  z-index: 2;
  margin-top: auto;
}

.error-panel__cta {
  display: flex;
  min-height: 44px;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-6);
  border-top: 1px solid var(--color-surface);
  background: rgba(255, 255, 255, 0.025);
  color: white;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  transition:
    background-color 150ms ease,
    border-color 150ms ease,
    color 150ms ease;
}

.error-panel__cta:hover,
.error-panel__cta:focus-visible {
  border-color: rgba(103, 245, 122, 0.34);
  background: rgba(103, 245, 122, 0.1);
  color: var(--color-signal);
  outline: none;
}

.error-panel__cta-arrow {
  transition: transform 150ms ease;
}

.error-panel__cta:hover .error-panel__cta-arrow,
.error-panel__cta:focus-visible .error-panel__cta-arrow {
  transform: translateX(4px);
}

.error-secondary {
  align-self: center;
  min-height: 44px;
  padding: 0 var(--space-1);
  color: var(--color-muted);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  text-decoration: underline;
  text-decoration-color: rgba(255, 255, 255, 0.28);
  text-underline-offset: 4px;
  transition: color 150ms ease;
}

.error-secondary:hover,
.error-secondary:focus-visible {
  color: white;
  outline: none;
}

@media (max-height: 700px) {
  .error-console {
    padding: var(--space-3) 0 var(--space-6);
  }

  .error-panel__body {
    padding-top: var(--space-6);
    padding-bottom: var(--space-4);
  }

  .error-panel__code {
    margin-top: var(--space-2);
  }

  .error-panel__copy {
    margin-top: var(--space-3);
  }

  .error-panel__meta {
    margin-top: var(--space-4);
  }
}

@media (max-width: 639px) {
  .error-console {
    padding: var(--space-3) 0 var(--space-8);
  }

  .error-rail {
    width: min(100% - 24px, 800px);
  }

  .error-panel__header,
  .error-panel__body {
    padding-inline: var(--space-4);
  }

  .error-panel__body {
    padding-top: var(--space-6);
    padding-bottom: var(--space-6);
  }

  .error-panel__code {
    margin-top: var(--space-3);
  }

  .error-panel__kicker {
    font-size: var(--text-xs);
    letter-spacing: 0.08em;
  }

  .error-panel__qualifier {
    margin-left: var(--space-2);
    font-size: var(--text-2xs);
  }

  .error-panel__meta {
    grid-template-columns: 1fr;
    justify-items: center;
    gap: var(--space-3);
  }

  .error-panel__cta {
    padding-inline: var(--space-4);
  }
}

@media (prefers-reduced-motion: reduce) {
  .error-panel::after {
    animation: none;
  }

  .error-panel__cta,
  .error-panel__cta-arrow,
  .error-secondary {
    transition: none;
  }

  .error-panel__cta:hover .error-panel__cta-arrow,
  .error-panel__cta:focus-visible .error-panel__cta-arrow {
    transform: none;
  }
}
</style>
