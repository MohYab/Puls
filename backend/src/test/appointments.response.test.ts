import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";

const app = createApp();

interface AppointmentBody {
  doctor?: { user?: { name?: string } };
  hasNote?: boolean;
  note?: unknown;
}

async function tokenFor(email: string): Promise<string> {
  const res = await request(app).post("/api/auth/login").send({ email, password: "password123" });
  expect(res.status).toBe(200);
  return res.body.token as string;
}

describe("Appointment responses", () => {
  let doctorToken: string;
  let adminToken: string;

  beforeAll(async () => {
    doctorToken = await tokenFor("erik@puls.test");
    adminToken = await tokenFor("admin@puls.test");
  });

  it("gives doctors the doctor's name and a hasNote flag, never the note", async () => {
    const res = await request(app)
      .get("/api/appointments")
      .set("Authorization", `Bearer ${doctorToken}`);

    expect(res.status).toBe(200);
    const appointments = res.body as AppointmentBody[];
    expect(appointments.length).toBeGreaterThan(0);

    for (const appointment of appointments) {
      expect(typeof appointment.doctor?.user?.name).toBe("string");
      expect(typeof appointment.hasNote).toBe("boolean");
      expect(appointment).not.toHaveProperty("note");
    }
    // Seed: Erik has a documented visit (Anna) and a completed one without a note (Folke).
    expect(appointments.some((a) => a.hasNote === true)).toBe(true);
    expect(appointments.some((a) => a.hasNote === false)).toBe(true);
  });

  it("gives admins the doctor's name but no note information", async () => {
    const res = await request(app)
      .get("/api/appointments")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    for (const appointment of res.body as AppointmentBody[]) {
      expect(typeof appointment.doctor?.user?.name).toBe("string");
      expect(appointment).not.toHaveProperty("hasNote");
      expect(appointment).not.toHaveProperty("note");
    }
  });

  it("includes the flag on a single appointment for doctors", async () => {
    const list = await request(app)
      .get("/api/appointments")
      .set("Authorization", `Bearer ${doctorToken}`);
    const id = (list.body as { id: string }[])[0].id;

    const res = await request(app)
      .get(`/api/appointments/${id}`)
      .set("Authorization", `Bearer ${doctorToken}`);

    expect(res.status).toBe(200);
    expect(typeof res.body.hasNote).toBe("boolean");
    expect(res.body).not.toHaveProperty("note");
  });
});