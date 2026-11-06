import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { auth, loginAs } from "./helpers.js";

const app = createApp();
const DOCTOR_EMAIL = "erik@puls.test";

interface PatientRow {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}

describe("GET /api/patients?search=", () => {
  let token: string;

  beforeAll(async () => {
    ({ token } = await loginAs(app, DOCTOR_EMAIL));
  });

  async function search(term: string): Promise<PatientRow[]> {
    const res = await request(app).get("/api/patients").query({ search: term }).set(auth(token));
    expect(res.status).toBe(200);
    return res.body;
  }

  it("finds patients by birth year", async () => {
    const result = await search("1985");
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) => p.dateOfBirth.startsWith("1985"))).toBe(true);
  });

  it("finds a patient by full date of birth", async () => {
    const result = await search("1985-03-12");
    expect(result.map((p) => `${p.firstName} ${p.lastName}`)).toContain("Anna Andersson");
    expect(result.every((p) => p.dateOfBirth.startsWith("1985-03-12"))).toBe(true);
  });

  it("combines a name and a year", async () => {
    const result = await search("anna 1985");
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) => p.firstName === "Anna" && p.dateOfBirth.startsWith("1985"))).toBe(
      true
    );
  });

  it("treats an impossible date as text and finds nothing", async () => {
    expect(await search("1985-02-31")).toEqual([]);
    expect(await search("1985-13-45")).toEqual([]);
  });

  it("still searches names", async () => {
    const result = await search("andersson");
    expect(result.map((p) => p.lastName)).toContain("Andersson");
  });
});
