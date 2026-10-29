import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";

/**
 * Security middleware. Nothing is written to the database.
 */
describe("Security headers (helmet)", () => {
  const app = createApp();

  it("sets secure headers and hides the framework", async () => {
    const res = await request(app).get("/api/health");

    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });
});

describe("Login rate limit", () => {
  const failedLogin = (app: ReturnType<typeof createApp>) =>
    request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@puls.test", password: "wrong-password" });

  it("blocks after 10 failed attempts, also for the correct password", async () => {
    // A separate app with the limit turned on and its own counter.
    const app = createApp({ loginRateLimit: true });

    for (let attempt = 1; attempt <= 10; attempt++) {
      const res = await failedLogin(app);
      expect(res.status).toBe(401);
    }

    const blocked = await failedLogin(app);
    expect(blocked.status).toBe(429);
    expect(blocked.body.error.code).toBe("TOO_MANY_REQUESTS");

    const correct = await request(app)
      .post("/api/auth/login")
      .send({ email: "erik@puls.test", password: "password123" });
    expect(correct.status).toBe(429);
  });

  it("does not count successful logins", async () => {
    const app = createApp({ loginRateLimit: true });

    for (let attempt = 1; attempt <= 12; attempt++) {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "erik@puls.test", password: "password123" });
      expect(res.status).toBe(200);
    }
  }, 20_000);
});
