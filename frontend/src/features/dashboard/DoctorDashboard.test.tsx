import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { makeAppointment, testPatient } from "../../test/fixtures";
import { renderWithProviders } from "../../test/render";
import { useAppointments, useAppointmentsToDocument } from "../appointments/useAppointments";
import { DoctorDashboard } from "./DoctorDashboard";

vi.mock(import("../appointments/useAppointments"), async (importOriginal) => ({
  ...(await importOriginal()),
  useAppointments: vi.fn(),
  useAppointmentsToDocument: vi.fn(),
}));

// useNow uses the real clock, so the test data is relative to now.
const inHours = (hours: number) => new Date(Date.now() + hours * 3_600_000).toISOString();

function mockToday(result: object) {
  vi.mocked(useAppointments).mockReturnValue(
    result as unknown as ReturnType<typeof useAppointments>
  );
}

function mockToDocument(result: object) {
  vi.mocked(useAppointmentsToDocument).mockReturnValue(
    result as unknown as ReturnType<typeof useAppointmentsToDocument>
  );
}

function card(heading: string) {
  return screen.getByRole("heading", { name: heading }).closest("section") as HTMLElement;
}

describe("DoctorDashboard", () => {
  afterEach(() => vi.clearAllMocks());

  it("shows the next patient, today's schedule and visits to document", () => {
    mockToday({
      data: [
        makeAppointment({
          id: "done",
          status: "COMPLETED",
          hasNote: false,
          startTime: inHours(-3),
          endTime: inHours(-2.5),
          patient: testPatient("Bo", "Berg"),
        }),
        makeAppointment({
          id: "next",
          patientId: "p-cecilia",
          status: "SCHEDULED",
          hasNote: false,
          startTime: inHours(1),
          endTime: inHours(1.5),
          patient: testPatient("Cecilia", "Ek"),
        }),
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mockToDocument({
      data: {
        appointments: [makeAppointment({ id: "old", patient: testPatient("Folke", "Nyberg") })],
        total: 1,
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<DoctorDashboard />);

    expect(screen.getByText("2 appointments today · 1 visit to document")).toBeInTheDocument();

    const next = card("Next patient");
    expect(within(next).getByText("Cecilia Ek")).toBeInTheDocument();
    expect(within(next).getByRole("link", { name: "Open patient" })).toHaveAttribute(
      "href",
      "/patients/p-cecilia"
    );
    expect(within(next).getByRole("link", { name: "Document visit" })).toHaveAttribute(
      "href",
      "/documentation/next"
    );

    const schedule = card("Today's schedule");
    expect(within(schedule).getByRole("link", { name: "Document visit, Bo Berg" })).toHaveAttribute(
      "href",
      "/documentation/done"
    );
    expect(within(schedule).getByRole("link", { name: "Open, Cecilia Ek" })).toHaveAttribute(
      "href",
      "/patients/p-cecilia"
    );

    expect(
      within(card("To document")).getByRole("link", { name: "Document, Folke Nyberg" })
    ).toHaveAttribute("href", "/documentation/old");
  });

  it("shows an error in each card that uses today's appointments, and still lists visits to document", async () => {
    const refetch = vi.fn();
    mockToday({ data: undefined, isLoading: false, isError: true, refetch });
    mockToDocument({
      data: { appointments: [], total: 0 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<DoctorDashboard />);

    for (const heading of ["Next patient", "Today by status", "Today's schedule"]) {
      expect(within(card(heading)).getByRole("alert")).toBeInTheDocument();
    }
    // A failed load must never look like an empty day.
    expect(screen.queryByText("No more patients today.")).not.toBeInTheDocument();
    expect(screen.getByText("All completed visits are documented.")).toBeInTheDocument();

    await userEvent.click(within(card("Next patient")).getByRole("button", { name: /try again/i }));
    expect(refetch).toHaveBeenCalled();
  });
});
