import { describe, expect, it } from "vitest";
import type { PatientAppointment } from "../../types/appointment";
import { documentationAction, findNextPatientAppointment } from "./patientData";

const NOW = new Date("2026-10-30T10:00:00");
const at = (dateTime: string) => new Date(dateTime).toISOString();

function row(overrides: Partial<PatientAppointment>): PatientAppointment {
  return {
    id: "a1",
    startTime: at("2026-10-30T09:00:00"),
    endTime: at("2026-10-30T09:30:00"),
    status: "COMPLETED",
    doctor: { id: "d1", user: { name: "Dr. Erik Lindqvist" } },
    appointmentType: { id: "t1", name: "General consultation" },
    ...overrides,
  };
}

describe("findNextPatientAppointment", () => {
  it("returns the earliest upcoming appointment, although the history is newest first", () => {
    const next = findNextPatientAppointment(
      [
        row({ id: "later", status: "SCHEDULED", startTime: at("2026-11-12T10:00:00") }),
        row({ id: "soon", status: "CONFIRMED", startTime: at("2026-11-05T10:00:00") }),
        row({ id: "past", status: "COMPLETED", startTime: at("2026-10-22T10:30:00") }),
      ],
      NOW
    );

    expect(next?.id).toBe("soon");
  });

  it("skips cancelled appointments and ones that have started", () => {
    const next = findNextPatientAppointment(
      [
        row({ id: "cancelled", status: "CANCELLED", startTime: at("2026-11-01T09:00:00") }),
        row({ id: "started", status: "SCHEDULED", startTime: at("2026-10-30T09:45:00") }),
      ],
      NOW
    );

    expect(next).toBeNull();
  });
});

describe("documentationAction", () => {
  it("opens an existing note, whatever the status", () => {
    expect(
      documentationAction(row({ id: "x", status: "CONFIRMED", hasNote: true }), "DOCTOR")
    ).toEqual({
      label: "Open note",
      to: "/documentation/x",
    });
  });

  it("offers to document a completed visit without a note", () => {
    expect(documentationAction(row({ status: "COMPLETED", hasNote: false }), "DOCTOR")?.label).toBe(
      "Document"
    );
  });

  it("gives nothing for upcoming, no-show and cancelled visits without a note", () => {
    for (const status of ["SCHEDULED", "NO_SHOW", "CANCELLED"] as const) {
      expect(documentationAction(row({ status, hasNote: false }), "DOCTOR")).toBeNull();
    }
  });

  it("never gives admins a link", () => {
    expect(documentationAction(row({ status: "COMPLETED" }), "ADMIN")).toBeNull();
  });
});
