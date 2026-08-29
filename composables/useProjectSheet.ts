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
}
