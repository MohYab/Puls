import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { auth, loginAs } from "./helpers.js";

/**
 * Patient list order. Requires the seed, which has last names starting with
 * Å and Ö (e.g. Ågren, Åkesson, Öberg). Read only.
 */
describe("GET /api/patients order", () => {
  const app = createApp();
  const NORDIC = "ÅÄÖ";

  it("sorts Å, Ä and Ö after Z, in that order", async () => {
    const { token } = await loginAs(app, "admin@puls.test");
    const res = await request(app).get("/api/patients").set(auth(token));
    expect(res.status).toBe(200);

    const initials = (res.body as { lastName: string }[]).map((p) => p.lastName[0]);
    const firstNordic = initials.findIndex((c) => NORDIC.includes(c));
    expect(firstNordic, "Seed needs last names starting with Å, Ä or Ö").toBeGreaterThan(0);

    // Everything from the first Å/Ä/Ö name onwards starts with Å, Ä or Ö...
    const tail = initials.slice(firstNordic);
    expect(tail.every((c) => NORDIC.includes(c))).toBe(true);

    // ...and in the Swedish order Å, Ä, Ö.
    const positions = tail.map((c) => NORDIC.indexOf(c));
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });
});
