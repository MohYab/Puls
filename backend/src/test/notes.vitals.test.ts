import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { auth, loginAs } from "./helpers.js";

/**
 * Vital signs in a note. Uses Erik's note for Anna (seed). Rejected requests
 * write nothing; the one successful save restores the original content.
 */
describe("Vital signs in clinical notes", () => {
  const app = createApp();
  let erikToken: string;
  let noteId: string;
  let original: Record<string, unknown>;

  const put = (content: Record<string, unknown>) =>
    request(app).put(`/api/notes/${noteId}`).set(auth(erikToken)).send(content);

  beforeAll(async () => {
    erikToken = (await loginAs(app, "erik@puls.test")).token;

    const patients = await request(app)
      .get("/api/patients")
      .query({ search: "anna andersson" })
      .set(auth(erikToken));
    const notes = await request(app)
      .get(`/api/patients/${patients.body[0].id}/notes`)
      .set(auth(erikToken));
    expect(notes.body.length, "Erik needs a note for Anna in seed").toBeGreaterThan(0);

    noteId = notes.body[0].id;
    original = notes.body[0].content;
  });

  afterAll(async () => {
    await put(original);
  });

  it("saves valid vital signs and returns them with the note", async () => {
    const vitals = {
      systolic: 138,
      diastolic: 86,
      heartRate: 72,
      temperature: 36.8,
      oxygenSaturation: 98,
      respiratoryRate: 14,
      weight: 68.5,
      height: 167,
    };

    const res = await put({ ...original, vitals });

    expect(res.status).toBe(200);
    expect(res.body.content.vitals).toEqual(vitals);
  });

  it("does not store an empty vitals object", async () => {
    const res = await put({ ...original, vitals: {} });

    expect(res.status).toBe(200);
    expect(res.body.content).not.toHaveProperty("vitals");
  });

  it.each([
    [{ height: 1670 }, "Must be between 30 and 250 cm"],
    [{ systolic: 138 }, "Enter both values"],
    [{ systolic: 80, diastolic: 90 }, "Systolic must be higher than diastolic"],
    [{ heartRate: 72.5 }, "Must be a whole number"],
    [{ temperature: 36.85 }, "At most one decimal"],
    [{ weight: "heavy" }, "Must be a number"],
  ])("rejects %o", async (vitals, message) => {
    const res = await put({ ...original, vitals });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.message).toContain(message);
  });
});
