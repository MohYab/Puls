import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../app.js";
import { auth, loginAs } from "./helpers.js";

const app = createApp();

interface DoctorRow {
  id: string;
  specialization: string | null;
  user: { name: string; email: string };
}

// Every blocked request below would also fail without demo mode (wrong current
// password, an email already in use, a doctor with future appointments), and
// the demo check comes before those checks. So if the check were missing, the
// test fails without changing any seed data used by other test files.
describe("demo mode (DEMO_MODE=true)", () => {
  let adminToken: string;
  let doctorToken: string;
  let erik: DoctorRow;
  let sara: DoctorRow;

  beforeAll(async () => {
    process.env.DEMO_MODE = "true";
    adminToken = (await loginAs(app, "admin@puls.test")).token;
    doctorToken = (await loginAs(app, "erik@puls.test")).token;

    const res = await request(app).get("/api/doctors").set(auth(adminToken));
    const doctors = res.body as DoctorRow[];
    erik = doctors.find((doctor) => doctor.user.email === "erik@puls.test")!;
    sara = doctors.find((doctor) => doctor.user.email === "sara@puls.test")!;
  });

  afterAll(() => {
    delete process.env.DEMO_MODE;
  });

  it("blocks password changes", async () => {
    const res = await request(app)
      .put("/api/account/password")
      .set(auth(doctorToken))
      .send({ currentPassword: "wrong-password", newPassword: "another-password-123" });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("DEMO_MODE");
  });

  it("blocks changing a user's email, but allows other edits", async () => {
    const changed = await request(app)
      .put(`/api/doctors/${erik.id}`)
      .set(auth(adminToken))
      .send({
        name: erik.user.name,
        email: sara.user.email,
        specialization: erik.specialization ?? "",
      });

    expect(changed.status).toBe(403);
    expect(changed.body.error.code).toBe("DEMO_MODE");

    // Same values as today: allowed, and nothing changes.
    const unchanged = await request(app)
      .put(`/api/doctors/${erik.id}`)
      .set(auth(adminToken))
      .send({
        name: erik.user.name,
        email: erik.user.email,
        specialization: erik.specialization ?? "",
      });

    expect(unchanged.status).toBe(200);
  });

  it("blocks deactivating a user", async () => {
    const res = await request(app)
      .patch(`/api/doctors/${erik.id}/status`)
      .set(auth(adminToken))
      .send({ isActive: false });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("DEMO_MODE");
  });
});
