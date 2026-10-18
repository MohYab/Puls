import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { auth, loginAs, requireValue } from "./helpers.js";

/**
 * Admin rules for appointment types and the calendar doctor filter.
 * Requires a seeded database (npx prisma db seed), including the inactive
 * type "Group education".
 *
 * Every request here is rejected before anything is written (401/403/400/409),
 * or only reads, so the suite can run repeatedly against the dev database.
 */

const INACTIVE_TYPE_NAME = "Group education";

interface AppointmentTypeRow {
  id: string;
  name: string;
  duration: number;
  isActive: boolean;
}

interface AppointmentRow {
  doctorId: string;
}

describe("Appointment type admin rules and the doctor filter", () => {
  const app = createApp();

  let erikToken: string;
  let erikDoctorId: string;
  let saraDoctorId: string;
  let adminToken: string;
  let activeType: AppointmentTypeRow;
  let inactiveType: AppointmentTypeRow;
  let patientId: string;

  beforeAll(async () => {
    const [erik, sara, admin] = await Promise.all([
      loginAs(app, "erik@puls.test"),
      loginAs(app, "sara@puls.test"),
      loginAs(app, "admin@puls.test"),
    ]);
    erikToken = erik.token;
    adminToken = admin.token;
    erikDoctorId = requireValue(erik.user.doctorId, "Erik must have a doctor profile");
    saraDoctorId = requireValue(sara.user.doctorId, "Sara must have a doctor profile");

    const allTypes = await request(app)
      .get("/api/appointment-types")
      .query({ includeInactive: "true" })
      .set(auth(adminToken));
    expect(allTypes.status).toBe(200);

    const types = allTypes.body as AppointmentTypeRow[];
    inactiveType = requireValue(
      types.find((t) => t.name === INACTIVE_TYPE_NAME),
      `Seed must contain the inactive type "${INACTIVE_TYPE_NAME}". Run: npx prisma db seed`
    );
    expect(inactiveType.isActive).toBe(false);
    activeType = requireValue(
      types.find((t) => t.isActive),
      "Seed must contain at least one active type"
    );

    const patients = await request(app)
      .get("/api/patients")
      .query({ search: "anna andersson" })
      .set(auth(erikToken));
    expect(patients.status).toBe(200);
    patientId = requireValue(patients.body[0]?.id as string | undefined, "Anna must exist in seed");
  });

  describe("write endpoints are admin only", () => {
    const validBody = { name: "Should never be created", duration: 30 };

    it("returns 401 without a token", async () => {
      const res = await request(app).post("/api/appointment-types").send(validBody);

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("UNAUTHORIZED");
    });

    it("blocks a doctor from creating a type", async () => {
      const res = await request(app)
        .post("/api/appointment-types")
        .set(auth(erikToken))
        .send(validBody);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe("FORBIDDEN");
    });

    it("blocks a doctor from editing a type", async () => {
      const res = await request(app)
        .put(`/api/appointment-types/${activeType.id}`)
        .set(auth(erikToken))
        .send({ name: activeType.name, duration: activeType.duration });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe("FORBIDDEN");
    });

    it("blocks a doctor from deactivating a type", async () => {
      const res = await request(app)
        .patch(`/api/appointment-types/${activeType.id}/status`)
        .set(auth(erikToken))
        .send({ isActive: false });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe("FORBIDDEN");
    });

    it("rejects a duplicate name regardless of case (admin)", async () => {
      const res = await request(app)
        .post("/api/appointment-types")
        .set(auth(adminToken))
        .send({ name: activeType.name.toUpperCase(), duration: 30 });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe("APPOINTMENT_TYPE_EXISTS");
    });

    it("rejects a duration that is not in 5-minute steps (admin)", async () => {
      const res = await request(app)
        .post("/api/appointment-types")
        .set(auth(adminToken))
        .send({ name: "Should never be created", duration: 7 });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("inactive types", () => {
    it("are hidden from doctors by default", async () => {
      const res = await request(app).get("/api/appointment-types").set(auth(erikToken));

      expect(res.status).toBe(200);
      const ids = (res.body as AppointmentTypeRow[]).map((t) => t.id);
      expect(ids).not.toContain(inactiveType.id);
    });

    it("stay hidden from doctors even with includeInactive=true", async () => {
      const res = await request(app)
        .get("/api/appointment-types")
        .query({ includeInactive: "true" })
        .set(auth(erikToken));

      expect(res.status).toBe(200);
      const types = res.body as AppointmentTypeRow[];
      expect(types.every((t) => t.isActive)).toBe(true);
    });

    it("are hidden from admin unless includeInactive=true", async () => {
      const res = await request(app).get("/api/appointment-types").set(auth(adminToken));

      expect(res.status).toBe(200);
      const ids = (res.body as AppointmentTypeRow[]).map((t) => t.id);
      expect(ids).not.toContain(inactiveType.id);
    });

    it("cannot be booked", async () => {
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const res = await request(app).post("/api/appointments").set(auth(erikToken)).send({
        patientId,
        doctorId: erikDoctorId,
        appointmentTypeId: inactiveType.id,
        startTime: nextWeek,
      });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("APPOINTMENT_TYPE_INACTIVE");
    });
  });

  describe("doctor filter on GET /appointments", () => {
    it("lets admin limit the list to one doctor", async () => {
      const res = await request(app)
        .get("/api/appointments")
        .query({ doctorId: erikDoctorId })
        .set(auth(adminToken));

      expect(res.status).toBe(200);
      const appointments = res.body as AppointmentRow[];
      expect(appointments.length).toBeGreaterThan(0);
      expect(appointments.every((a) => a.doctorId === erikDoctorId)).toBe(true);
    });

    it("ignores doctorId for a doctor, who only sees their own appointments", async () => {
      const res = await request(app)
        .get("/api/appointments")
        .query({ doctorId: saraDoctorId })
        .set(auth(erikToken));

      expect(res.status).toBe(200);
      const appointments = res.body as AppointmentRow[];
      expect(appointments.length).toBeGreaterThan(0);
      expect(appointments.every((a) => a.doctorId === erikDoctorId)).toBe(true);
    });
  });
});
