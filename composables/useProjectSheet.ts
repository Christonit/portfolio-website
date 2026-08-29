/**
 * How the project dossier presents itself over the projects board.
 *
 * `side`  — right-hand drawer; the board stays readable in the left gutter.
 * `full`  — near-fullscreen dialog; the board survives only as a dim frame.
 *
 * Both are live so the two can be compared in place. The choice sticks in
 * localStorage, and `?view=side` / `?view=full` forces one for a quick A/B.
 */
export type ProjectSheetMode = "side" | "full";

export const PROJECT_SHEET_MODES: readonly ProjectSheetMode[] = ["side", "full"];

const STORAGE_KEY = "portfolio:project-sheet-mode";

function isMode(value: unknown): value is ProjectSheetMode {
  return PROJECT_SHEET_MODES.includes(value as ProjectSheetMode);
}

export function useProjectSheetMode() {
  const mode = useState<ProjectSheetMode>("project-sheet-mode", () => "side");
  const route = useRoute();

  function setMode(next: ProjectSheetMode) {
    mode.value = next;
    if (!import.meta.client) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* Private mode / blocked storage — the choice just won't persist. */
    }
  }

  // Resolved after hydration on purpose: the server has no way to know the
  // stored preference, so reading it here keeps the markup mismatch-free.
  onMounted(() => {
    const raw = route.query.view;
    const fromQuery = Array.isArray(raw) ? raw[0] : raw;
    if (isMode(fromQuery)) {
      setMode(fromQuery);
      return;
    }

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isMode(stored)) mode.value = stored;
    } catch {
      /* Same as above — fall back to the default. */
    }
  });

  return { mode, setMode };
}

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
