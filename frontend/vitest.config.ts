import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";

// Date tests (DST, opening hours) are only meaningful in the clinic's time zone.
// Set here, before the test workers start, so they inherit it.
process.env.TZ = "Europe/Stockholm";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      include: ["src/**/*.test.{ts,tsx}"],
      setupFiles: ["./src/test/setup.ts"],
      testTimeout: 15_000,
    },
  })
);
