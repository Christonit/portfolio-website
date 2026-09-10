<script setup lang="ts">
import { EMAIL_ADDRESS, EMAIL_URL } from "~/utils/site";

type SubmitState = "idle" | "sending" | "sent" | "error";

const open = useContactSheetOpen();
const panelRef = ref<HTMLElement | null>(null);
const state = ref<SubmitState>("idle");
const feedback = ref("");
let toastTimer: number | undefined;

function dismissToast() {
  window.clearTimeout(toastTimer);
  feedback.value = "";
}

function showToast(message: string) {
  dismissToast();
  feedback.value = message;
  toastTimer = window.setTimeout(dismissToast, 5000);
}

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "textarea:not([disabled])",
].join(",");

function close() {
  if (state.value === "sending") return;
  closeContactSheet();
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    event.preventDefault();
    close();
    return;
  }
  if (event.key !== "Tab") return;

  const focusable = Array.from(
    panelRef.value?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
  ).filter((element) => element.offsetParent !== null);
  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first?.focus();
  }
}

watch(open, async (isOpen) => {
  if (!isOpen) return;
  state.value = "idle";
  dismissToast();
  await nextTick();
  panelRef.value?.querySelector<HTMLInputElement>("#contact-name")?.focus();
});

onBeforeUnmount(() => window.clearTimeout(toastTimer));

async function submit(event: Event) {
  const form = event.currentTarget as HTMLFormElement;
  state.value = "sending";
  dismissToast();

  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      throw new Error(
        body?.message ??
          (response.status === 429
            ? "Too many attempts. Please wait a minute and try again."
            : "Your message could not be sent."),
      );
    }

    form.reset();
    state.value = "sent";
    showToast("Message sent. I’ll get back to you soon.");
    closeContactSheet();
  } catch (error) {
    state.value = "error";
    showToast(
      error instanceof Error
        ? error.message
        : "Your message could not be sent. Please try again.",
    );
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="contact-sheet" @after-leave="restoreContactSheetFocus">
      <div v-if="open" class="contact-sheet" @keydown="onKeydown">
        <button
          type="button"
          class="contact-sheet__scrim"
          aria-label="Close contact form"
          :disabled="state === 'sending'"
          @click="close"
        />

        <aside
          ref="panelRef"
          class="contact-sheet__panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-title"
          tabindex="-1"
        >
          <header class="contact-sheet__header">
            <div>
              <p
                class="text-label-data uppercase tracking-[0.18em] text-signal"
              >
                // CONTACT
              </p>
              <h2
                id="contact-title"
                class="mt-2 !text-xl text-heading text-white"
              >
                Get in touch.
              </h2>
            </div>

            <button
              type="button"
              class="contact-sheet__close"
              aria-label="Close contact form"
              :disabled="state === 'sending'"
              @click="close"
            >
              <span aria-hidden="true">×</span>
            </button>
          </header>

          <div class="contact-sheet__body">
            <p class="text-sm text-prose">
              If you’ve got a role or a project, tell me what you need. I’ll
              read it and get back to you.
            </p>

            <form class="contact-form" @submit.prevent="submit">
              <label class="contact-field">
                <span>Name <b aria-hidden="true">*</b></span>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  autocomplete="name"
                  maxlength="80"
                  required
                />
              </label>

              <label class="contact-field">
                <span>Email <b aria-hidden="true">*</b></span>
                <input
                  name="email"
                  type="email"
                  autocomplete="email"
                  maxlength="254"
                  required
                />
              </label>

              <label class="contact-field">
                <span>LinkedIn <b aria-hidden="true">*</b></span>
                <input
                  name="linkedin"
                  type="url"
                  inputmode="url"
                  autocomplete="url"
                  placeholder="https://linkedin.com/in/..."
                  maxlength="300"
                  required
                />
              </label>

              <label class="contact-field">
                <span>Website <em>optional</em></span>
                <input
                  name="website"
                  type="url"
                  inputmode="url"
                  placeholder="https://..."
                  maxlength="300"
                />
              </label>

              <label class="contact-field">
                <span
                  >What are you working on? <b aria-hidden="true">*</b></span
                >
                <textarea
                  name="description"
                  rows="5"
                  maxlength="1500"
                  placeholder="The brief, not the novel."
                  required
                />
              </label>

              <label class="contact-form__trap" aria-hidden="true">
                Company
                <input
                  name="company"
                  type="text"
                  tabindex="-1"
                  autocomplete="off"
                />
              </label>

              <button
                type="submit"
                class="contact-form__submit"
                :disabled="state === 'sending'"
              >
                {{ state === "sending" ? "SENDING..." : "SEND_MESSAGE" }}
                <span aria-hidden="true">→</span>
              </button>

              <p class="contact-sheet__fallback">
                I’d rather type this in Mail.
                <a :href="EMAIL_URL">{{ EMAIL_ADDRESS }}</a>
              </p>
            </form>
          </div>
        </aside>
      </div>
    </Transition>

    <Transition name="contact-toast">
      <div
        v-if="feedback"
        class="contact-toast"
        :class="{ 'is-error': state === 'error' }"
        :role="state === 'error' ? 'alert' : 'status'"
        aria-live="polite"
      >
        <span>{{ feedback }}</span>
        <button
          type="button"
          aria-label="Dismiss notification"
          @click="dismissToast"
        >
          ×
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.contact-sheet {
  position: fixed;
  inset: 0;
  z-index: var(--z-contact-sheet);
}

.contact-sheet__scrim {
  position: absolute;
  inset: 0;
  width: 100%;
  border: 0;
  background: rgb(0 0 0 / 72%);
  cursor: default;
}

.contact-sheet__panel {
  position: absolute;
  inset: 0;
  display: flex;
  min-width: 0;
  flex-direction: column;
  overflow: hidden;
  border-left: 1px solid rgb(255 255 255 / 20%);
  background: rgb(var(--color-panel-rgb) / 98%);
  box-shadow: -24px 0 80px rgb(0 0 0 / 55%);
  outline: none;
}

.contact-sheet__header {
  display: flex;
  flex: 0 0 auto;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  border-bottom: 1px solid rgb(255 255 255 / 14%);
  padding: var(--space-4);
}

.contact-sheet__close {
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid rgb(255 255 255 / 25%);
  color: var(--color-muted);
  font: 400 1.5rem/1 var(--font-sans);
  transition:
    border-color 150ms ease,
    color 150ms ease;
}

.contact-sheet__close:hover,
.contact-sheet__close:focus-visible {
  border-color: var(--color-signal);
  color: var(--color-signal);
  outline: none;
}

.contact-sheet__close:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.contact-sheet__body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: var(--space-6) var(--space-4) var(--space-8);
}

