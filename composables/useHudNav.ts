/**
 * Shared HUD navigation state.
 * The layout writes the current arrow key press; pages read it to move focus.
 * The value resets to null after one tick so watchers fire on every press.
 */
export const useHudNav = () =>
  useState<'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | null>(
    'hud-arrow-key',
    () => null,
  )
