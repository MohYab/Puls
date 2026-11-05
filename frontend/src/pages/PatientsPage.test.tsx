import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { usePatients } from "../features/patients/usePatients";
import { renderWithProviders } from "../test/render";
import type { Patient } from "../types/patient";
import PatientsPage from "./PatientsPage";

vi.mock(import("../features/patients/usePatients"), async (importOriginal) => ({
  ...(await importOriginal()),
  usePatients: vi.fn(),
}));

function patient(overrides: Partial<Patient>): Patient {
  return {
    id: "p1",
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

describe("PatientsPage", () => {
  afterEach(() => vi.clearAllMocks());

  it("lists patients with age, a link to their page, and marks inactive ones in words", () => {
    vi.mocked(usePatients).mockReturnValue({
      data: [
        patient({ id: "p-anna" }),
        patient({ id: "p-elsa", firstName: "Elsa", lastName: "Nordqvist", isActive: false }),
      ],
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof usePatients>);

    renderWithProviders(<PatientsPage />);

    expect(screen.getByRole("link", { name: "Anna Andersson" })).toHaveAttribute(
      "href",
      "/patients/p-anna"
    );
    expect(screen.getAllByText(/^1985-03-12 · \d+ y$/)).toHaveLength(2);
    expect(screen.getByText("Inactive")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add patient" })).toBeInTheDocument();
  });
});
