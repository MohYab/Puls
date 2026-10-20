import request from "supertest";
import type { Express } from "express";

const SEED_PASSWORD = "password123";

export async function loginAs(app: Express, email: string) {
  const res = await request(app).post("/api/auth/login").send({ email, password: SEED_PASSWORD });

  if (res.status !== 200 || !res.body.token) {
    const reason = res.body?.error?.message ?? "no error message";
    throw new Error(
      `Login failed for ${email} (status ${res.status}: ${reason}). ` +
        "Is PostgreSQL running (pg_isready -h localhost) and the database seeded (npx prisma db seed)?"
    );
  }

  return {
    token: res.body.token as string,
    user: res.body.user as {
      id: string;
      name: string;
      email: string;
      role: "DOCTOR" | "ADMIN";
      doctorId: string | null;
    },
  };
}

export function auth(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// Fails the test setup with a clear message when seed data is missing,
// instead of a later "cannot read properties of undefined".
export function requireValue<T>(value: T | null | undefined, message: string): T {
  if (value === null || value === undefined) {
    throw new Error(message);
  }
  return value;
}
