import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import type { AppointmentsToDocument } from "../appointments/appointmentService";
import { ToDocumentList } from "./ToDocumentList";
import { makeAppointment } from "../../test/fixtures";

const NOW = new Date(2026, 10, 10, 12, 0);

function makeData(count: number, total = count): AppointmentsToDocument {
  const base = makeAppointment();
  return {
    total,
    appointments: Array.from({ length: count }, (_, index) =>
      makeAppointment({
        id: `appointment-${index + 1}`,
        startTime: new Date(2026, 9, index + 1, 8, 30).toISOString(),
        // Unique names, so a test can check which rows are visible.
        patient: { ...base.patient, firstName: "Patient", lastName: `${index + 1}` },
      })
    ),
  };
}

function renderList(data: AppointmentsToDocument) {
  render(
    <MemoryRouter>
      <ToDocumentList data={data} now={NOW} isLoading={false} isError={false} onRetry={vi.fn()} />
    </MemoryRouter>
  );
}

function visibleRows() {
  return within(screen.getByRole("list")).getAllByRole("listitem");
}

describe("ToDocumentList", () => {
  it("shows the five oldest visits and a button for the rest", () => {
    renderList(makeData(8));

    expect(visibleRows()).toHaveLength(5);
    expect(screen.queryByText("Patient 6")).not.toBeInTheDocument();
    const button = screen.getByRole("button", { name: "Show more" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveAttribute("aria-controls", screen.getByRole("list").id);
  });

  it("expands and collapses the list", () => {
    renderList(makeData(8));

    fireEvent.click(screen.getByRole("button", { name: "Show more" }));
    expect(visibleRows()).toHaveLength(8);
    const button = screen.getByRole("button", { name: "Show less" });
    expect(button).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(button);
    expect(visibleRows()).toHaveLength(5);
  });

  it("has no button when there are five visits or fewer", () => {
    renderList(makeData(5));

    expect(visibleRows()).toHaveLength(5);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("explains the limit only when all loaded visits are shown", () => {
    renderList(makeData(20, 31));

    expect(screen.queryByText(/Showing the oldest/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Show more" }));
    expect(screen.getByText("Showing the oldest 20 of 31.")).toBeInTheDocument();
  });
});
