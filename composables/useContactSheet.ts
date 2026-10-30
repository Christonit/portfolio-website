let contactTrigger: HTMLElement | null = null;

export function useContactSheetOpen() {
  return useState("contact-sheet-open", () => false);
}

export function openContactSheet(trigger?: HTMLElement | null) {
  if (import.meta.client) {
    contactTrigger =
      trigger ?? (document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null);
  }
  useContactSheetOpen().value = true;
}

export function closeContactSheet() {
  useContactSheetOpen().value = false;
}

export function restoreContactSheetFocus() {
  if (!import.meta.client) return;
  contactTrigger?.focus({ preventScroll: true });
  contactTrigger = null;
}
