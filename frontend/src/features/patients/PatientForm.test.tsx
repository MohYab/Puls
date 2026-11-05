import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApiError } from "../../services/apiClient";
import { renderWithProviders } from "../../test/render";
import type { Patient } from "../../types/patient";
import { PatientForm } from "./PatientForm";
import { usePatients, useSavePatient } from "./usePatients";

vi.mock(import("./usePatients"), async (importOriginal) => ({
  ...(await importOriginal()),
  usePatients: vi.fn(),
  useSavePatient: vi.fn(),
}));

function patient(overrides: Partial<Patient>): Patient {
  return {
    id: "p-anna",
    firstName: "Anna",
    lastName: "Andersson",
    dateOfBirth: "1985-03-12T00:00:00.000Z",
    phone: null,
    email: null,
    isActive: true,
    deactivatedAt: null,
    deactivationReason: null,
    ...overrides,
  };
}

describe("PatientForm", () => {
  afterEach(() => vi.clearAllMocks());

  it("explains a duplicate and links to the existing patient instead of saving it", async () => {
    vi.mocked(useSavePatient).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: true,
      error: new ApiError(
        409,
        "PATIENT_EXISTS",
        "A patient with that name and date of birth exists"
      ),
    } as unknown as ReturnType<typeof useSavePatient>);
    vi.mocked(usePatients).mockReturnValue({
      data: [patient({ id: "p-existing" })],
    } as unknown as ReturnType<typeof usePatients>);
    const onCancel = vi.fn();

    // Editing p-anna into a copy of p-existing.
    renderWithProviders(
      <PatientForm patient={patient({})} onSuccess={() => {}} onCancel={onCancel} />
    );
    await userEvent.click(screen.getByRole("button", { name: "Save changes" }));

    const link = screen.getByRole("link", { name: /Anna Andersson · 1985-03-12/ });
    expect(link).toHaveAttribute("href", "/patients/p-existing");
    expect(screen.getByText(/already exists/)).toBeInTheDocument();

    await userEvent.click(link);
    expect(onCancel).toHaveBeenCalled();
  });
});
