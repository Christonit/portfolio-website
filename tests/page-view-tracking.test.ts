import assert from "node:assert/strict";
import test from "node:test";

import { createHeadAwarePageViewTracker } from "../utils/pageViewTracker.ts";

test("page views wait for the destination title to reach the DOM", () => {
  const headListeners = new Set<() => void>();
  const events: Array<{ path: string; title: string }> = [];
  let title = "Home";

  const tracker = createHeadAwarePageViewTracker({
    fallbackDelay: 10_000,
    onHeadRendered(callback) {
      headListeners.add(callback);
      return () => headListeners.delete(callback);
    },
    send(path) {
      events.push({ path, title });
      return true;
    },
  });

  tracker.markInitial("/");
  tracker.queue("/bio/");
  assert.deepEqual(events, []);

  title = "Bio";
  for (const listener of [...headListeners]) listener();
  assert.deepEqual(events, [{ path: "/bio/", title: "Bio" }]);
});

test("duplicate hooks deduplicate only after the head-aware send", () => {
  const headListeners = new Set<() => void>();
  const events: string[] = [];
  const tracker = createHeadAwarePageViewTracker({
    fallbackDelay: 10_000,
    onHeadRendered(callback) {
      headListeners.add(callback);
      return () => headListeners.delete(callback);
    },
    send(path) {
      events.push(path);
      return true;
    },
  });

  tracker.markInitial("/project/example/");
  tracker.queue("/projects/");
  tracker.queue("/projects/");
  assert.deepEqual(events, []);

  for (const listener of [...headListeners]) listener();
  assert.deepEqual(events, ["/projects/"]);
});

test("a newer navigation cancels a page view whose head never rendered", () => {
  const headListeners = new Set<() => void>();
  const events: string[] = [];
  const tracker = createHeadAwarePageViewTracker({
    fallbackDelay: 10_000,
    onHeadRendered(callback) {
      headListeners.add(callback);
      return () => headListeners.delete(callback);
    },
    send(path) {
      events.push(path);
      return true;
    },
  });

  tracker.markInitial("/");
  tracker.queue("/bio/");
  tracker.queue("/projects/");

  for (const listener of [...headListeners]) listener();
  assert.deepEqual(events, ["/projects/"]);
});
