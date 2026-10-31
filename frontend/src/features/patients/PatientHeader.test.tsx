import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/render";
import type { PatientAppointment } from "../../types/appointment";
import type { Patient } from "../../types/patient";
import { PatientHeader } from "./PatientHeader";
import { usePatientAppointments } from "./usePatients";

vi.mock(import("./usePatients"), async (importOriginal) => ({
  ...(await importOriginal()),
  usePatientAppointments: vi.fn(),
}));

const inDays = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString();

function patient(overrides: Partial<Patient> = {}): Patient {
  return {
    id: "p-anna",
    firstName: "Anna",
    lastName: "Andersson",
    dateOfBirth: "1985-03-12T00:00:00.000Z",
    phone: "070-174 06 05",
    email: null,
    isActive: true,
    deactivatedAt: null,
    deactivationReason: null,
    ...overrides,
  };
}

function mockHistory(result: object) {
  vi.mocked(usePatientAppointments).mockReturnValue(
    result as unknown as ReturnType<typeof usePatientAppointments>
  );
}

const upcoming: PatientAppointment = {
  id: "next",
  startTime: inDays(5),
  endTime: inDays(5),
  status: "SCHEDULED",
  doctor: { id: "d1", user: { name: "Dr. Erik Lindqvist" } },
  appointmentType: { id: "t1", name: "Follow-up visit" },
};

describe("PatientHeader", () => {
  afterEach(() => vi.clearAllMocks());

  it("shows age, contact details, the next appointment and booking", () => {
    mockHistory({ data: [upcoming], isPending: false, isError: false });

    renderWithProviders(<PatientHeader patient={patient()} />);

    expect(screen.getByRole("heading", { level: 1, name: "Anna Andersson" })).toBeInTheDocument();
    expect(screen.getByText(/^1985-03-12 · \d+ y$/)).toBeInTheDocument();
    expect(screen.getByText("No email")).toBeInTheDocument();
    expect(screen.getByText(/Follow-up visit/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Book appointment" })).toBeInTheDocument();
  });

  it("does not offer booking or a next appointment for an inactive patient", () => {
    mockHistory({ data: [upcoming], isPending: false, isError: false });

    renderWithProviders(
      <PatientHeader
        patient={patient({
          isActive: false,
          deactivationReason: "MOVED",
          deactivatedAt: "2026-10-20T10:00:00.000Z",
        })}
      />
    );

    expect(screen.getByText("Inactive")).toBeInTheDocument();
    expect(screen.getByText("Deactivated 20 Oct 2026 (moved)")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Book appointment" })).not.toBeInTheDocument();
    expect(screen.queryByText(/Next:/)).not.toBeInTheDocument();
  });

  it("never says there is no upcoming appointment when loading failed", () => {
    mockHistory({ data: undefined, isPending: false, isError: true });

    renderWithProviders(<PatientHeader patient={patient()} />);

    expect(screen.getByText("Could not load the next appointment.")).toBeInTheDocument();
    expect(screen.queryByText("No upcoming appointment")).not.toBeInTheDocument();
  });
});
