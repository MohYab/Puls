import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { auth, loginAs } from "./helpers.js";

// YYYY-MM-DD in local (Swedish) time, the same way the frontend sends it.
function ymd(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function daysFromToday(days: number): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date;
}

/** Read-only: every request is a GET, so the suite can run repeatedly. */
describe("GET /api/appointments with a date range", () => {
  const app = createApp();
  let erikToken: string;

  beforeAll(async () => {
    erikToken = (await loginAs(app, "erik@puls.test")).token;
  });

  const list = (query: Record<string, string>) =>
    request(app).get("/api/appointments").query(query).set(auth(erikToken));

  it("returns only appointments inside the range, and includes every appointment of each day", async () => {
    // Seed appointments are spread around today, so this week always has some.
    const from = daysFromToday(-3);
    const to = daysFromToday(3);

    const [range, today] = await Promise.all([
      list({ from: ymd(from), to: ymd(to) }),
      list({ date: ymd(daysFromToday(0)) }),
    ]);

    expect(range.status).toBe(200);
    const end = daysFromToday(4); // midnight after `to`
    for (const appointment of range.body as { startTime: string }[]) {
      const start = new Date(appointment.startTime);
      expect(start >= from && start < end).toBe(true);
    }

    // The week contains today, so it must contain all of today's appointments.
    const rangeIds = new Set((range.body as { id: string }[]).map((a) => a.id));
    for (const appointment of today.body as { id: string }[]) {
      expect(rangeIds.has(appointment.id)).toBe(true);
    }
  });

  it("accepts a single day as from = to", async () => {
    const day = ymd(daysFromToday(0));
    const res = await list({ from: day, to: day });
    expect(res.status).toBe(200);
  });

  it.each([
    [{ date: "tomorrow" }, "format YYYY-MM-DD"],
    [{ date: "2026-02-30" }, "format YYYY-MM-DD"],
    [{ from: "2026-10-26" }, "used together"],
    [{ date: "2026-10-26", from: "2026-10-26", to: "2026-10-27" }, "not both"],
    [{ from: "2026-10-27", to: "2026-10-26" }, "on or before"],
    [{ from: "2026-10-26", to: "2026-11-02" }, "At most 7 days"],
  ])("rejects %o with 400", async (query, message) => {
    const res = await list(query);

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain(message);
  });
});