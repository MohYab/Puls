import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { auth, loginAs, requireValue } from "./helpers.js";

/**
 * Booking with invalid input: unknown ids and times outside the opening hours.
 * Every request is rejected before anything is written, so the suite can run
 * repeatedly.
 */
describe("Booking with invalid input", () => {
  const app = createApp();

  let erikToken: string;
  let adminToken: string;
  let erikDoctorId: string;
  let patientId: string;
  let appointmentTypeId: string;
  let appointmentTypeDuration: number;
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  // A fixed winter date, so the offset to Swedish time is always +01:00.
  const clinicTime = (hhmm: string) => new Date(`2030-01-15T${hhmm}:00+01:00`).toISOString();

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

    const type = requireValue(
      (types.body as { id: string; duration: number }[])[0],
      "Seed needs an active appointment type"
    );
    appointmentTypeId = type.id;
    appointmentTypeDuration = type.duration;
  });

  const book = (token: string, body: object) =>
    request(app).post("/api/appointments").set(auth(token)).send(body);

  describe("unknown ids", () => {
    it("rejects an unknown patient", async () => {
      const res = await book(erikToken, {
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
      const res = await book(adminToken, {
        patientId,
        doctorId: "does-not-exist",
        appointmentTypeId,
        startTime: nextWeek,
      });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toBe("Doctor not found");
    });

    it("rejects an unknown appointment type", async () => {
      const res = await book(erikToken, {
        patientId,
        doctorId: erikDoctorId,
        appointmentTypeId: "does-not-exist",
        startTime: nextWeek,
      });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toBe("Appointment type not found");
    });

    it("accepts a start time with a time zone offset", async () => {
      // An unknown patient makes the request stop after validation, so nothing
      // is written. The message shows that the time format itself was accepted.
      const res = await book(erikToken, {
        patientId: "does-not-exist",
        doctorId: erikDoctorId,
        appointmentTypeId,
        startTime: "2030-01-15T10:00:00+01:00",
      });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toBe("Patient not found");
    });
  });

  describe("opening hours (07:00–17:00, Swedish time)", () => {
    it("rejects an appointment that starts before opening", async () => {
      const res = await book(erikToken, {
        patientId,
        doctorId: erikDoctorId,
        appointmentTypeId,
        startTime: clinicTime("06:30"),
      });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain("between 07:00 and 17:00");
    });

    it("rejects an appointment that would end after closing", async () => {
      // Starts 5 minutes too late for the type's duration, so it ends at 17:05.
      const startMinutes = 17 * 60 - appointmentTypeDuration + 5;
      const hh = String(Math.floor(startMinutes / 60)).padStart(2, "0");
      const mm = String(startMinutes % 60).padStart(2, "0");

      const res = await book(erikToken, {
        patientId,
        doctorId: erikDoctorId,
        appointmentTypeId,
        startTime: clinicTime(`${hh}:${mm}`),
      });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain("between 07:00 and 17:00");
    });
  });
});
