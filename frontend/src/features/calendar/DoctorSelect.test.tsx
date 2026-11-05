import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DoctorSelect } from "./DoctorSelect";
import type { Doctor } from "../../types/doctor";

function doctor(id: string, name: string, specialization: string | null): Doctor {
  return {
    id,
    specialization,
    user: {
      id: `u-${id}`,
      name,
      email: `${id}@example.com`,
      phone: null,
      isActive: true,
      deactivatedAt: null,
    },
  };
}

const doctors = [doctor("d1", "Erik Lind", "General practice"), doctor("d2", "Sara Nilsson", null)];

// Controlled like in CalendarPage: the parent's state changes on select.
function Wrapper({ onChange }: { onChange: (id: string) => void }) {
  const [value, setValue] = useState("d1");
  return (
    <DoctorSelect
      doctors={doctors}
      value={value}
      onChange={(id) => {
        setValue(id);
        onChange(id);
      }}
    />
  );
}

describe("DoctorSelect", () => {
  it("finds a doctor by name or specialization", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Wrapper onChange={onChange} />);

    const input = screen.getByRole("combobox", { name: "Doctor" });
    expect(input).toHaveValue("Erik Lind");

    await user.clear(input);
    await user.type(input, "sara");
    await user.click(screen.getByRole("option", { name: /Sara Nilsson/ }));

    expect(onChange).toHaveBeenCalledWith("d2");
    expect(input).toHaveValue("Sara Nilsson");
  });

  it("cannot be cleared: an emptied field shows the selected doctor again", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Wrapper onChange={onChange} />);

    const input = screen.getByRole("combobox", { name: "Doctor" });
    await user.clear(input);
    await user.tab();

    expect(onChange).not.toHaveBeenCalled();
    expect(input).toHaveValue("Erik Lind");
  });
});
