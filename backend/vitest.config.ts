import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // Load .env so JWT_SECRET / DATABASE_URL are available in integration tests.
    setupFiles: ["dotenv/config"],
    // Explicit, so createApp() can turn off the login rate limit in tests.
    env: { NODE_ENV: "test" },
  },
});
