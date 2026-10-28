import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { makeAppointment } from "../../test/fixtures";
import { addDays } from "../../utils/date";
import { WeekView } from "./WeekView";

const monday = new Date(2026, 9, 26);
const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));

describe("WeekView", () => {
  it("places each appointment in its own day's column", () => {
    // makeAppointment starts on Tuesday 27 October at 10:30.
    render(
      <WeekView
        days={days}
        appointments={[makeAppointment()]}
        onAppointmentClick={() => {}}
        onDayClick={() => {}}
      />
    );

    const tuesday = screen.getByRole("group", { name: /Tuesday,? 27 October/ });
    const monday = screen.getByRole("group", { name: /Monday,? 26 October/ });

    expect(within(tuesday).getByRole("button", { name: /Anna Andersson/ })).toBeInTheDocument();
    expect(
      within(monday).queryByRole("button", { name: /Anna Andersson/ })
    ).not.toBeInTheDocument();
  });

  it("opens a day from its header", async () => {
    const onDayClick = vi.fn();
    render(
      <WeekView
        days={days}
        appointments={[]}
        onAppointmentClick={() => {}}
        onDayClick={onDayClick}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: /29.*open day view/ }));

    expect(onDayClick).toHaveBeenCalledWith(days[3]);
  });
});
