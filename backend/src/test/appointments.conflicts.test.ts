import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { prisma } from "../utils/prisma.js";
import { auth, loginAs, requireValue } from "./helpers.js";

// YYYY-MM-DD in local (Swedish) time.
function ymd(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// A weekday at least 90 days ahead; the seed only uses days around today.
function testDay(): string {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 90);
  while (date.getDay() === 0 || date.getDay() === 6) {
    date.setDate(date.getDate() + 1);
  }
  return ymd(date);
}

/**
 * The double-booking check (assertNoConflict) on create, edit and after a
 * cancellation. Everything happens on a day the seed does not use, and every
 * appointment the suite creates is deleted in afterAll (the API has no DELETE).
 *
 * The tests run in order: B (Erik, 10:00) is created in beforeAll, and later
 * tests use the appointments that earlier tests created.
 */
describe("Appointment conflicts", () => {
  const app = createApp();
  const day = testDay();
  const createdIds: string[] = [];

  let erikToken: string;
  let saraToken: string;
  let erikDoctorId: string;
  let saraDoctorId: string;
  let patientId: string;
  let appointmentTypeId: string;
  let duration: number; // minutes, from the API
  let half: number; // a point strictly inside an appointment
  let existingId: string; // B

  const B_START = 10 * 60; // 10:00, in minutes after midnight

  // Swedish wall-clock time on the test day, built the same way as the
  // frontend (AppointmentForm): local time, then toISOString().
  const at = (minutes: number) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const hhmm = `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
    return new Date(`${day}T${hhmm}:00`).toISOString();
  };

  const book = (token: string, doctorId: string, startMinutes: number) =>
    request(app)
      .post("/api/appointments")
      .set(auth(token))
      .send({ patientId, doctorId, appointmentTypeId, startTime: at(startMinutes) });

  // Books and remembers the id for cleanup, whatever the test expects.
  const bookAndTrack = async (token: string, doctorId: string, startMinutes: number) => {
    const res = await book(token, doctorId, startMinutes);
    if (res.status === 201) createdIds.push(res.body.id);
    return res;
  };

  const move = (id: string, startMinutes: number) =>
    request(app)
      .put(`/api/appointments/${id}`)
      .set(auth(erikToken))
      .send({ startTime: at(startMinutes) });

  const listDay = (token: string) =>
    request(app).get("/api/appointments").query({ date: day }).set(auth(token));

  beforeAll(async () => {
    // Local times above are only Swedish time if the process runs in it.
    expect(Intl.DateTimeFormat().resolvedOptions().timeZone, "Run with TZ=Europe/Stockholm").toBe(
      "Europe/Stockholm"
    );

    const [erik, sara] = await Promise.all([
      loginAs(app, "erik@puls.test"),
      loginAs(app, "sara@puls.test"),
    ]);
    erikToken = erik.token;
    saraToken = sara.token;
    erikDoctorId = requireValue(erik.user.doctorId, "Erik must have a doctor profile");
    saraDoctorId = requireValue(sara.user.doctorId, "Sara must have a doctor profile");

    // The day must be empty for both doctors, or the results would mean nothing.
    const [erikDay, saraDay] = await Promise.all([listDay(erikToken), listDay(saraToken)]);
    expect(erikDay.status).toBe(200);
    expect(saraDay.status).toBe(200);
    expect(erikDay.body, `Erik must have no appointments on ${day}`).toEqual([]);
    expect(saraDay.body, `Sara must have no appointments on ${day}`).toEqual([]);

    const [patients, types] = await Promise.all([
      request(app).get("/api/patients").query({ search: "anna andersson" }).set(auth(erikToken)),
      request(app).get("/api/appointment-types").set(auth(erikToken)),
    ]);
    patientId = requireValue(
      (patients.body as { id: string; isActive: boolean }[]).find((p) => p.isActive)?.id,
      "Seed needs an active patient Anna Andersson"
    );

    // Longer than 15 minutes, so moving B by a quarter still overlaps itself.
    // At most 3 hours, so every time below stays within 07:00–17:00.
    const type = requireValue(
      (types.body as { id: string; duration: number }[]).find(
        (t) => t.duration > 15 && t.duration <= 180
      ),
      "Seed needs an active appointment type between 20 and 180 minutes"
    );
    appointmentTypeId = type.id;
    duration = type.duration;
    half = Math.floor(duration / 2);

    const existing = await bookAndTrack(erikToken, erikDoctorId, B_START);
    expect(existing.status).toBe(201);
    existingId = existing.body.id;
  });

  afterAll(async () => {
    // Only the ids this suite created. Status changes first (foreign key).
    await prisma.appointmentStatusChange.deleteMany({
      where: { appointmentId: { in: createdIds } },
    });
    await prisma.appointment.deleteMany({ where: { id: { in: createdIds } } });
  });

  describe("booking a new appointment", () => {
    it.each([
      ["starts before B and ends inside it", () => B_START - duration + half],
      ["starts inside B", () => B_START + half],
      ["starts at the same time as B", () => B_START],
    ])("rejects one that %s (409)", async (_case, start) => {
      const res = await bookAndTrack(erikToken, erikDoctorId, start());

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe("APPOINTMENT_CONFLICT");
    });

    it("books the same time as B for another doctor (201)", async () => {
      const res = await bookAndTrack(saraToken, saraDoctorId, B_START);

      expect(res.status).toBe(201);
      expect(res.body.doctorId).toBe(saraDoctorId);
    });
  });

  describe("editing an appointment", () => {
    it("moves B a quarter of an hour, overlapping only itself (200)", async () => {
      const later = await move(existingId, B_START + 15);
      expect(later.status).toBe(200);
      expect(later.body.startTime).toBe(at(B_START + 15));

      // Back to 10:00 for the tests below (again overlapping only itself).
      const back = await move(existingId, B_START);
      expect(back.status).toBe(200);
      expect(back.body.startTime).toBe(at(B_START));
    });
  });

  describe("edge to edge with B", () => {
    it.each([
      ["ends exactly when B starts", () => B_START - duration],
      ["starts exactly when B ends", () => B_START + duration],
    ])("books one that %s (201)", async (_case, start) => {
      const res = await bookAndTrack(erikToken, erikDoctorId, start());

      expect(res.status).toBe(201);
      expect(res.body.startTime).toBe(at(start()));
    });
  });

  describe("after the edge-to-edge bookings", () => {
    // The appointment that starts when B ends, created above.
    const findAfterB = async () => {
      const res = await listDay(erikToken);
      return requireValue(
        (res.body as { id: string; startTime: string }[]).find(
          (a) => a.startTime === at(B_START + duration)
        ),
        "The edge-to-edge test should have booked an appointment after B"
      );
    };

    it("rejects moving another appointment into B (409)", async () => {
      const afterB = await findAfterB();

      const res = await move(afterB.id, B_START + half);

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe("APPOINTMENT_CONFLICT");
    });

    it("frees the time when an appointment is cancelled (201)", async () => {
      const afterB = await findAfterB();

      const cancelled = await request(app)
        .patch(`/api/appointments/${afterB.id}/status`)
        .set(auth(erikToken))
        .send({ status: "CANCELLED" });
      expect(cancelled.status).toBe(200);

      const res = await bookAndTrack(erikToken, erikDoctorId, B_START + duration);

      expect(res.status).toBe(201);
    });
  });
});
