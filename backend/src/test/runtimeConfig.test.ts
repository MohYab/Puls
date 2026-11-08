import { describe, expect, it } from "vitest";
import { assertProductionConfig, parseCorsOrigins } from "../utils/runtimeConfig.js";

const validProduction = {
  NODE_ENV: "production",
  DATABASE_URL: "postgresql://user:pass@host/db",
  JWT_SECRET: "a".repeat(32),
  CORS_ORIGIN: "https://puls.example",
};

describe("parseCorsOrigins", () => {
  it("splits a comma-separated list, trims it and removes trailing slashes", () => {
    expect(parseCorsOrigins(" https://a.example , https://b.example/ ")).toEqual([
      "https://a.example",
      "https://b.example",
    ]);
  });

  it("returns an empty list when the variable is missing or empty", () => {
    expect(parseCorsOrigins(undefined)).toEqual([]);
    expect(parseCorsOrigins(" , ")).toEqual([]);
  });
});

describe("assertProductionConfig", () => {
  it("does nothing outside production", () => {
    expect(() => assertProductionConfig({ NODE_ENV: "development" })).not.toThrow();
  });

  it("accepts a complete production configuration", () => {
    expect(() => assertProductionConfig(validProduction)).not.toThrow();
  });

  it("names every missing variable", () => {
    expect(() => assertProductionConfig({ NODE_ENV: "production" })).toThrow(
      "DATABASE_URL, JWT_SECRET, CORS_ORIGIN"
    );
  });

  it.each([
    ["the example value", "your-secret-key-here"],
    ["a short value", "too-short"],
  ])("rejects %s as JWT_SECRET", (_label, secret) => {
    expect(() => assertProductionConfig({ ...validProduction, JWT_SECRET: secret })).toThrow(
      "JWT_SECRET"
    );
  });

  it("rejects a CORS_ORIGIN without any origin", () => {
    expect(() => assertProductionConfig({ ...validProduction, CORS_ORIGIN: " , " })).toThrow(
      "CORS_ORIGIN"
    );
  });
});
