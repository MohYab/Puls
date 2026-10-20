import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";

/**
 * Login. Requires a seeded database (erik@puls.test exists).
 * Nothing is written, so the suite can run repeatedly.
 */
describe("POST /api/auth/login", () => {
  const app = createApp();
  const login = (body: object) => request(app).post("/api/auth/login").send(body);

  it("returns a token and the user, but never the password hash", async () => {
    const res = await login({ email: "erik@puls.test", password: "password123" });

    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe("string");
    expect(res.body.user.email).toBe("erik@puls.test");
    expect(JSON.stringify(res.body)).not.toContain("passwordHash");
  });

  it("gives the same response for an unknown email and a wrong password", async () => {
    // If the two cases differed, the API would reveal which accounts exist
    const [unknownEmail, wrongPassword] = await Promise.all([
      login({ email: "nobody@puls.test", password: "password123" }),
      login({ email: "erik@puls.test", password: "wrong-password" }),
    ]);

    expect(unknownEmail.status).toBe(401);
    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.body).toEqual(wrongPassword.body);
    expect(unknownEmail.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("rejects a request without email or password", async () => {
    const res = await login({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});
