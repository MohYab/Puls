import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { makeAppointment } from "../../test/fixtures";
import { renderWithProviders, testAdmin } from "../../test/render";
import type { Doctor } from "../../types/doctor";
import { useAppointments, useAppointmentsToDocument } from "../appointments/useAppointments";
import { useDoctors } from "../doctors/useDoctors";
import { AdminDashboard } from "./AdminDashboard";

vi.mock(import("../appointments/useAppointments"), async (importOriginal) => ({
  ...(await importOriginal()),
  useAppointments: vi.fn(),
  useAppointmentsToDocument: vi.fn(),
}));

vi.mock(import("../doctors/useDoctors"), async (importOriginal) => ({
  ...(await importOriginal()),
  useDoctors: vi.fn(),
}));

const inHours = (hours: number) => new Date(Date.now() + hours * 3_600_000).toISOString();

function doctor(id: string, name: string): Doctor {
  return {
    id,
    specialization: null,
    user: {
      id: `u-${id}`,
      name,
      email: `${id}@puls.test`,
      phone: null,
      isActive: true,
      deactivatedAt: null,
    },
  };
}

describe("AdminDashboard", () => {
  afterEach(() => vi.clearAllMocks());

  it("lists doctors with appointments today and links to their calendar", () => {
    const erik = { doctorId: "d-erik", doctor: { user: { name: "Dr. Erik Lindqvist" } } };
    const sara = { doctorId: "d-sara", doctor: { user: { name: "Dr. Sara Holm" } } };

    vi.mocked(useAppointments).mockReturnValue({
      data: [
        makeAppointment({ id: "1", ...erik, status: "COMPLETED", startTime: inHours(-2) }),
        makeAppointment({ id: "2", ...erik, status: "SCHEDULED", startTime: inHours(2) }),
        makeAppointment({ id: "3", ...sara, status: "CANCELLED", startTime: inHours(1) }),
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useAppointments>);

    vi.mocked(useDoctors).mockReturnValue({
      data: [
        doctor("d-erik", "Dr. Erik Lindqvist"),
        doctor("d-sara", "Dr. Sara Holm"),
        doctor("d-johan", "Dr. Johan Ek"),
      ],
    } as unknown as ReturnType<typeof useDoctors>);

    renderWithProviders(<AdminDashboard />, { user: testAdmin });

    expect(
      screen.getByText("3 appointments · 1 doctor with appointments today")
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dr. Erik Lindqvist" })).toHaveAttribute(
      "href",
      "/calendar?doctor=d-erik"
    );
    // Sara only has a cancelled appointment, so she is not working today.
    expect(screen.queryByRole("link", { name: "Dr. Sara Holm" })).not.toBeInTheDocument();
    expect(screen.getByText("2 doctors have no appointments today.")).toBeInTheDocument();
  });

  it("never asks for visits to document (admins have no access to notes)", () => {
    vi.mocked(useAppointments).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useAppointments>);
    vi.mocked(useDoctors).mockReturnValue({ data: [] } as unknown as ReturnType<typeof useDoctors>);

    renderWithProviders(<AdminDashboard />, { user: testAdmin });

    expect(useAppointmentsToDocument).not.toHaveBeenCalled();
    expect(screen.queryByRole("heading", { name: "To document" })).not.toBeInTheDocument();
    expect(screen.getByText("No doctors have appointments today.")).toBeInTheDocument();
  });
});
