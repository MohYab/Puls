import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { auth, loginAs, requireValue } from "./helpers.js";

/**
 * Sharing of clinical notes between doctors.
 * Requires a seeded database (npx prisma db seed). Seed scenario:
 * - Sara has a note about Anna Andersson and has shared it with Johan
 * - Johan has no appointments with Anna; the shared note is his only access
 * - Erik has his own note about Anna and no share from Sara
 *
 * All tests except the lifecycle test are rejected before anything is written.
 * The lifecycle test shares and then revokes (in finally), which only leaves a
 * revoked row behind; that does not change the results of later runs.
 */

interface NoteRow {
  id: string;
  appointmentId: string;
  doctorId: string;
  doctor: { user: { name: string } };
}

interface ShareRow {
  doctor: { id: string; user: { name: string } };
}

describe("Sharing clinical notes between doctors", () => {
  const app = createApp();

  let saraToken: string;
  let saraDoctorId: string;
  let johanToken: string;
  let johanDoctorId: string;
  let erikToken: string;
  let erikDoctorId: string;
  let adminToken: string;
  let annaId: string;
  let saraNote: NoteRow;

  beforeAll(async () => {
    const [sara, johan, erik, admin] = await Promise.all([
      loginAs(app, "sara@puls.test"),
      loginAs(app, "johan@puls.test"),
      loginAs(app, "erik@puls.test"),
      loginAs(app, "admin@puls.test"),
    ]);
    saraToken = sara.token;
    johanToken = johan.token;
    erikToken = erik.token;
    adminToken = admin.token;
    saraDoctorId = requireValue(sara.user.doctorId, "Sara must have a doctor profile");
    johanDoctorId = requireValue(johan.user.doctorId, "Johan must have a doctor profile");
    erikDoctorId = requireValue(erik.user.doctorId, "Erik must have a doctor profile");

    const patients = await request(app)
      .get("/api/patients")
      .query({ search: "anna andersson" })
      .set(auth(adminToken));
    annaId = requireValue(patients.body[0]?.id as string | undefined, "Anna must exist in seed");

    const saraNotes = await request(app).get(`/api/patients/${annaId}/notes`).set(auth(saraToken));
    expect(saraNotes.status).toBe(200);
    saraNote = requireValue(
      (saraNotes.body as NoteRow[]).find((n) => n.doctorId === saraDoctorId),
      "Sara needs a note for Anna in seed"
    );
  });

  describe("recipient (Johan, seeded share)", () => {
    it("sees the shared note on the patient page, with the author's name", async () => {
      const res = await request(app).get(`/api/patients/${annaId}/notes`).set(auth(johanToken));

      expect(res.status).toBe(200);
      const notes = res.body as NoteRow[];
      expect(notes.map((n) => n.id)).toEqual([saraNote.id]);
      expect(notes[0].doctor.user.name).toContain("Sara");
    });

    it("cannot edit the shared note", async () => {
      const res = await request(app)
        .put(`/api/notes/${saraNote.id}`)
        .set(auth(johanToken))
        .send({ plan: "should not be allowed" });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe("FORBIDDEN");
    });

    it("cannot open the note through Sara's appointment", async () => {
      const res = await request(app)
        .get(`/api/appointments/${saraNote.appointmentId}/notes`)
        .set(auth(johanToken));

      expect(res.status).toBe(403);
    });

    it("cannot see or change who the note is shared with", async () => {
      const [list, share] = await Promise.all([
        request(app).get(`/api/notes/${saraNote.id}/shares`).set(auth(johanToken)),
        request(app)
          .post(`/api/notes/${saraNote.id}/shares`)
          .set(auth(johanToken))
          .send({ doctorId: erikDoctorId, consentConfirmed: true }),
      ]);

      expect(list.status).toBe(403);
      expect(share.status).toBe(403);
    });
  });

  describe("other users", () => {
    it("a doctor without a share does not see Sara's note", async () => {
      const res = await request(app).get(`/api/patients/${annaId}/notes`).set(auth(erikToken));

      expect(res.status).toBe(200);
      const ids = (res.body as NoteRow[]).map((n) => n.id);
      expect(ids).not.toContain(saraNote.id);
    });

    it("admin cannot list shares or share", async () => {
      const [list, share] = await Promise.all([
        request(app).get(`/api/notes/${saraNote.id}/shares`).set(auth(adminToken)),
        request(app)
          .post(`/api/notes/${saraNote.id}/shares`)
          .set(auth(adminToken))
          .send({ doctorId: erikDoctorId, consentConfirmed: true }),
      ]);

      expect(list.status).toBe(403);
      expect(share.status).toBe(403);
    });

    it("returns 401 without a token", async () => {
      const res = await request(app).get(`/api/notes/${saraNote.id}/shares`);

      expect(res.status).toBe(401);
    });
  });

  describe("author (Sara)", () => {
    it("lists the active shares", async () => {
      const res = await request(app).get(`/api/notes/${saraNote.id}/shares`).set(auth(saraToken));

      expect(res.status).toBe(200);
      const recipients = (res.body as ShareRow[]).map((s) => s.doctor.id);
      expect(recipients).toContain(johanDoctorId);
      expect(recipients).not.toContain(erikDoctorId);
    });

    it("must confirm consent", async () => {
      const res = await request(app)
        .post(`/api/notes/${saraNote.id}/shares`)
        .set(auth(saraToken))
        .send({ doctorId: erikDoctorId });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("cannot share with herself or with an unknown doctor", async () => {
      const [self, unknown] = await Promise.all([
        request(app)
          .post(`/api/notes/${saraNote.id}/shares`)
          .set(auth(saraToken))
          .send({ doctorId: saraDoctorId, consentConfirmed: true }),
        request(app)
          .post(`/api/notes/${saraNote.id}/shares`)
          .set(auth(saraToken))
          .send({ doctorId: "does-not-exist", consentConfirmed: true }),
      ]);

      expect(self.status).toBe(400);
      expect(unknown.status).toBe(400);
    });

    it("cannot share twice with the same doctor", async () => {
      const res = await request(app)
        .post(`/api/notes/${saraNote.id}/shares`)
        .set(auth(saraToken))
        .send({ doctorId: johanDoctorId, consentConfirmed: true });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe("NOTE_ALREADY_SHARED");
    });

    it("gets 404 when revoking a share that does not exist", async () => {
      const res = await request(app)
        .delete(`/api/notes/${saraNote.id}/shares/${erikDoctorId}`)
        .set(auth(saraToken));

      expect(res.status).toBe(404);
    });
  });

  describe("lifecycle (writes data, revoked again in finally)", () => {
    it("gives read access when shared and removes it when revoked", async () => {
      const erikCanSee = async () => {
        const res = await request(app).get(`/api/patients/${annaId}/notes`).set(auth(erikToken));
        expect(res.status).toBe(200);
        return (res.body as NoteRow[]).some((n) => n.id === saraNote.id);
      };

      expect(await erikCanSee()).toBe(false);

      const shared = await request(app)
        .post(`/api/notes/${saraNote.id}/shares`)
        .set(auth(saraToken))
        .send({ doctorId: erikDoctorId, consentConfirmed: true });

      try {
        expect(shared.status).toBe(201);
        expect(await erikCanSee()).toBe(true);
      } finally {
        // Always revoke, so a failing assertion cannot leave Erik with access.
        const revoked = await request(app)
          .delete(`/api/notes/${saraNote.id}/shares/${erikDoctorId}`)
          .set(auth(saraToken));
        expect(revoked.status).toBe(204);
      }

      expect(await erikCanSee()).toBe(false);
    });
  });
});
