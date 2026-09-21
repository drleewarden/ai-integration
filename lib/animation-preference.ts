/**
 * Whether the hero animation should run.
 *
 * A module-level store rather than React context, so the Nav (rendered by the
 * page) and WebGLBackground (rendered inside Hero) can share the setting
 * without a provider wrapping them or props threaded through the layout.
 * Both read it through useSyncExternalStore.
 *
 * The default follows the visitor's OS setting; an explicit choice overrides
 * it and persists.
 */

const STORAGE_KEY = "cm-animation";
const ON = "on";
const OFF = "off";

type Listener = () => void;

const listeners = new Set<Listener>();

/**
 * Cached because useSyncExternalStore calls getSnapshot on every render and
 * expects a stable value; reading localStorage each time would be wasteful.
 */
let current: boolean | null = null;

/** localStorage is unavailable in some privacy modes, and throws rather than returning null. */
function readStored(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStored(value: boolean): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, value ? ON : OFF);
  } catch {
    // Private browsing refuses the write. The choice still applies for this
    // page view; it simply will not survive a reload.
  }
}

function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function resolve(): boolean {
  const stored = readStored();
  if (stored === ON) return true;
  if (stored === OFF) return false;
  // Anything else, including a corrupt value, falls back to the OS default.
  return !prefersReducedMotion();
}

export function getAnimationPreference(): boolean {
  if (current === null) current = resolve();
  return current;
}

/** Server render has no OS setting to read, so it assumes the common case. */
export function getServerAnimationPreference(): boolean {
  return true;
}

export function setAnimationPreference(value: boolean): void {
  if (getAnimationPreference() === value) return;
  current = value;
  writeStored(value);
  for (const listener of listeners) listener();
}

export function subscribeToAnimationPreference(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
