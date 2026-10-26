import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { auth, loginAs } from "./helpers.js";

/** Clinic settings. Nothing is written; saving is tested manually. */
describe("Clinic settings", () => {
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

  it("can be read without logging in (shown on the login page)", async () => {
    const res = await request(app).get("/api/clinic");

    expect(res.status).toBe(200);
    expect(typeof res.body.name).toBe("string");
  });

  it("can only be changed by an admin", async () => {
    const res = await request(app).put("/api/clinic").set(auth(erikToken)).send({ name: "Not allowed" });

    expect(res.status).toBe(403);
  });

  it("requires a name and a valid postal code", async () => {
    const res = await request(app)
      .put("/api/clinic")
      .set(auth(adminToken))
      .send({ name: "", postalCode: "1234" });

    expect(res.status).toBe(400);
  });
});