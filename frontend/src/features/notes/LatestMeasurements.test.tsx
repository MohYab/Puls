import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/render";
import { LatestMeasurements } from "./LatestMeasurements";
import { usePatientNotes } from "./useNotes";

vi.mock(import("./useNotes"), async (importOriginal) => ({
  ...(await importOriginal()),
  usePatientNotes: vi.fn(),
}));

function mockNotes(data: object[]) {
  vi.mocked(usePatientNotes).mockReturnValue({
    data,
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof usePatientNotes>);
}

const note = (startTime: string, vitals?: object) => ({
  content: { reasonForVisit: "", observation: "", assessment: "", plan: "", vitals },
  appointment: { startTime, appointmentType: { name: "Visit" } },
});

describe("LatestMeasurements", () => {
  afterEach(() => vi.clearAllMocks());

  it("shows the newest value of each measurement with its own date", () => {
    mockNotes([
      note("2026-10-22T09:30:00.000Z", { systolic: 138, diastolic: 86 }),
      note("2026-04-14T08:00:00.000Z", { height: 167 }),
    ]);

    renderWithProviders(<LatestMeasurements patientId="p1" />);

    expect(screen.getAllByRole("term").map((term) => term.textContent)).toEqual([
      "Blood pressure",
      "Height",
    ]);
    expect(screen.getByText("138/86")).toBeInTheDocument();
    expect(screen.getByText("22 Oct 2026")).toBeInTheDocument();
    expect(screen.getByText("167")).toBeInTheDocument();
    expect(screen.getByText("14 Apr 2026")).toBeInTheDocument();
  });

  it("says when nothing has been measured", () => {
    mockNotes([note("2026-10-22T09:30:00.000Z")]);

    renderWithProviders(<LatestMeasurements patientId="p1" />);

    expect(screen.getByText("No measurements recorded yet.")).toBeInTheDocument();
  });
});
