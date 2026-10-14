import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "./app.js";
import { auth, loginAs } from "./test/helpers.js";

/**
 * Note access rules against seed data (see docs/manual-testing.md).
 * Requires DATABASE_URL, JWT_SECRET, and a seeded database:
 *   npx prisma db seed
 *
 * Seed scenario used here:
 * - Anna Andersson has notes with both Erik and Sara
 * - Each doctor may only read/edit their own notes
 * - Admin has no access to clinical notes
 *
 * The appointment under test is found through Erik's note for Anna, not
 * through the appointment list, because Erik also has COMPLETED
 * appointments without a note (Folke). This keeps the suite independent
 * of appointment order in the seed.
 */
describe("Clinical note permissions", () => {
  const app = createApp();

  let erikToken: string;
  let saraToken: string;
  let adminToken: string;
  let annaId: string;
  let erikApptId: string;
  let erikNoteId: string;

  beforeAll(async () => {
    const [erik, sara, admin] = await Promise.all([
      loginAs(app, "erik@puls.test"),
      loginAs(app, "sara@puls.test"),
      loginAs(app, "admin@puls.test"),
    ]);
    erikToken = erik.token;
    saraToken = sara.token;
    adminToken = admin.token;

    const patients = await request(app)
      .get("/api/patients")
      .query({ search: "anna andersson" })
      .set(auth(adminToken));
    expect(patients.status).toBe(200);
    expect(patients.body.length, "Anna Andersson must exist in seed").toBeGreaterThan(0);
    annaId = patients.body[0].id;

    const erikNotes = await request(app)
      .get(`/api/patients/${annaId}/notes`)
      .set(auth(erikToken));
    expect(erikNotes.status).toBe(200);
    expect(erikNotes.body.length, "Erik needs a note for Anna in seed").toBeGreaterThan(0);

    const note = erikNotes.body[0] as { id: string; appointmentId: string };
    expect(typeof note.appointmentId, "note response must include appointmentId").toBe("string");
    erikNoteId = note.id;
    erikApptId = note.appointmentId;
  });

  it("lets the authoring doctor read their own note", async () => {
    const res = await request(app)
      .get(`/api/appointments/${erikApptId}/notes`)
      .set(auth(erikToken));

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(erikNoteId);
  });

  it("returns 401 without a token", async () => {
    const res = await request(app).get(`/api/appointments/${erikApptId}/notes`);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("blocks admin from reading an appointment note", async () => {
    const res = await request(app)
      .get(`/api/appointments/${erikApptId}/notes`)
      .set(auth(adminToken));

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("blocks admin from listing a patient's notes", async () => {
    const res = await request(app)
      .get(`/api/patients/${annaId}/notes`)
      .set(auth(adminToken));

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("blocks another doctor from reading the note", async () => {
    const res = await request(app)
      .get(`/api/appointments/${erikApptId}/notes`)
      .set(auth(saraToken));

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("blocks another doctor from editing the note", async () => {
    const res = await request(app)
      .put(`/api/notes/${erikNoteId}`)
      .set(auth(saraToken))
      .send({ plan: "should not be allowed" });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("lists only the doctor's own notes for a shared patient", async () => {
    const [erikNotes, saraNotes] = await Promise.all([
      request(app).get(`/api/patients/${annaId}/notes`).set(auth(erikToken)),
      request(app).get(`/api/patients/${annaId}/notes`).set(auth(saraToken)),
    ]);

    expect(erikNotes.status).toBe(200);
    expect(saraNotes.status).toBe(200);
    expect(erikNotes.body).toHaveLength(1);
    expect(saraNotes.body).toHaveLength(1);
    expect(erikNotes.body[0].id).not.toBe(saraNotes.body[0].id);
  });
});