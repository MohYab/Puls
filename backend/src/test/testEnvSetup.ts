import { afterEach, vi } from "vitest";

// The test files share one module environment (isolate: false in
// vitest.config.ts), so spies and stubbed environment variables would
// otherwise leak from one file into the next. Stub env variables with
// vi.stubEnv (in beforeEach, since this resets them after every test).
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});
