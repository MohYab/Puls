import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/render";
import type { DocumentationTemplate } from "../../types/documentationTemplate";
import { DocumentationForm } from "./DocumentationForm";
import { useSaveNote } from "./useNotes";

vi.mock(import("./useNotes"), async (importOriginal) => ({
  ...(await importOriginal()),
  useSaveNote: vi.fn(),
}));

const templates = [
  {
    id: "t-general",
    name: "General consultation",
    description: null,
    templateContent: { sections: ["reasonForVisit", "observation", "assessment", "plan"] },
  },
] as unknown as DocumentationTemplate[];

function mockSave() {
  const mutate = vi.fn();
  vi.mocked(useSaveNote).mockReturnValue({
    mutate,
    isPending: false,
    isError: false,
    isSuccess: false,
  } as unknown as ReturnType<typeof useSaveNote>);
  return mutate;
}

describe("DocumentationForm", () => {
  afterEach(() => vi.clearAllMocks());

  it("shows an implausible value at the field and does not save", async () => {
    const mutate = mockSave();
    renderWithProviders(<DocumentationForm appointmentId="a1" note={null} templates={templates} />);

    await userEvent.type(screen.getByLabelText(/^Height/), "1670");
    await userEvent.click(screen.getByRole("button", { name: "Save documentation" }));

    expect(await screen.findByText("Must be between 30 and 250 cm")).toBeInTheDocument();
    expect(screen.getByLabelText(/^Height/)).toHaveAttribute("aria-invalid", "true");
    expect(mutate).not.toHaveBeenCalled();
  });

  it("sends vital signs as numbers, with a comma accepted as decimal separator", async () => {
    const mutate = mockSave();
    renderWithProviders(<DocumentationForm appointmentId="a1" note={null} templates={templates} />);

    await userEvent.type(screen.getByLabelText("Systolic, mmHg"), "138");
    await userEvent.type(screen.getByLabelText("Diastolic, mmHg"), "86");
    await userEvent.type(screen.getByLabelText(/^Temperature/), "36,8");
    await userEvent.click(screen.getByRole("button", { name: "Save documentation" }));

    expect(mutate).toHaveBeenCalledTimes(1);
    const [{ content }] = mutate.mock.calls[0];
    expect(content.vitals).toEqual({ systolic: 138, diastolic: 86, temperature: 36.8 });
  });
});
