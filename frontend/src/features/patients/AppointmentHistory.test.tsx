import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders, testAdmin, testDoctor } from "../../test/render";
import type { PatientAppointment } from "../../types/appointment";
import { AppointmentHistory } from "./AppointmentHistory";
import { usePatientAppointments } from "./usePatients";

vi.mock(import("./usePatients"), async (importOriginal) => ({
  ...(await importOriginal()),
  usePatientAppointments: vi.fn(),
}));

function mockRows(rows: PatientAppointment[]) {
  vi.mocked(usePatientAppointments).mockReturnValue({
    data: rows,
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof usePatientAppointments>);
}

const documented: PatientAppointment = {
  id: "a1",
  startTime: "2026-10-22T09:30:00.000Z",
  endTime: "2026-10-22T10:15:00.000Z",
  status: "COMPLETED",
  doctor: { id: "d1", user: { name: "Dr. Erik Lindqvist" } },
  appointmentType: { id: "t1", name: "Annual check-up" },
};

describe("AppointmentHistory", () => {
  afterEach(() => vi.clearAllMocks());

  it("links doctors to the note, with the date in the link name", () => {
    mockRows([{ ...documented, hasNote: true }]);

    renderWithProviders(<AppointmentHistory patientId="p1" />, { user: testDoctor });

    expect(screen.getByRole("link", { name: "Open note, 22 Oct 2026" })).toHaveAttribute(
      "href",
      "/documentation/a1"
    );
  });

  it("has no documentation column for admins", () => {
    mockRows([documented]);

    renderWithProviders(<AppointmentHistory patientId="p1" />, { user: testAdmin });

    expect(screen.getByText("Annual check-up")).toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Documentation" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
