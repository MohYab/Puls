import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { auth, loginAs } from "./helpers.js";

const app = createApp();

interface AppointmentBody {
  id: string;
  doctorId: string;
  status: string;
  startTime: string;
  hasNote?: boolean;
  note?: unknown;
  patient: { firstName: string; lastName: string };
}

interface ToDocumentBody {
  appointments: AppointmentBody[];
  total: number;
}

// Read-only tests: test files run in parallel, so creating a note here could
// change what other files see. "Documenting removes it from the list" is
// tested by hand (docs/manual-testing.md).
describe("GET /api/appointments/to-document", () => {
  let doctorToken: string;
  let doctorId: string;
  let adminToken: string;

  beforeAll(async () => {
    const erik = await loginAs(app, "erik@puls.test");
    doctorToken = erik.token;
    doctorId = erik.user.doctorId!;
    adminToken = (await loginAs(app, "admin@puls.test")).token;
  });

  it("lists the doctor's own completed visits without a note, oldest first", async () => {
    // 200 also proves the route order: under /:id this would be a 404.
    const res = await request(app).get("/api/appointments/to-document").set(auth(doctorToken));

    expect(res.status).toBe(200);
    const { appointments, total } = res.body as ToDocumentBody;

    expect(
      appointments.length,
      "Erik has no undocumented completed visits. Manual tests may have documented them: run npx prisma db seed"
    ).toBeGreaterThan(0);
    expect(appointments.length).toBeLessThanOrEqual(20);
    expect(total).toBeGreaterThanOrEqual(appointments.length);

    for (const appointment of appointments) {
      expect(appointment.doctorId).toBe(doctorId);
      expect(appointment.status).toBe("COMPLETED");
      expect(appointment.hasNote).toBe(false);
      expect(appointment).not.toHaveProperty("note");
    }

    const times = appointments.map((a) => Date.parse(a.startTime));
    expect(times).toEqual([...times].sort((a, b) => a - b));

    // Seed: Folke has a completed visit with Erik that is not documented.
    expect(appointments.some((a) => a.patient.firstName === "Folke")).toBe(true);
  });

  it("counts the same visits as the doctor's full appointment list", async () => {
    const [toDocument, all] = await Promise.all([
      request(app).get("/api/appointments/to-document").set(auth(doctorToken)),
      request(app).get("/api/appointments").set(auth(doctorToken)),
    ]);

    const expected = (all.body as AppointmentBody[]).filter(
      (a) => a.status === "COMPLETED" && a.hasNote === false
    ).length;
    expect((toDocument.body as ToDocumentBody).total).toBe(expected);
  });

  it("is forbidden for admins", async () => {
    const res = await request(app).get("/api/appointments/to-document").set(auth(adminToken));

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("requires a token", async () => {
    const res = await request(app).get("/api/appointments/to-document");

    expect(res.status).toBe(401);
  });
});
