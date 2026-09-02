import type { InjectionKey, Ref } from "vue";
import type { ProjectPreview } from "~/components/ProjectTooltip.vue";
import projectsJson from "~/data/projects.json";
import { isArticle } from "~/utils/projects";

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
  resetProjectPagerStep();
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
 *
 * Written only by the pager below, and deliberately not exported: a control
 * that marks a direction without going through the pager's gate is a control
 * that can start a second step on top of an unfinished one.
 */
let pendingStep: { step: SheetStep; slug: string } | null = null;

function markProjectSheetStep(step: SheetStep, slug: string) {
  pendingStep = { step, slug };
}

export function projectSheetStepFor(slug: string): SheetStep | null {
  return pendingStep?.slug === slug ? pendingStep.step : null;
}

/**
 * Scroll offset of the projects board, carried across the board → dossier →
 * board round trip.
 *
 * The board is a fresh component instance on each of those routes, so without
 * this it remounts at the top: the backdrop jerks up to the first card as the
 * scrim fades in, and dismissing the sheet drops you back at the top of the
 * list instead of on the card you opened.
 *
 * Spent on read, and only ever written for a hop between the board and a
 * dossier, so an arrival from anywhere else still starts at the top.
 */
let boardScroll: number | null = null;

export function rememberBoardScroll(top: number) {
  boardScroll = top;
}

export function takeBoardScroll(): number | null {
  const top = boardScroll;
  boardScroll = null;
  return top;
}

/**
 * Whether the sheet has finished its entrance. Injected by ProjectSheet so the
 * payload can hold back expensive work — video decode, above all — until the
 * panel has stopped moving. Defaults to "already in" for any use outside a
 * sheet.
 */
export const SHEET_ENTERED = Symbol("project-sheet-entered") as InjectionKey<
  Readonly<Ref<boolean>>
>;

export function useSheetEntered(): Readonly<Ref<boolean>> {
  return inject(
    SHEET_ENTERED,
    computed(() => true),
  );
}

export type PagerDirection = "prev" | "next";

/** Matches the header keys' own press flash. */
const PAGER_PRESS_MS = 160;
let pagerPressTimer: ReturnType<typeof setTimeout> | undefined;

/* Articles live off-site, so the pager only walks the case-study pages. */
const caseStudies = (projectsJson as ProjectPreview[]).filter(
  (project) => !isArticle(project),
);

/** True once there is more than one dossier to walk between. */
export const projectPagerIsWalkable = caseStudies.length > 1;

function pagerSlugFromPath(path: string) {
  const normalized = path.replace(/\/+$/, "");
  return normalized.startsWith("/project/")
    ? normalized.slice("/project/".length)
    : null;
}

/** The project one step either side of `slug`, wrapping at both ends. */
export function projectPagerNeighbour(slug: string, offset: number) {
  if (!projectPagerIsWalkable) return null;
  const index = caseStudies.findIndex((project) => project.slug === slug);
  if (index === -1) return null;
  const total = caseStudies.length;
  return caseStudies[(index + offset + total) % total];
}

/**
 * Only one step may be in flight at a time.
 *
 * Three controls drive the pager and none of them can see a step that has been
 * started but not yet landed: the rails render from the dossier on screen, and
 * the header keys read `route.path`, which the router advances the moment a
 * push is confirmed — a good deal earlier than the incoming page renders.
 * Spamming either one therefore aimed every press at a stale "current", so the
 * presses collapsed onto the same destination and the router dropped all but
 * the first as duplicates. The ones that did land arrived roughly 90ms apart
 * against a 340ms slide, so each dossier snapped back to its starting offset
 * and restarted — a stutter of half-played slides ending somewhere you didn't
 * ask for.
 *
 * The gate closes on the push and opens again when the dossier it landed on
 * has stopped moving, so every accepted step is computed against a settled
 * route and gets its animation through to the end.
 */
const PAGER_STEP_TIMEOUT_MS = 800;
let stepInFlight = false;
let stepTimer: ReturnType<typeof setTimeout> | undefined;

/**
 * Presses that arrive mid-step keep exactly one, so holding an arrow down
 * still walks the work at the speed the animation can carry, and letting go
 * stops it one step later instead of playing out a run you can no longer call
 * back. Later presses overwrite earlier ones, so a change of mind wins.
 */
let queuedStep: PagerDirection | null = null;

/**
 * Set by `useProjectPager`. Every instance closes over the same app-level
 * router and reads the destination off `route.path` at the moment it fires, so
 * whichever one is current is interchangeable — including one left behind by a
 * page that has since unmounted.
 */
let commitStep: ((direction: PagerDirection) => boolean) | null = null;

/**
 * Called by the sheet once the dossier it landed on has stopped moving — or by
 * the backstop, for the arrivals that never animate at all.
 */
export function settleProjectPagerStep() {
  if (!stepInFlight) return;
  clearTimeout(stepTimer);
  stepInFlight = false;

  const next = queuedStep;
  queuedStep = null;
  if (next) commitStep?.(next);
}

export function resetProjectPagerStep() {
  clearTimeout(stepTimer);
  stepInFlight = false;
  queuedStep = null;
}

/**
 * The pager: the single way to step between dossiers, shared because three
 * controls drive the same step — the rails either side of the sheet, the
 * header arrow keys, and the physical arrow keys. Whichever one you use, the
 * rails are what move: they are the arrows that mean "next project", so the
 * feedback belongs on them rather than on a header key that is, in this
 * context, only a remote control for them.
 */
export function useProjectPager() {
  const router = useRouter();
  const route = useRoute();
  const pressed = useState<PagerDirection | null>(
    "project-pager-press",
    () => null,
  );

  function flash(direction: PagerDirection) {
    pressed.value = direction;
    clearTimeout(pagerPressTimer);
    pagerPressTimer = setTimeout(() => {
      pressed.value = null;
    }, PAGER_PRESS_MS);
  }

  function commit(direction: PagerDirection) {
    const slug = pagerSlugFromPath(route.path);
    const destination = slug
      ? projectPagerNeighbour(slug, direction === "next" ? 1 : -1)
      : null;
    if (!destination) return false;

    stepInFlight = true;
    clearTimeout(stepTimer);
    stepTimer = setTimeout(settleProjectPagerStep, PAGER_STEP_TIMEOUT_MS);

    markProjectSheetStep(
      direction === "next" ? "forward" : "back",
      destination.slug,
    );
    router.push(`/project/${destination.slug}/`);
    return true;
  }

  /** Steps the pager. Reports whether it handled the press. */
  function step(direction: PagerDirection) {
    if (!projectPagerIsWalkable || !pagerSlugFromPath(route.path)) return false;

    // The rails answer every press, held or not: a control that looks dead is
    // worse than one that answers a beat late.
    flash(direction);

    if (stepInFlight) {
      queuedStep = direction;
      return true;
    }

    return commit(direction);
  }

  // Client only: on the server this is module state shared between requests,
  // and it would pin one request's router in memory for the next one.
  if (import.meta.client) commitStep = commit;

  return { pressed, flash, step };
}
