import { describe, expect, it } from "vitest";
import {
  correctionTargets,
  isCorrection,
  isFinalStatus,
  statusTargets,
  workflowTargets,
} from "./appointmentStatus";

// Far from today, so the tests do not depend on when they run.
const PAST = "2020-01-15T09:00:00.000Z";
const FUTURE = "2099-01-15T09:00:00.000Z";

describe("workflowTargets", () => {
  it("offers confirm and cancel before the appointment has started", () => {
    expect(workflowTargets("SCHEDULED", FUTURE)).toEqual(["CONFIRMED", "CANCELLED"]);
  });

  it("also offers completed and no-show once it has started", () => {
    expect(workflowTargets("SCHEDULED", PAST)).toEqual([
      "CONFIRMED",
      "COMPLETED",
      "NO_SHOW",
      "CANCELLED",
    ]);
  });

  it("does not go back from confirmed to scheduled", () => {
    expect(workflowTargets("CONFIRMED", PAST)).not.toContain("SCHEDULED");
  });

  it("offers nothing for a final status, except completed after a no-show", () => {
    expect(workflowTargets("COMPLETED", PAST)).toEqual([]);
    expect(workflowTargets("CANCELLED", PAST)).toEqual([]);
    // The patient arrived late (decision ak).
    expect(workflowTargets("NO_SHOW", PAST)).toEqual(["COMPLETED"]);
  });
});

describe("isFinalStatus", () => {
  it("treats completed, no-show and cancelled as final", () => {
    expect(isFinalStatus("COMPLETED")).toBe(true);
    expect(isFinalStatus("NO_SHOW")).toBe(true);
    expect(isFinalStatus("CANCELLED")).toBe(true);
    expect(isFinalStatus("SCHEDULED")).toBe(false);
    expect(isFinalStatus("CONFIRMED")).toBe(false);
  });
});

describe("correctionTargets", () => {
  it("offers every other status for a past appointment", () => {
    expect(correctionTargets("NO_SHOW", PAST)).toEqual([
      "SCHEDULED",
      "CONFIRMED",
      "COMPLETED",
      "CANCELLED",
    ]);
  });

  it("never offers completed or no-show before the start time", () => {
    const targets = correctionTargets("CANCELLED", FUTURE);

    expect(targets).not.toContain("COMPLETED");
    expect(targets).not.toContain("NO_SHOW");
    expect(targets).toEqual(["SCHEDULED", "CONFIRMED"]);
  });
});

describe("statusTargets", () => {
  const now = new Date("2026-11-02T12:00:00");
  const past = "2026-11-02T09:00:00.000Z";
  const future = "2026-11-02T15:00:00.000Z";

  it("follows the workflow before a final status", () => {
    expect(statusTargets({ status: "SCHEDULED", startTime: future }, now)).toEqual([
      "CONFIRMED",
      "CANCELLED",
    ]);
    expect(statusTargets({ status: "CONFIRMED", startTime: past }, now)).toEqual([
      "COMPLETED",
      "NO_SHOW",
      "CANCELLED",
    ]);
  });

  it("offers corrections from a final status, with the same safeguards as the API", () => {
    expect(statusTargets({ status: "COMPLETED", startTime: past, hasNote: true }, now)).toEqual([
      "SCHEDULED",
      "CONFIRMED",
      "NO_SHOW",
    ]);
  });

  it("knows which changes are corrections", () => {
    expect(isCorrection("NO_SHOW", "COMPLETED")).toBe(false);
    expect(isCorrection("COMPLETED", "NO_SHOW")).toBe(true);
    expect(isCorrection("SCHEDULED", "CANCELLED")).toBe(false);
  });
});
