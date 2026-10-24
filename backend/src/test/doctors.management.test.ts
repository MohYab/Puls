import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { createApp } from "../app.js";
import { auth, loginAs, requireValue } from "./helpers.js";

/**
 * Doctor management. Requires the seed, including the inactive doctor Karl
 * Bergman. Every request is rejected before anything is written, or only reads.
 */

interface DoctorRow {
  id: string;
  user: { id: string; name: string; email: string; isActive: boolean };
}

describe("Doctor management", () => {
  const app = createApp();

  let erikToken: string;
  let erikDoctorId: string;
  let adminToken: string;
  let karl: DoctorRow;

  beforeAll(async () => {
    const [erik, admin] = await Promise.all([
      loginAs(app, "erik@puls.test"),
      loginAs(app, "admin@puls.test"),
    ]);
    erikToken = erik.token;
    adminToken = admin.token;
    erikDoctorId = requireValue(erik.user.doctorId, "Erik must have a doctor profile");

    const all = await request(app)
      .get("/api/doctors")
      .query({ includeInactive: "true" })
      .set(auth(adminToken));
    karl = requireValue(
      (all.body as DoctorRow[]).find((d) => d.user.email === "karl.bergman@puls.test"),
      "Seed needs the inactive doctor Karl Bergman"
    );
    expect(karl.user.isActive).toBe(false);
  });

  describe("inactive doctors", () => {
    it("are not listed by default, and never for doctors", async () => {
      const [asAdmin, asDoctor] = await Promise.all([
        request(app).get("/api/doctors").set(auth(adminToken)),
        request(app).get("/api/doctors").query({ includeInactive: "true" }).set(auth(erikToken)),
      ]);

      expect((asAdmin.body as DoctorRow[]).map((d) => d.id)).not.toContain(karl.id);
      expect((asDoctor.body as DoctorRow[]).map((d) => d.id)).not.toContain(karl.id);
    });

    it("never return a password hash", async () => {
      const res = await request(app).get("/api/doctors").set(auth(adminToken));

      expect(JSON.stringify(res.body)).not.toContain("passwordHash");
    });

    it("cannot log in, with the same answer as a wrong password", async () => {
      const [inactive, wrongPassword] = await Promise.all([
        request(app)
          .post("/api/auth/login")
          .send({ email: karl.user.email, password: "password123" }),
        request(app)
          .post("/api/auth/login")
          .send({ email: "erik@puls.test", password: "wrong-password" }),
      ]);

      expect(inactive.status).toBe(401);
      expect(inactive.body).toEqual(wrongPassword.body);
    });

    it("are locked out even with a token that has not expired", async () => {
      // Signed like a real login token, for a user that is now inactive.
      const token = jwt.sign(
        { userId: karl.user.id, role: "DOCTOR", doctorId: karl.id },
        requireValue(process.env.JWT_SECRET, "JWT_SECRET must be set"),
        { expiresIn: "1h" }
      );
      const res = await request(app).get("/api/auth/me").set(auth(token));

      expect(res.status).toBe(401);
      expect(res.body.error.message).toContain("no longer active");
    });

    it("cannot be booked", async () => {
      const [patients, types] = await Promise.all([
        request(app).get("/api/patients").set(auth(adminToken)),
        request(app).get("/api/appointment-types").set(auth(adminToken)),
      ]);
      const res = await request(app).post("/api/appointments").set(auth(adminToken)).send({
        patientId: patients.body[0].id,
        doctorId: karl.id,
        appointmentTypeId: types.body[0].id,
        startTime: "2030-01-15T10:00:00+01:00",
      });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("DOCTOR_INACTIVE");
    });
  });

  describe("admin only", () => {
    const newDoctor = {
      name: "Dr. Should Not Exist",
      email: "should.not.exist@puls.test",
      password: "long-enough-password",
    };

    it("blocks a doctor from creating a doctor", async () => {
      const res = await request(app).post("/api/doctors").set(auth(erikToken)).send(newDoctor);

      expect(res.status).toBe(403);
    });

    it("rejects an email that is already in use, regardless of case", async () => {
      const res = await request(app)
        .post("/api/doctors")
        .set(auth(adminToken))
        .send({ ...newDoctor, email: "ERIK@puls.test" });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe("EMAIL_IN_USE");
    });

    it("rejects a short password", async () => {
      const res = await request(app)
        .post("/api/doctors")
        .set(auth(adminToken))
        .send({ ...newDoctor, password: "short" });

      expect(res.status).toBe(400);
    });

    it("does not deactivate a doctor with future appointments", async () => {
      const res = await request(app)
        .patch(`/api/doctors/${erikDoctorId}/status`)
        .set(auth(adminToken))
        .send({ isActive: false });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe("DOCTOR_HAS_APPOINTMENTS");
    });
  });
});
