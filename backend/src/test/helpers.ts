import request from "supertest";
import type { Express } from "express";

const SEED_PASSWORD = "password123";

export async function loginAs(app: Express, email: string) {
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email, password: SEED_PASSWORD });

  if (res.status !== 200 || !res.body.token) {
    throw new Error(
      `Login failed for ${email} (status ${res.status}). ` +
        "Is the database seeded? Run: npx prisma db seed"
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
