import { describe, expect, it } from "vitest";
import { correctionTargets, isFinalStatus, workflowTargets } from "./appointmentStatus";

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

  it("offers nothing for a final status", () => {
    for (const status of ["COMPLETED", "NO_SHOW", "CANCELLED"] as const) {
      expect(workflowTargets(status, PAST)).toEqual([]);
    }
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

describe("correctionTargets (admin)", () => {
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