.contact-form {
  display: grid;
  gap: var(--space-4);
  margin-top: var(--space-6);
}

.contact-field {
  display: grid;
  gap: var(--space-2);
}

.contact-field > span {
  color: var(--color-body);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.contact-field b {
  color: var(--color-signal);
  font-weight: 400;
}

.contact-field em {
  color: var(--color-muted);
  font-style: normal;
  letter-spacing: 0.06em;
  text-transform: lowercase;
}

.contact-field :is(input, textarea) {
  width: 100%;
  border: 1px solid var(--color-rule);
  background: var(--color-canvas);
  color: white;
  font-size: var(--text-base);
  outline: none;
  padding: var(--space-3);
  transition:
    border-color 150ms ease,
    box-shadow 150ms ease;
}

.contact-field textarea {
  min-height: 8rem;
  resize: vertical;
}

.contact-field :is(input, textarea)::placeholder {
  color: var(--color-muted);
}

.contact-field :is(input, textarea):focus-visible {
  border-color: var(--color-signal);
  box-shadow: inset 3px 0 0 var(--color-signal);
}

.contact-form__trap {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

.contact-form__submit {
  display: flex;
  min-height: 3rem;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  border: 1px solid var(--color-signal);
  background: var(--color-signal);
  color: var(--color-canvas);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.18em;
  padding: var(--space-3) var(--space-4);
  transition:
    background-color 150ms ease,
    color 150ms ease;
}

.contact-form__submit:hover,
.contact-form__submit:focus-visible {
  background: transparent;
  color: var(--color-signal);
  outline: none;
}

.contact-form__submit:disabled {
  cursor: wait;
  opacity: 0.55;
}

.contact-sheet__fallback {
  color: var(--color-muted);
  font-size: var(--text-sm);
}

.contact-sheet__fallback a {
  color: var(--color-body);
  text-decoration: underline;
  text-decoration-color: var(--color-signal);
  text-underline-offset: 4px;
}

.contact-sheet__fallback a:hover,
.contact-sheet__fallback a:focus-visible {
  color: var(--color-signal);
  outline: none;
}

.contact-toast {
  position: fixed;
  top: var(--space-4);
  left: 50%;
  z-index: var(--z-toast);
  display: flex;
  width: min(calc(100% - var(--space-8)), 32rem);
  min-height: 3rem;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  border: 1px solid var(--color-signal);
  background: var(--color-panel);
  box-shadow: 0 12px 32px rgb(0 0 0 / 55%);
  color: var(--color-body);
  font-size: var(--text-sm);
  padding: var(--space-3) var(--space-4);
  transform: translateX(-50%);
}

.contact-toast.is-error {
  border-color: var(--color-error);
}

.contact-toast.is-error::before {
  background: var(--color-error);
}

.contact-toast button {
  width: 2rem;
  height: 2rem;
  flex: 0 0 auto;
  color: var(--color-muted);
  font-size: var(--text-lg);
  line-height: 1;
}

.contact-toast button:hover,
.contact-toast button:focus-visible {
  color: white;
  outline: 1px solid var(--color-rule);
}

.contact-toast-enter-active,
.contact-toast-leave-active {
  transition:
    opacity 150ms ease,
    transform 150ms ease;
}

.contact-toast-enter-from,
.contact-toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -8px);
}

@media (min-width: 768px) {
  .contact-sheet__panel {
    right: 0;
    left: auto;
    width: min(32rem, 100%);
  }

  .contact-sheet__header {
    padding: var(--space-6);
  }

  .contact-sheet__body {
    padding: var(--space-8) var(--space-6);
  }

  .contact-toast {
    top: var(--space-6);
  }
}

.contact-sheet-enter-active,
.contact-sheet-leave-active {
  transition: opacity 180ms ease;
}

.contact-sheet-enter-active .contact-sheet__panel,
.contact-sheet-leave-active .contact-sheet__panel {
  transition: transform 320ms cubic-bezier(0.32, 0.72, 0, 1);
}

.contact-sheet-enter-from,
.contact-sheet-leave-to {
  opacity: 0;
}

.contact-sheet-enter-from .contact-sheet__panel,
.contact-sheet-leave-to .contact-sheet__panel {
  transform: translateX(100%);
}

@media (prefers-reduced-motion: reduce) {
  .contact-sheet-enter-active,
  .contact-sheet-leave-active,
  .contact-sheet-enter-active .contact-sheet__panel,
  .contact-sheet-leave-active .contact-sheet__panel,
  .contact-toast-enter-active,
  .contact-toast-leave-active,
  .contact-sheet__close,
  .contact-field :is(input, textarea),
  .contact-form__submit {
    transition: none;
  }
}
</style>
