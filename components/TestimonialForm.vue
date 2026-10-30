<script setup lang="ts">
type SubmitState = "idle" | "sending" | "sent" | "error";

const fileInput = ref<HTMLInputElement | null>(null);
const successHeading = ref<HTMLElement | null>(null);
const state = ref<SubmitState>("idle");
const feedback = ref("");
const previewUrl = ref("");
const fileName = ref("");
const dragging = ref(false);
let toastTimer: number | undefined;

function clearPreview() {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = "";
  fileName.value = "";
}

function dismissToast() {
  window.clearTimeout(toastTimer);
  feedback.value = "";
}

function showToast(message: string) {
  dismissToast();
  feedback.value = message;
  toastTimer = window.setTimeout(dismissToast, 5000);
}

function useFile(file?: File) {
  clearPreview();
  if (!file) return;

  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    state.value = "error";
    showToast("Choose a JPG, PNG, or WebP image.");
    if (fileInput.value) fileInput.value.value = "";
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    state.value = "error";
    showToast("Choose an image under 2 MB.");
    if (fileInput.value) fileInput.value.value = "";
    return;
  }

  fileName.value = file.name;
  previewUrl.value = URL.createObjectURL(file);
  state.value = "idle";
}

function onFileChange(event: Event) {
  useFile((event.target as HTMLInputElement).files?.[0]);
}

function onDrop(event: DragEvent) {
  dragging.value = false;
  const file = event.dataTransfer?.files?.[0];
  if (!file || !fileInput.value) return;
  const transfer = new DataTransfer();
  transfer.items.add(file);
  fileInput.value.files = transfer.files;
  useFile(file);
}

watch(state, async (next) => {
  if (next !== "sent") return;
  await nextTick();
  successHeading.value?.focus();
});

onBeforeUnmount(() => {
  window.clearTimeout(toastTimer);
  clearPreview();
});

async function submit(event: Event) {
  const form = event.currentTarget as HTMLFormElement;
  if (!fileInput.value?.files?.length) {
    state.value = "error";
    showToast("Add a portrait before sending.");
    fileInput.value?.focus();
    return;
  }

  state.value = "sending";
  dismissToast();
  try {
    const response = await fetch("/api/testimonials", {
      method: "POST",
      body: new FormData(form),
    });
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    if (!response.ok) {
      throw new Error(
        body?.message ??
          (response.status === 429
            ? "Too many attempts. Please wait before trying again."
            : "Your testimonial could not be saved."),
      );
    }

    form.reset();
    clearPreview();
    state.value = "sent";
    feedback.value = "";
  } catch (error) {
    state.value = "error";
    showToast(
      error instanceof Error
        ? error.message
        : "Your testimonial could not be saved. Please try again.",
    );
  }
}
</script>

<template>
  <div class="testimonial-form-wrap">
    <div v-if="state === 'sent'" class="testimonial-success">
      <h2
        id="testimonial-success-title"
        ref="successHeading"
        tabindex="-1"
      >
        Thanks — it's in review.
      </h2>
      <p>
        Your note was received and will appear on the site after it is approved.
      </p>
      <NuxtLink to="/">BACK_TO_HOME <span aria-hidden="true">→</span></NuxtLink>
    </div>

    <form
      v-else
      class="testimonial-form"
      enctype="multipart/form-data"
      @submit.prevent="submit"
    >
      <label class="testimonial-field">
        <span>Name <b aria-hidden="true">*</b></span>
        <input
          id="testimonial-name"
          name="name"
          type="text"
          autocomplete="name"
          maxlength="80"
          required
        />
      </label>

      <label class="testimonial-field">
        <span>Role / company <em>optional</em></span>
        <input name="role" type="text" maxlength="120" />
      </label>

      <label class="testimonial-field">
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

      <label class="testimonial-field">
        <span>Website <em>optional</em></span>
        <input
          name="website"
          type="url"
          inputmode="url"
          placeholder="https://..."
          maxlength="300"
        />
      </label>

      <label class="testimonial-field">
        <span>Comment <b aria-hidden="true">*</b></span>
        <textarea
          name="quote"
          rows="5"
          maxlength="600"
          placeholder="What did we build, solve, or improve together?"
          required
        />
      </label>

      <div class="testimonial-upload">
        <span class="testimonial-upload__label">
          Portrait <b aria-hidden="true">*</b>
        </span>
        <label
          class="testimonial-upload__drop"
          :class="{ 'is-dragging': dragging }"
          @dragenter.prevent="dragging = true"
          @dragover.prevent="dragging = true"
          @dragleave.prevent="dragging = false"
          @drop.prevent="onDrop"
        >
          <input
            ref="fileInput"
            name="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            @change="onFileChange"
          />
          <img
            v-if="previewUrl"
            :src="previewUrl"
            alt="Selected portrait preview"
          />
          <span v-else class="testimonial-upload__mark" aria-hidden="true">
            +
          </span>
          <span class="testimonial-upload__copy">
            <strong>{{ fileName || "DROP_IMAGE_OR_BROWSE" }}</strong>
            <small>JPG, PNG, or WebP · 256–2000px · max 2 MB</small>
          </span>
        </label>
      </div>

      <label class="testimonial-form__trap" aria-hidden="true">
        Company
        <input
          name="company"
          type="text"
          tabindex="-1"
          autocomplete="off"
        />
      </label>

      <div
        v-if="state === 'sending'"
        class="testimonial-form__progress"
        role="progressbar"
        aria-label="Uploading testimonial"
      >
        <span />
      </div>

      <button
        type="submit"
        class="testimonial-form__submit"
        :disabled="state === 'sending'"
      >
        {{ state === "sending" ? "UPLOADING..." : "SEND_FOR_REVIEW" }}
        <span aria-hidden="true">→</span>
      </button>
    </form>

    <Teleport to="body">
      <Transition name="testimonial-toast">
        <div
          v-if="feedback"
          class="testimonial-toast"
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
  </div>
