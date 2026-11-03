import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SearchSelect } from "./SearchSelect";
import type { SearchOption } from "../utils/searchOptions";

const options: SearchOption[] = [
  { value: "1", label: "Anna Andersson", description: "1985-03-12" },
  { value: "2", label: "Anna Berg", description: "1990-07-01" },
  { value: "3", label: "Erik Åhman", description: "1978-11-23" },
];

function renderSelect(value = "", errorId?: string) {
  const onChange = vi.fn();
  render(
    <>
      <label htmlFor="patient">Patient</label>
      <SearchSelect
        id="patient"
        options={options}
        value={value}
        onChange={onChange}
        noMatchLabel="No patients match"
        aria-invalid={errorId ? true : undefined}
        aria-describedby={errorId}
      />
      {errorId && <p id={errorId}>Select a patient</p>}
    </>
  );
  return { onChange, input: screen.getByRole("combobox", { name: "Patient" }) };
}

describe("SearchSelect", () => {
  it("shows the selected option's label", () => {
    const { input } = renderSelect("2");
    expect(input).toHaveValue("Anna Berg");
  });

  it("filters as you type and selects with the keyboard", async () => {
    const user = userEvent.setup();
    const { input, onChange } = renderSelect();

    await user.type(input, "berg");
    expect(screen.getAllByRole("option")).toHaveLength(1);

    await user.keyboard("{ArrowDown}{Enter}");
    expect(onChange).toHaveBeenCalledWith("2");
  });

  it("shows the description and selects with the mouse", async () => {
    const user = userEvent.setup();
    const { input, onChange } = renderSelect();

    await user.click(input);
    const option = screen.getByRole("option", { name: /Anna Andersson/ });
    expect(option).toHaveTextContent("1985-03-12");

    await user.click(option);
    expect(onChange).toHaveBeenCalledWith("1");
  });

  it("tells the user when nothing matches", async () => {
    const user = userEvent.setup();
    const { input } = renderSelect();

    await user.type(input, "zz");
    expect(screen.getByRole("status")).toHaveTextContent('No patients match "zz".');
    expect(input).toHaveAttribute("aria-describedby", "patient-no-match");
  });

  it("keeps the field's error description", async () => {
    const user = userEvent.setup();
    const { input } = renderSelect("", "patient-error");

    expect(input).toHaveAccessibleDescription("Select a patient");
    expect(input).toHaveAttribute("aria-invalid", "true");

    await user.type(input, "zz");
    expect(input).toHaveAttribute("aria-describedby", "patient-error patient-no-match");
  });
});
