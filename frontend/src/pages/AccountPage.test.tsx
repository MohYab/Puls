import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AccountPage from "./AccountPage";
import { useAccount } from "../features/account/useAccount";

vi.mock(import("../features/account/useAccount"), async (importOriginal) => ({
  ...(await importOriginal()),
  useAccount: vi.fn(),
}));

vi.mock(import("../features/account/ProfileForm"), () => ({
  ProfileForm: () => <p>Profile form</p>,
}));

function renderPage() {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <AccountPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("AccountPage", () => {
  beforeEach(() => {
    vi.mocked(useAccount).mockReturnValue({
      data: {
        id: "u-1",
        name: "Erik Lind",
        email: "erik@puls.test",
        phone: null,
        role: "DOCTOR",
        specialization: "General practice",
      },
      isPending: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useAccount>);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("shows the password form outside the demo", () => {
    vi.stubEnv("VITE_DEMO_MODE", "");
    renderPage();

    expect(screen.getByLabelText("Current password")).toBeInTheDocument();
  });

  it("explains instead of showing the password form in the public demo", () => {
    vi.stubEnv("VITE_DEMO_MODE", "true");
    renderPage();

    expect(screen.getByText(/turned off in the public demo/)).toBeInTheDocument();
    expect(screen.queryByLabelText("Current password")).not.toBeInTheDocument();
  });
});
