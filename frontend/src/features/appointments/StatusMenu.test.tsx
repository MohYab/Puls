import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { makeAppointment } from "../../test/fixtures";
import { renderWithProviders } from "../../test/render";
import { StatusMenu } from "./StatusMenu";
import { useUpdateAppointmentStatus } from "./useAppointments";

vi.mock(import("./useAppointments"), async (importOriginal) => ({
  ...(await importOriginal()),
  useUpdateAppointmentStatus: vi.fn(),
}));

function mockUpdate() {
  const mutate = vi.fn();
  vi.mocked(useUpdateAppointmentStatus).mockReturnValue({
    mutate,
    reset: vi.fn(),
    isPending: false,
    isError: false,
  } as unknown as ReturnType<typeof useUpdateAppointmentStatus>);
  return mutate;
}

const inOneHour = new Date(Date.now() + 3_600_000).toISOString();

describe("StatusMenu", () => {
  afterEach(() => vi.clearAllMocks());

  it("saves a workflow change at once, with short labels", async () => {
    const mutate = mockUpdate();
    renderWithProviders(
      <StatusMenu
        appointment={makeAppointment({
          status: "SCHEDULED",
          startTime: inOneHour,
          endTime: inOneHour,
        })}
      />
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Change status for Anna Andersson, now Scheduled" })
    );
    expect(screen.getAllByRole("menuitem").map((item) => item.textContent)).toEqual([
      "Confirmed",
      "Cancelled",
    ]);

    await userEvent.click(screen.getByRole("menuitem", { name: "Confirmed" }));
    expect(mutate).toHaveBeenCalledWith({ status: "CONFIRMED" });
  });

  it("asks before cancelling", async () => {
    const mutate = mockUpdate();
    renderWithProviders(
      <StatusMenu
        appointment={makeAppointment({
          status: "SCHEDULED",
          startTime: inOneHour,
          endTime: inOneHour,
        })}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: /Change status/ }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Cancelled" }));

    expect(screen.getByRole("dialog", { name: "Cancel appointment" })).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it("opens the correction dialog, with the chosen status selected, for a final status", async () => {
    const mutate = mockUpdate();
    // The fixture is a completed appointment in the past.
    renderWithProviders(<StatusMenu appointment={makeAppointment({ hasNote: true })} />);

    await userEvent.click(screen.getByRole("button", { name: /now Completed/ }));
    // An appointment with a note cannot be cancelled, so that is not offered.
    expect(screen.queryByRole("menuitem", { name: "Cancelled" })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("menuitem", { name: "No-show" }));

    expect(screen.getByRole("dialog", { name: "Correct status" })).toBeInTheDocument();
    expect(screen.getByLabelText(/New status/)).toHaveValue("NO_SHOW");
    expect(mutate).not.toHaveBeenCalled();
  });
});
