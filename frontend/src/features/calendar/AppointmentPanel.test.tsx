import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "../../components/Modal";
import { renderWithProviders, testDoctor } from "../../test/render";
import { makeAppointment } from "../../test/fixtures";
import { useAppointmentTypes } from "../appointmentTypes/useAppointmentTypes";
import { AppointmentPanel } from "./AppointmentPanel";

vi.mock(import("../appointmentTypes/useAppointmentTypes"), async (importOriginal) => ({
  ...(await importOriginal()),
  useAppointmentTypes: vi.fn(),
}));

describe("AppointmentPanel", () => {
  beforeEach(() => {
    vi.mocked(useAppointmentTypes).mockReturnValue({
      data: [],
    } as unknown as ReturnType<typeof useAppointmentTypes>);
  });

  it("shows the appointment and moves focus to the panel", () => {
    renderWithProviders(
      <AppointmentPanel appointment={makeAppointment({ hasNote: false })} onClose={() => {}} />,
      { user: testDoctor }
    );

    expect(screen.getByRole("heading", { name: "Appointment" })).toHaveFocus();
    expect(screen.getByRole("link", { name: "Anna Andersson" })).toBeInTheDocument();
    expect(screen.getByText("Not documented")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Document visit" })).toBeInTheDocument();
  });

  it("offers to open existing documentation", () => {
    renderWithProviders(
      <AppointmentPanel appointment={makeAppointment({ hasNote: true })} onClose={() => {}} />,
      { user: testDoctor }
    );

    expect(screen.getByRole("link", { name: "Open documentation" })).toBeInTheDocument();
  });

  it("closes from the close button", async () => {
    const onClose = vi.fn();
    renderWithProviders(<AppointmentPanel appointment={makeAppointment()} onClose={onClose} />, {
      user: testDoctor,
    });

    await userEvent.click(screen.getByRole("button", { name: "Close details" }));

    expect(onClose).toHaveBeenCalled();
  });

  it("closes on Escape", async () => {
    const onClose = vi.fn();
    renderWithProviders(<AppointmentPanel appointment={makeAppointment()} onClose={onClose} />, {
      user: testDoctor,
    });

    await userEvent.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("leaves Escape to an open modal", async () => {
    const onPanelClose = vi.fn();
    const onModalClose = vi.fn();
    renderWithProviders(
      <>
        <AppointmentPanel appointment={makeAppointment()} onClose={onPanelClose} />
        <Modal title="Cancel appointment" onClose={onModalClose}>
          Are you sure?
        </Modal>
      </>,
      { user: testDoctor }
    );

    await userEvent.keyboard("{Escape}");

    expect(onModalClose).toHaveBeenCalledTimes(1);
    expect(onPanelClose).not.toHaveBeenCalled();
  });
});
