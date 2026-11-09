import type { RequestHandler } from "express";
import { AppError } from "./errors.js";

/**
 * The public demo runs with DEMO_MODE=true. It is separate from NODE_ENV so the
 * demo can be tested locally, and a real installation is never locked by mistake.
 */
export function isDemoMode(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.DEMO_MODE === "true";
}

/** Blocks a change that would lock other visitors out of the demo accounts. */
export function assertNotDemoMode(action: string): void {
  if (isDemoMode()) {
    throw new AppError(403, "DEMO_MODE", `${action} is turned off in the public demo.`);
  }
}

/** Route middleware for actions that are always blocked in the demo. */
export function blockInDemoMode(action: string): RequestHandler {
  return (_req, _res, next) => {
    assertNotDemoMode(action);
    next();
  };
}
