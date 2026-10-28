import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppointmentBlock } from "./AppointmentBlock";
import { makeAppointment } from "../../test/fixtures";

describe("AppointmentBlock", () => {
  it("tells screen readers that the appointment is documented", () => {
    render(
      <AppointmentBlock appointment={makeAppointment({ hasNote: true })} onClick={() => {}} />
    );

    expect(screen.getByRole("button")).toHaveAccessibleName(/Anna Andersson.*documented/);
  });

  it("says nothing about documentation when the flag is missing (admins)", () => {
    render(<AppointmentBlock appointment={makeAppointment()} onClick={() => {}} />);

    expect(screen.getByRole("button")).not.toHaveAccessibleName(/documented/);
  });

  it("shows a short appointment on one line with its start time", () => {
    render(
      <AppointmentBlock
        appointment={makeAppointment({ endTime: "2026-10-27T09:45:00.000Z" })}
        onClick={() => {}}
      />
    );

    expect(screen.getByText("10:30")).toBeInTheDocument();
  });

  it("opens the appointment when clicked", async () => {
    const onClick = vi.fn();
    const appointment = makeAppointment();
    render(<AppointmentBlock appointment={appointment} onClick={onClick} />);

    await userEvent.click(screen.getByRole("button"));

    expect(onClick).toHaveBeenCalledWith(appointment);
  });
});
