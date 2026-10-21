import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
// Adds DOM matchers such as toBeInTheDocument() and toBeDisabled() to expect.
import "@testing-library/jest-dom/vitest";

// Remove everything rendered by a test, so the next test starts with an empty page.
// Testing Library only does this by itself when Vitest runs with globals: true.
afterEach(() => {
  cleanup();
});
