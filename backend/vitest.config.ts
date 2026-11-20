import { defineConfig } from "vitest/config";

// Dates are built in local time in the tests and must mean Swedish time, as on
// the server (assertClinicTimeZone in index.ts, which the tests do not go
// through). Set here, before the test workers start, so they inherit it and
// the result does not depend on the machine's time zone.
process.env.TZ = "Europe/Stockholm";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // Load .env so JWT_SECRET / DATABASE_URL are available in integration tests,
    // then reset mocks and stubbed env variables after every test.
    setupFiles: ["dotenv/config", "./src/test/testEnvSetup.ts"],
    // Explicit, so createApp() can turn off the login rate limit in tests.
    env: { NODE_ENV: "test" },
    // All files share the seeded puls_dev database. Running them one at a time
    // keeps one file's temporary changes (e.g. a shared note) from showing up
    // in another file's assertions.
    fileParallelism: false,
    // Reuse one worker for all files instead of one per file; without this the
    // sequential run takes about three times as long.
    isolate: false,
  },
});
