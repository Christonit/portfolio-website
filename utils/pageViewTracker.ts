interface HeadAwarePageViewTrackerOptions {
  fallbackDelay?: number;
  onHeadRendered: (callback: () => void) => () => void;
  send: (path: string) => boolean;
}

/**
 * Waits for Unhead to patch the DOM before reading page metadata for analytics.
 * A short fallback still records navigations whose head does not change.
 */
export function createHeadAwarePageViewTracker({
  fallbackDelay = 300,
  onHeadRendered,
  send,
}: HeadAwarePageViewTrackerOptions) {
  let lastPath: string | null = null;
  let pendingPath: string | null = null;
  let cancelPending: (() => void) | null = null;

  function markInitial(path: string) {
    lastPath = path;
  }

  function queue(path: string) {
    if (path === lastPath || path === pendingPath) return;
    cancelPending?.();

    let completed = false;
    let stopListening = () => {};
    let timer: ReturnType<typeof setTimeout> | undefined;

    const cancel = () => {
      if (completed) return;
      completed = true;
      stopListening();
      if (timer !== undefined) clearTimeout(timer);
      if (pendingPath === path) {
        pendingPath = null;
        cancelPending = null;
      }
    };

    const finish = () => {
      if (completed) return;
      cancel();
      if (path === lastPath) return;
      if (send(path)) lastPath = path;
    };

    pendingPath = path;
    cancelPending = cancel;
    stopListening = onHeadRendered(finish);
    if (completed) {
      stopListening();
      return;
    }
    timer = setTimeout(finish, fallbackDelay);
  }

  return { markInitial, queue };
}
