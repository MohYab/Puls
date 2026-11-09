/**
 * True in the public demo build (VITE_DEMO_MODE=true). Only changes what is
 * shown: VITE_ variables are baked into the bundle and visible to everyone, so
 * the backend (DEMO_MODE) is what actually blocks the changes.
 *
 * A function, not a constant, so tests can change the value with vi.stubEnv.
 */
export function isDemoMode(): boolean {
  return import.meta.env.VITE_DEMO_MODE === "true";
}
