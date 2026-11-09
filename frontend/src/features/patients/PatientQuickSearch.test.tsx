import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useParams } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Patient } from "../../types/patient";
import { PatientQuickSearch } from "./PatientQuickSearch";
import { usePatients } from "./usePatients";
import { hasOpenModal } from "../../components/modalStack";

vi.mock(import("./usePatients"), async (importOriginal) => ({
  ...(await importOriginal()),
  usePatients: vi.fn(),
}));

vi.mock(import("../../components/modalStack"), async (importOriginal) => ({
  ...(await importOriginal()),
  hasOpenModal: vi.fn(() => false),
}));

function makePatient(
  overrides: Partial<Patient> & Pick<Patient, "id" | "firstName" | "lastName">
): Patient {
  return {
    dateOfBirth: "1985-03-12",
    phone: null,
    email: null,
    isActive: true,
    deactivatedAt: null,
    deactivationReason: null,
    ...overrides,
  };
}

const anna = makePatient({ id: "p-1", firstName: "Anna", lastName: "Andersson" });
const bo = makePatient({
  id: "p-2",
  firstName: "Bo",
  lastName: "Berg",
  dateOfBirth: "1950-01-01",
  isActive: false,
});

function mockResult(result: { data?: Patient[]; isFetching?: boolean; isError?: boolean }) {
  vi.mocked(usePatients).mockReturnValue({
    data: undefined,
    isFetching: false,
    isError: false,
    ...result,
  } as unknown as ReturnType<typeof usePatients>);
}

function PatientPage() {
  const { id } = useParams();
  return <p>Patient page {id}</p>;
}

function renderSearch() {
  render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <>
              <PatientQuickSearch />
              <button type="button">After search</button>
            </>
          }
        />
        <Route path="/patients/:id" element={<PatientPage />} />
      </Routes>
    </MemoryRouter>
  );
  return screen.getByRole("combobox", { name: "Search patients" });
}

describe("PatientQuickSearch", () => {
  beforeEach(() => {
    vi.mocked(usePatients).mockReset();
    vi.mocked(hasOpenModal).mockReturnValue(false);
    mockResult({ data: [anna, bo] });
  });

  it("does not search until two characters are typed", async () => {
    const user = userEvent.setup();
    const input = renderSearch();

    await user.type(input, "a");

    expect(usePatients).toHaveBeenLastCalledWith(undefined, {
      includeInactive: true,
      enabled: false,
    });
    expect(screen.getByRole("status")).toHaveTextContent("Type at least 2 characters");
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });

  it("searches with the debounced term, including inactive patients", async () => {
    const user = userEvent.setup();
    const input = renderSearch();

    await user.type(input, "an");

    await waitFor(() =>
      expect(usePatients).toHaveBeenLastCalledWith("an", {
        includeInactive: true,
        enabled: true,
      })
    );
    // The single letter was never sent: the debounce waited for the whole term.
    expect(usePatients).not.toHaveBeenCalledWith("a", expect.anything());
  });

  it("shows at most 8 results and says how many there are", async () => {
    const many = Array.from({ length: 10 }, (_, index) =>
      makePatient({ id: `p-${index}`, firstName: "Patient", lastName: `Number ${index}` })
    );
    mockResult({ data: many });
    const user = userEvent.setup();
    const input = renderSearch();

    await user.type(input, "patient");

    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(8));
    expect(screen.getByRole("status")).toHaveTextContent("Showing 8 of 10");
  });

  it("marks inactive patients and shows the date of birth", async () => {
    const user = userEvent.setup();
    const input = renderSearch();

    await user.type(input, "an");

    const inactive = await screen.findByRole("option", { name: /Bo Berg/ });
    expect(within(inactive).getByText("Inactive")).toBeInTheDocument();
    expect(within(inactive).getByText("Born 1950-01-01")).toBeInTheDocument();

    const active = screen.getByRole("option", { name: /Anna Andersson/ });
    expect(within(active).queryByText("Inactive")).not.toBeInTheDocument();
  });

  it("opens the patient page with Enter", async () => {
    const user = userEvent.setup();
    const input = renderSearch();

    await user.type(input, "anna");
    await screen.findByRole("option", { name: /Anna Andersson/ });
    await user.keyboard("{Enter}");

    expect(await screen.findByText("Patient page p-1")).toBeInTheDocument();
  });

  it("says when nothing matches", async () => {
    mockResult({ data: [] });
    const user = userEvent.setup();
    const input = renderSearch();

    await user.type(input, "zz");

    expect(await screen.findByText('No patients match "zz".')).toBeInTheDocument();
  });

  it("shows an error instead of an empty result", async () => {
    mockResult({ isError: true });
    const user = userEvent.setup();
    const input = renderSearch();

    await user.type(input, "an");

    expect(await screen.findByText(/Couldn't search patients/)).toBeInTheDocument();
    expect(screen.queryByText(/No patients match/)).not.toBeInTheDocument();
  });

  it("focuses the search field with Ctrl+K and ⌘K", async () => {
    const user = userEvent.setup();
    const input = renderSearch();
    expect(input).toHaveAttribute("aria-keyshortcuts", "Control+K Meta+K");

    await user.keyboard("{Control>}k{/Control}");
    expect(input).toHaveFocus();

    await user.click(document.body);
    expect(input).not.toHaveFocus();

    await user.keyboard("{Meta>}k{/Meta}");
    expect(input).toHaveFocus();
  });

  it("ignores K without a modifier", async () => {
    const user = userEvent.setup();
    const input = renderSearch();

    await user.keyboard("k");

    expect(input).not.toHaveFocus();
  });

  it("moves focus on with Tab without opening a patient", async () => {
    const user = userEvent.setup();
    const input = renderSearch();

    await user.type(input, "anna");
    await screen.findByRole("option", { name: /Anna Andersson/ });
    await user.tab();

    expect(screen.getByRole("button", { name: "After search" })).toHaveFocus();
    expect(screen.queryByText(/Patient page/)).not.toBeInTheDocument();
  });

  it("closes the list and clears the text with Escape, keeping focus", async () => {
    const user = userEvent.setup();
    const input = renderSearch();

    await user.type(input, "anna");
    await screen.findByRole("option", { name: /Anna Andersson/ });
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("option")).not.toBeInTheDocument();
    expect(input).toHaveValue("");
    expect(input).toHaveFocus();
  });

  it("swallows Ctrl+K while a modal is open, without moving focus", () => {
    vi.mocked(hasOpenModal).mockReturnValue(true);
    const input = renderSearch();

    // fireEvent returns false when the event's default action was prevented,
    // i.e. the browser's own Ctrl+K would not run.
    const notPrevented = fireEvent.keyDown(document, { key: "k", ctrlKey: true });

    expect(notPrevented).toBe(false);
    expect(input).not.toHaveFocus();
  });
});