</template>

<style scoped>
.testimonial-form {
  position: relative;
  display: grid;
  gap: var(--space-4);
}

.testimonial-field {
  display: grid;
  gap: var(--space-2);
}

.testimonial-field > span,
.testimonial-upload__label {
  color: var(--color-body);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.testimonial-field b,
.testimonial-upload__label b {
  color: var(--color-signal);
  font-weight: 400;
}

.testimonial-field em {
  color: var(--color-muted);
  font-style: normal;
  letter-spacing: 0.06em;
  text-transform: lowercase;
}

.testimonial-field :is(input, textarea) {
  width: 100%;
  border: 1px solid var(--color-rule);
  background: var(--color-canvas);
  color: white;
  font-size: var(--text-base);
  outline: none;
  padding: var(--space-3);
}

.testimonial-field textarea {
  min-height: 8rem;
  resize: vertical;
}

.testimonial-field :is(input, textarea)::placeholder {
  color: var(--color-muted);
}

.testimonial-field :is(input, textarea):focus-visible {
  border-color: var(--color-signal);
  box-shadow: inset 3px 0 0 var(--color-signal);
}

.testimonial-upload {
  display: grid;
  gap: var(--space-2);
}

.testimonial-upload__drop {
  display: flex;
  min-height: 6rem;
  align-items: center;
  gap: var(--space-4);
  border: 1px dashed var(--color-rule);
  background: var(--color-canvas);
  cursor: pointer;
  padding: var(--space-3);
}

.testimonial-upload__drop:hover,
.testimonial-upload__drop:focus-within,
.testimonial-upload__drop.is-dragging {
  border-color: var(--color-signal);
}

.testimonial-upload__drop input {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
}

.testimonial-upload__drop img,
.testimonial-upload__mark {
  width: 4rem;
  height: 4rem;
  flex: 0 0 auto;
  border: 1px solid var(--color-rule);
  border-radius: 50%;
  object-fit: cover;
}

.testimonial-upload__mark {
  display: grid;
  place-items: center;
  color: var(--color-signal);
  font-family: var(--font-mono);
  font-size: var(--text-lg);
}

.testimonial-upload__copy {
  display: grid;
  min-width: 0;
  gap: var(--space-1);
}

.testimonial-upload__copy strong {
  overflow: hidden;
  color: var(--color-body);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 400;
  letter-spacing: 0.08em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.testimonial-upload__copy small {
  color: var(--color-muted);
  font-size: var(--text-xs);
  line-height: 1.4;
}

.testimonial-form__trap {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
}

.testimonial-form__progress {
  height: 2px;
  overflow: hidden;
  background: var(--color-surface);
}

.testimonial-form__progress span {
  display: block;
  width: 40%;
  height: 100%;
  background: var(--color-signal);
  animation: testimonial-progress 1s ease-in-out infinite alternate;
}

.testimonial-form__submit {
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
}

.testimonial-form__submit:hover,
.testimonial-form__submit:focus-visible {
  background: transparent;
  color: var(--color-signal);
  outline: none;
}

.testimonial-form__submit:disabled {
  cursor: wait;
  opacity: 0.55;
}

.testimonial-success {
  display: grid;
  gap: var(--space-4);
  border: 1px solid var(--color-rule);
  background: var(--color-canvas);
  padding: var(--space-6);
}

.testimonial-success h2 {
  color: white;
  font-size: var(--text-lg);
  outline: none;
}

.testimonial-success p {
  color: var(--color-prose);
  font-size: var(--text-sm);
  line-height: 1.6;
}

.testimonial-success a {
  color: var(--color-signal);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.12em;
}

.testimonial-success a:hover,
.testimonial-success a:focus-visible {
  color: white;
  outline: none;
}

.testimonial-toast {
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

.testimonial-toast.is-error {
  border-color: var(--color-error);
}

.testimonial-toast button {
  width: 2rem;
  height: 2rem;
  color: var(--color-muted);
  font-size: var(--text-lg);
}

.testimonial-toast button:hover,
.testimonial-toast button:focus-visible {
  color: white;
  outline: 1px solid var(--color-rule);
}

.testimonial-toast-enter-active,
.testimonial-toast-leave-active {
  transition:
    opacity 150ms ease,
    transform 150ms ease;
}

.testimonial-toast-enter-from,
.testimonial-toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -8px);
}

@keyframes testimonial-progress {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(250%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .testimonial-toast-enter-active,
  .testimonial-toast-leave-active {
    transition: none;
  }

  .testimonial-form__progress span {
    width: 100%;
    animation: none;
  }
}
</style>
