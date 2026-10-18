import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { auth, loginAs, requireValue } from "./helpers.js";

/**
 * Status rules for appointments. Requires a seeded database.
 * Every request here is rejected before anything is written, so the suite
 * can run repeatedly. Allowed transitions are covered in manual-testing.md.
 *
 * Seed scenarios used:
 * - Erik has future SCHEDULED appointments
 * - Folke has a COMPLETED appointment with Erik, without a note
 * - Anna has a COMPLETED appointment with Erik, with a note
 */

interface AppointmentRow {
  id: string;
  status: string;
  startTime: string;
}

describe("Appointment status rules", () => {
  const app = createApp();

  let erikToken: string;
  let adminToken: string;
  let futureId: string;
  let completedId: string;
  let withNoteId: string;

  beforeAll(async () => {
    const [erik, admin] = await Promise.all([
      loginAs(app, "erik@puls.test"),
      loginAs(app, "admin@puls.test"),
    ]);
    erikToken = erik.token;
    adminToken = admin.token;

    const now = new Date();
    const own = await request(app).get("/api/appointments").set(auth(erikToken));
    futureId = requireValue(
      (own.body as AppointmentRow[]).find(
        (a) => a.status === "SCHEDULED" && new Date(a.startTime) > now
      )?.id,
      "Erik needs a future SCHEDULED appointment in seed"
    );

    const folke = await request(app)
      .get("/api/patients")
      .query({ search: "folke" })
      .set(auth(erikToken));
    const folkeId = requireValue(
      folke.body[0]?.id as string | undefined,
      "Folke must exist in seed"
    );
    const folkeAppointments = await request(app)
      .get(`/api/patients/${folkeId}/appointments`)
      .set(auth(erikToken));
    completedId = requireValue(
      (folkeAppointments.body as AppointmentRow[]).find((a) => a.status === "COMPLETED")?.id,
      "Folke needs a COMPLETED appointment with Erik in seed"
    );

    const anna = await request(app)
      .get("/api/patients")
      .query({ search: "anna andersson" })
      .set(auth(erikToken));
    const annaId = requireValue(anna.body[0]?.id as string | undefined, "Anna must exist in seed");
    const notes = await request(app).get(`/api/patients/${annaId}/notes`).set(auth(erikToken));
    withNoteId = requireValue(
      notes.body[0]?.appointmentId as string | undefined,
      "Erik needs a note for Anna in seed"
    );
  });

  const setStatus = (id: string, token: string, body: object) =>
    request(app).patch(`/api/appointments/${id}/status`).set(auth(token)).send(body);

  it("rejects a status that is not in the list", async () => {
    const res = await setStatus(futureId, erikToken, { status: "RESCHEDULED" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects changing to the current status", async () => {
    const res = await setStatus(futureId, erikToken, { status: "SCHEDULED" });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("INVALID_STATUS_TRANSITION");
  });

  it("does not mark a future appointment as completed", async () => {
    const res = await setStatus(futureId, erikToken, { status: "COMPLETED" });

    expect(res.status).toBe(409);
    expect(res.body.error.message).toContain("before it has started");
  });

  it("does not let a doctor change a final status", async () => {
    const res = await setStatus(completedId, erikToken, { status: "SCHEDULED" });

    expect(res.status).toBe(409);
    expect(res.body.error.message).toContain("Contact an administrator");
  });

  it("requires a reason when an admin corrects a final status", async () => {
    const res = await setStatus(completedId, adminToken, { status: "NO_SHOW" });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain("reason is required");
  });

  it("does not cancel an appointment that has a clinical note", async () => {
    const res = await setStatus(withNoteId, adminToken, {
      status: "CANCELLED",
      reason: "Should be rejected",
    });

    expect(res.status).toBe(409);
    expect(res.body.error.message).toContain("clinical note");
  });

  it("does not edit an appointment with a final status, not even as admin", async () => {
    const res = await request(app)
      .put(`/api/appointments/${completedId}`)
      .set(auth(adminToken))
      .send({ bookingComment: "Should be rejected" });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("APPOINTMENT_LOCKED");
  });
});
