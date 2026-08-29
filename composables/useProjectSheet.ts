/**
 * Whether a dossier sheet is already on screen. The pager remounts the page
 * component, so without this the sheet would replay its entrance animation
 * every time you stepped to the next project.
 *
 * Deliberately module state rather than `useState`: a server-set flag would
 * serialise into the payload and tell the very first client render that the
 * sheet was already open, killing the entrance animation on a cold load.
 */
let sheetIsOpen = false;

/** Marks the sheet open and reports whether one was already up. */
export function openProjectSheet(): boolean {
  if (!import.meta.client) return false;
  const wasOpen = sheetIsOpen;
  sheetIsOpen = true;
  return wasOpen;
}

export function closeProjectSheet() {
  sheetIsOpen = false;
  pendingStep = null;
}

export type SheetStep = "forward" | "back";

/**
 * Direction of travel for a pager step, recorded on the click that starts it
 * and read by the dossier it lands on — same reason as `sheetIsOpen`: the page
 * component remounts in between, and the incoming dossier has to know which
 * way it came from before its first paint.
 *
 * Tagged with the destination slug and left in place rather than spent on
 * read: the incoming page can render more than once before it settles, and
 * every one of those renders has to reach the same answer. The tag is what
 * keeps it from leaking — any arrival the pager didn't ask for reads null.
 */
let pendingStep: { step: SheetStep; slug: string } | null = null;

export function markProjectSheetStep(step: SheetStep, slug: string) {
  pendingStep = { step, slug };
}

export function projectSheetStepFor(slug: string): SheetStep | null {
  return pendingStep?.slug === slug ? pendingStep.step : null;
}
