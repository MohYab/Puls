import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders, testDoctor } from "../../test/render";
import type { ClinicalNote } from "../../types/note";
import { PreviousNotes } from "./PreviousNotes";
import { usePatientNotes } from "./useNotes";

vi.mock(import("./useNotes"), async (importOriginal) => ({
  ...(await importOriginal()),
  usePatientNotes: vi.fn(),
}));

function note(overrides: Partial<ClinicalNote>): ClinicalNote {
  return {
    id: "n1",
    appointmentId: "a1",
    patientId: "p1",
    doctorId: testDoctor.doctorId!,
    templateId: null,
    content: { reasonForVisit: "Check-up", observation: "", assessment: "Healthy", plan: "" },
    createdAt: "2026-10-22T10:00:00.000Z",
    updatedAt: "2026-10-22T10:00:00.000Z",
    appointment: {
      startTime: "2026-10-22T09:30:00.000Z",
      appointmentType: { name: "Annual check-up" },
    },
    doctor: { user: { name: "Dr. Erik Lindqvist" } },
    ...overrides,
  };
}

describe("PreviousNotes", () => {
  afterEach(() => vi.clearAllMocks());

  it("shows vital signs on one line and marks a note shared by another doctor", () => {
    vi.mocked(usePatientNotes).mockReturnValue({
      data: [
        note({
          content: {
            reasonForVisit: "Check-up",
            observation: "",
            assessment: "Healthy",
            plan: "",
            vitals: { systolic: 138, diastolic: 86, heartRate: 72 },
          },
        }),
        note({
          id: "n2",
          appointmentId: "a2",
          doctorId: "doctor-sara",
          doctor: { user: { name: "Dr. Sara Nilsson" } },
        }),
      ],
      isPending: false,
      isError: false,
    } as unknown as ReturnType<typeof usePatientNotes>);

    renderWithProviders(<PreviousNotes patientId="p1" />, { user: testDoctor });

    expect(screen.getByText("BP 138/86 mmHg · HR 72/min")).toBeInTheDocument();
    expect(screen.getByText("Shared by Dr. Sara Nilsson")).toBeInTheDocument();
    // Only the doctor's own note links to the documentation page.
    expect(screen.getAllByRole("link", { name: "Open documentation" })).toHaveLength(1);
  });
});
