import { describe, expect, it } from "vitest";
import { makeAppointment } from "../../test/fixtures";
import type { Appointment } from "../../types/appointment";
import { birthDateAndAge, countByStatus, countLabel, findNextAppointment, greetingFor, groupByDoctor } from "./dashboardData";

// Local times on one test day, as ISO strings like the API sends.
const at = (time: string) => new Date(`2026-10-30T${time}:00`).toISOString();
const NOW = new Date("2026-10-30T10:00:00");

function appointment(overrides: Partial<Appointment>): Appointment {
  return makeAppointment(overrides);
}

describe("countByStatus", () => {
  it("gives 0 for every status when there are no appointments", () => {
    expect(countByStatus([])).toEqual({
      SCHEDULED: 0,
      CONFIRMED: 0,
      COMPLETED: 0,
      NO_SHOW: 0,
      CANCELLED: 0,
    });
  });

  it("counts each status", () => {
    const counts = countByStatus([
      appointment({ id: "1", status: "COMPLETED" }),
      appointment({ id: "2", status: "COMPLETED" }),
      appointment({ id: "3", status: "CANCELLED" }),
    ]);

    expect(counts.COMPLETED).toBe(2);
    expect(counts.CANCELLED).toBe(1);
    expect(counts.SCHEDULED).toBe(0);
  });
});

describe("findNextAppointment", () => {
  it("returns the earliest upcoming appointment, whatever the order", () => {
    const next = findNextAppointment(
      [
        appointment({ id: "late", status: "SCHEDULED", startTime: at("14:00") }),
        appointment({ id: "soon", status: "CONFIRMED", startTime: at("11:00") }),
      ],
      NOW
    );

    expect(next?.id).toBe("soon");
  });

  it("skips appointments that have started or have a final status", () => {
    const next = findNextAppointment(
      [
        appointment({ id: "started", status: "SCHEDULED", startTime: at("09:30") }),
        appointment({ id: "cancelled", status: "CANCELLED", startTime: at("10:30") }),
        appointment({ id: "next", status: "SCHEDULED", startTime: at("11:30") }),
      ],
      NOW
    );

    expect(next?.id).toBe("next");
  });

  it("returns null when nothing is left today", () => {
    expect(findNextAppointment([], NOW)).toBeNull();
  });
});

describe("groupByDoctor", () => {
  const sara = { doctorId: "d-sara", doctor: { user: { name: "Sara Lind" } } };
  const erik = { doctorId: "d-erik", doctor: { user: { name: "Erik Holm" } } };

  it("gives one row per doctor, sorted by name, with first start and last end", () => {
    const rows = groupByDoctor([
      appointment({ id: "1", ...sara, status: "SCHEDULED", startTime: at("13:00"), endTime: at("13:30") }),
      appointment({ id: "2", ...erik, status: "COMPLETED", startTime: at("08:00"), endTime: at("08:30") }),
      appointment({ id: "3", ...sara, status: "CONFIRMED", startTime: at("09:00"), endTime: at("09:20") }),
    ]);

    expect(rows.map((row) => row.doctorName)).toEqual(["Erik Holm", "Sara Lind"]);
    expect(rows[1]).toMatchObject({ count: 2, firstStart: at("09:00"), lastEnd: at("13:30") });
  });

  it("leaves out cancelled appointments, and doctors with only cancelled ones", () => {
    const rows = groupByDoctor([
      appointment({ id: "1", ...erik, status: "CANCELLED", startTime: at("08:00"), endTime: at("08:30") }),
      appointment({ id: "2", ...sara, status: "CANCELLED", startTime: at("09:00"), endTime: at("09:30") }),
      appointment({ id: "3", ...sara, status: "SCHEDULED", startTime: at("10:00"), endTime: at("10:30") }),
    ]);

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ doctorName: "Sara Lind", count: 1 });
  });

  it("returns an empty list for no appointments", () => {
    expect(groupByDoctor([])).toEqual([]);
  });
});

describe("greetingFor", () => {
  it("follows the time of day", () => {
    expect(greetingFor(new Date("2026-10-30T08:00:00"))).toBe("Good morning");
    expect(greetingFor(new Date("2026-10-30T12:00:00"))).toBe("Good afternoon");
    expect(greetingFor(new Date("2026-10-30T18:00:00"))).toBe("Good evening");
  });
});

describe("countLabel", () => {
  it("uses the singular only for one", () => {
    expect(countLabel(0, "appointment")).toBe("0 appointments");
    expect(countLabel(1, "appointment")).toBe("1 appointment");
    expect(countLabel(6, "visit")).toBe("6 visits");
  });
});

describe("birthDateAndAge", () => {
  it("shows the date of birth and the age on that day", () => {
    const dob = "1985-03-12T00:00:00.000Z";
    expect(birthDateAndAge(dob, new Date("2026-10-30T10:00:00"))).toBe("1985-03-12 · 41 y");
    expect(birthDateAndAge(dob, new Date("2026-03-11T10:00:00"))).toBe("1985-03-12 · 40 y");
  });
});