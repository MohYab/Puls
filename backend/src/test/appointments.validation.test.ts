import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { auth, loginAs, requireValue } from "./helpers.js";

/**
 * Booking with ids that do not exist. Every request is rejected before
 * anything is written, so the suite can run repeatedly.
 */

describe("Booking with unknown ids", () => {
  const app = createApp();

  let erikToken: string;
  let adminToken: string;
  let erikDoctorId: string;
  let patientId: string;
  let appointmentTypeId: string;
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  beforeAll(async () => {
    const [erik, admin] = await Promise.all([
      loginAs(app, "erik@puls.test"),
      loginAs(app, "admin@puls.test"),
    ]);
    erikToken = erik.token;
    adminToken = admin.token;
    erikDoctorId = requireValue(erik.user.doctorId, "Erik must have a doctor profile");

    const [patients, types] = await Promise.all([
      request(app).get("/api/patients").query({ search: "anna andersson" }).set(auth(adminToken)),
      request(app).get("/api/appointment-types").set(auth(adminToken)),
    ]);
    patientId = requireValue(patients.body[0]?.id as string | undefined, "Anna must exist in seed");
    appointmentTypeId = requireValue(types.body[0]?.id as string | undefined, "Seed needs a type");
  });

  it("rejects an unknown patient", async () => {
    const res = await request(app).post("/api/appointments").set(auth(erikToken)).send({
      patientId: "does-not-exist",
      doctorId: erikDoctorId,
      appointmentTypeId,
      startTime: nextWeek,
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.message).toBe("Patient not found");
  });

  it("rejects an unknown doctor (admin chooses the doctor)", async () => {
    const res = await request(app)
      .post("/api/appointments")
      .set(auth(adminToken))
      .send({ patientId, doctorId: "does-not-exist", appointmentTypeId, startTime: nextWeek });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe("Doctor not found");
  });

  it("rejects an unknown appointment type", async () => {
    const res = await request(app).post("/api/appointments").set(auth(erikToken)).send({
      patientId,
      doctorId: erikDoctorId,
      appointmentTypeId: "does-not-exist",
      startTime: nextWeek,
    });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe("Appointment type not found");
  });
});
