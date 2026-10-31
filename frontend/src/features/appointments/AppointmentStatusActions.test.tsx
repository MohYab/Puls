import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/render";
import type { Appointment } from "../../types/appointment";
import { AppointmentStatusActions } from "./AppointmentStatusActions";
import { updateAppointmentStatus } from "./appointmentService";
import { testPatient } from "../../test/fixtures";

// Replace only the API call; the rest of the module stays real.
vi.mock(import("./appointmentService"), async (importOriginal) => ({
  ...(await importOriginal()),
  updateAppointmentStatus: vi.fn(),
}));

function makeAppointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: "appt-1",
    patientId: "patient-anna",
    doctorId: "doctor-erik",
    appointmentTypeId: "type-routine",
    startTime: "2099-01-15T09:00:00.000Z",
    endTime: "2099-01-15T09:30:00.000Z",
    status: "SCHEDULED",
    bookingComment: null,
    createdAt: "2026-10-01T10:00:00.000Z",
    updatedAt: "2026-10-01T10:00:00.000Z",
    patient: testPatient(),
    doctor: { user: { name: "Erik Lind" } },
    appointmentType: { name: "Routine consultation", duration: 30 },
    ...overrides,
  };
}

const started = { startTime: "2020-01-15T09:00:00.000Z", endTime: "2020-01-15T09:30:00.000Z" };

describe("AppointmentStatusActions", () => {
  beforeEach(() => {
    vi.mocked(updateAppointmentStatus).mockReset();
    vi.mocked(updateAppointmentStatus).mockResolvedValue(makeAppointment());
  });

  it("offers only confirm and cancel before the appointment has started", () => {
    renderWithProviders(
      <AppointmentStatusActions appointment={makeAppointment()} onDone={vi.fn()} />
    );

    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel appointment" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Mark as completed" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Mark as no-show" })).not.toBeInTheDocument();
  });

  it("also offers completed and no-show once the appointment has started", () => {
    renderWithProviders(
      <AppointmentStatusActions appointment={makeAppointment(started)} onDone={vi.fn()} />
    );

    expect(screen.getByRole("button", { name: "Mark as completed" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mark as no-show" })).toBeInTheDocument();
  });

  it("confirms directly, without a dialog", async () => {
    const onDone = vi.fn();
    renderWithProviders(
      <AppointmentStatusActions appointment={makeAppointment()} onDone={onDone} />
    );

    await userEvent.click(screen.getByRole("button", { name: "Confirm" }));

    await waitFor(() =>
      expect(updateAppointmentStatus).toHaveBeenCalledWith("appt-1", "CONFIRMED", undefined)
    );
    expect(onDone).toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("asks before a final status and saves only after confirming", async () => {
    const onDone = vi.fn();
    renderWithProviders(
      <AppointmentStatusActions appointment={makeAppointment(started)} onDone={onDone} />
    );

    await userEvent.click(screen.getByRole("button", { name: "Mark as no-show" }));

    const dialog = screen.getByRole("dialog", { name: "Mark as no-show" });
    expect(within(dialog).getByText(/cannot be changed afterwards/)).toBeInTheDocument();
    expect(updateAppointmentStatus).not.toHaveBeenCalled();

    await userEvent.click(within(dialog).getByRole("button", { name: "Mark as no-show" }));

    await waitFor(() =>
      expect(updateAppointmentStatus).toHaveBeenCalledWith("appt-1", "NO_SHOW", undefined)
    );
    expect(onDone).toHaveBeenCalled();
  });

  it("does nothing when the dialog is closed with Back", async () => {
    renderWithProviders(
      <AppointmentStatusActions appointment={makeAppointment(started)} onDone={vi.fn()} />
    );

    await userEvent.click(screen.getByRole("button", { name: "Mark as completed" }));
    await userEvent.click(screen.getByRole("button", { name: "Back" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(updateAppointmentStatus).not.toHaveBeenCalled();
  });
});
