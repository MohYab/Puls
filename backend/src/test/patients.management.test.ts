import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { auth, loginAs, requireValue } from "./helpers.js";

/**
 * Patient management. Requires the seed, including the inactive patient Elsa
 * Nordqvist and Anna Andersson (born 1985-03-12). Every request here is
 * rejected before anything is written, or only reads.
 */

interface PatientRow {
  id: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
}

describe("Patient management", () => {
  const app = createApp();

  let erikToken: string;
  let erikDoctorId: string;
  let adminToken: string;
  let elsaId: string;
  let annaId: string;

  beforeAll(async () => {
    const [erik, admin] = await Promise.all([
      loginAs(app, "erik@puls.test"),
      loginAs(app, "admin@puls.test"),
    ]);
    erikToken = erik.token;
    adminToken = admin.token;
    erikDoctorId = requireValue(erik.user.doctorId, "Erik must have a doctor profile");

    const all = await request(app)
      .get("/api/patients")
      .query({ includeInactive: "true" })
      .set(auth(adminToken));
    const patients = all.body as PatientRow[];
    elsaId = requireValue(
      patients.find((p) => p.lastName === "Nordqvist" && !p.isActive)?.id,
      "Seed needs the inactive patient Elsa Nordqvist"
    );
    annaId = requireValue(
      patients.find((p) => p.firstName === "Anna" && p.lastName === "Andersson")?.id,
      "Seed needs Anna Andersson"
    );
  });

  describe("inactive patients", () => {
    it("are hidden from the patient list by default", async () => {
      const res = await request(app).get("/api/patients").set(auth(erikToken));

      expect(res.status).toBe(200);
      expect((res.body as PatientRow[]).map((p) => p.id)).not.toContain(elsaId);
    });

    it("are shown with includeInactive=true, also to doctors", async () => {
      const res = await request(app)
        .get("/api/patients")
        .query({ includeInactive: "true" })
        .set(auth(erikToken));

      expect((res.body as PatientRow[]).map((p) => p.id)).toContain(elsaId);
    });

    it("cannot be booked", async () => {
      const types = await request(app).get("/api/appointment-types").set(auth(erikToken));
      const res = await request(app)
        .post("/api/appointments")
        .set(auth(erikToken))
        .send({
          patientId: elsaId,
          doctorId: erikDoctorId,
          appointmentTypeId: types.body[0].id,
          startTime: new Date("2030-01-15T10:00:00+01:00").toISOString(),
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("PATIENT_INACTIVE");
    });
  });

  describe("create and edit", () => {
    it("rejects a duplicate of an existing patient", async () => {
      const res = await request(app)
        .post("/api/patients")
        .set(auth(erikToken))
        .send({ firstName: "anna", lastName: "ANDERSSON", dateOfBirth: "1985-03-12" });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe("PATIENT_EXISTS");
    });

    it("validates name and date of birth", async () => {
      const res = await request(app)
        .post("/api/patients")
        .set(auth(erikToken))
        .send({ firstName: "", lastName: "Test", dateOfBirth: "2999-01-01" });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("rejects an invalid email", async () => {
      const res = await request(app).put(`/api/patients/${annaId}`).set(auth(erikToken)).send({
        firstName: "Anna",
        lastName: "Andersson",
        dateOfBirth: "1985-03-12",
        email: "nope",
      });

      expect(res.status).toBe(400);
    });
  });

  describe("deactivation is admin only", () => {
    it("blocks a doctor", async () => {
      const res = await request(app)
        .patch(`/api/patients/${annaId}/status`)
        .set(auth(erikToken))
        .send({ isActive: false, reason: "MOVED" });

      expect(res.status).toBe(403);
    });

    it("requires a reason", async () => {
      const res = await request(app)
        .patch(`/api/patients/${annaId}/status`)
        .set(auth(adminToken))
        .send({ isActive: false });

      expect(res.status).toBe(400);
    });

    it("rejects deactivating an already inactive patient", async () => {
      const res = await request(app)
        .patch(`/api/patients/${elsaId}/status`)
        .set(auth(adminToken))
        .send({ isActive: false, reason: "OTHER" });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe("PATIENT_STATUS_UNCHANGED");
    });
  });
});
