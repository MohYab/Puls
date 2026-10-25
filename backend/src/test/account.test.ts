import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { auth, loginAs } from "./helpers.js";

/**
 * My account. Nothing is written: changing a seed user's name or password
 * would affect the other test files, which run at the same time. Successful
 * changes are covered in manual-testing.md.
 */
describe("My account", () => {
  const app = createApp();
  let erikToken: string;
  let adminToken: string;

  beforeAll(async () => {
    const [erik, admin] = await Promise.all([
      loginAs(app, "erik@puls.test"),
      loginAs(app, "admin@puls.test"),
    ]);
    erikToken = erik.token;
    adminToken = admin.token;
  });

  it("returns the logged-in user's own account, never the password hash", async () => {
    const res = await request(app).get("/api/account").set(auth(erikToken));

    expect(res.status).toBe(200);
    expect(res.body.email).toBe("erik@puls.test");
    expect(res.body.role).toBe("DOCTOR");
    expect(JSON.stringify(res.body)).not.toContain("passwordHash");
  });

  it("returns no specialization for an admin", async () => {
    const res = await request(app).get("/api/account").set(auth(adminToken));

    expect(res.body.specialization).toBeNull();
  });

  it("requires a name", async () => {
    const res = await request(app).put("/api/account").set(auth(erikToken)).send({ name: "" });

    expect(res.status).toBe(400);
  });

  it("gives 400, not 401, for a wrong current password", async () => {
    // A 401 would log the user out in the frontend.
    const res = await request(app)
      .put("/api/account/password")
      .set(auth(erikToken))
      .send({ currentPassword: "wrong-password", newPassword: "a-new-password-123" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_CURRENT_PASSWORD");
  });

  it("rejects a short new password", async () => {
    const res = await request(app)
      .put("/api/account/password")
      .set(auth(erikToken))
      .send({ currentPassword: "password123", newPassword: "short" });

    expect(res.status).toBe(400);
  });

  it("requires a token", async () => {
    const res = await request(app).get("/api/account");

    expect(res.status).toBe(401);
  });
});
