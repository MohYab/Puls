import { describe, expect, it } from "vitest";
import { canChangeStatus, isCorrection } from "../utils/appointmentStatus.js";

// Pure rules, tested without a database (the API tests are in appointmentStatus.test.ts).

describe("appointment status rules", () => {
  it("allows the normal workflow without a reason", () => {
    expect(canChangeStatus("SCHEDULED", "CONFIRMED")).toBe(true);
    expect(isCorrection("SCHEDULED", "CONFIRMED")).toBe(false);
    expect(canChangeStatus("CONFIRMED", "COMPLETED")).toBe(true);
  });

  it("lets a no-show become completed without a reason: the patient arrived late", () => {
    expect(canChangeStatus("NO_SHOW", "COMPLETED")).toBe(true);
    expect(isCorrection("NO_SHOW", "COMPLETED")).toBe(false);
  });

  it("treats other changes from a final status as corrections", () => {
    expect(canChangeStatus("COMPLETED", "NO_SHOW")).toBe(true);
    expect(isCorrection("COMPLETED", "NO_SHOW")).toBe(true);
    expect(isCorrection("CANCELLED", "SCHEDULED")).toBe(true);
    expect(isCorrection("NO_SHOW", "CANCELLED")).toBe(true);
  });

  it("rejects going back in the workflow and staying on the same status", () => {
    expect(canChangeStatus("CONFIRMED", "SCHEDULED")).toBe(false);
    expect(canChangeStatus("SCHEDULED", "SCHEDULED")).toBe(false);
  });
});
