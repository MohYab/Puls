import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, testAdmin, testDoctor } from "../test/render";
import { getClinic } from "../features/clinic/clinicService";
import { Sidebar } from "./Sidebar";

vi.mock(import("../features/clinic/clinicService"), async (importOriginal) => ({
  ...(await importOriginal()),
  getClinic: vi.fn(),
}));

describe("Sidebar", () => {
  beforeEach(() => {
    vi.mocked(getClinic).mockResolvedValue({
      name: "Puls Health Centre",
      addressLine: null,
      postalCode: null,
      city: null,
      phone: null,
      email: null,
    });
  });

  it("shows the clinic name and the user", async () => {
    renderWithProviders(<Sidebar />, { user: testDoctor });

    expect(await screen.findByText("Puls Health Centre")).toBeInTheDocument();
    expect(screen.getByText(testDoctor.name)).toBeInTheDocument();
    expect(screen.getByText("Doctor")).toBeInTheDocument();
  });

  it("shows the Administration section only to admins", () => {
    const { unmount } = renderWithProviders(<Sidebar />, { user: testDoctor });
    expect(screen.queryByRole("group", { name: "Administration" })).not.toBeInTheDocument();
    unmount();

    renderWithProviders(<Sidebar />, { user: testAdmin });
    expect(screen.getByRole("group", { name: "Administration" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Doctors" })).toBeInTheDocument();
  });

  it("logs out from the menu", async () => {
    const logout = vi.fn();
    renderWithProviders(<Sidebar />, { user: testDoctor, logout });

    await userEvent.click(screen.getByRole("button", { name: "Log out" }));

    expect(logout).toHaveBeenCalled();
  });
});
