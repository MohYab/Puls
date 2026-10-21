import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApiError } from "../../services/apiClient";
import { renderWithProviders, testDoctor } from "../../test/render";
import { loginRequest } from "./authService";
import { LoginForm } from "./LoginForm";

vi.mock(import("./authService"), async (importOriginal) => ({
  ...(await importOriginal()),
  loginRequest: vi.fn(),
}));

async function fillIn(email: string, password: string) {
  await userEvent.type(screen.getByLabelText("Email"), email);
  await userEvent.type(screen.getByLabelText("Password"), password);
  await userEvent.click(screen.getByRole("button", { name: "Log in" }));
}

describe("LoginForm", () => {
  beforeEach(() => {
    vi.mocked(loginRequest).mockReset();
  });

  it("validates the fields before anything is sent", async () => {
    renderWithProviders(<LoginForm />, { user: null });

    await userEvent.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() =>
      expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true")
    );
    expect(loginRequest).not.toHaveBeenCalled();
  });

  it("shows the API's message for wrong credentials", async () => {
    vi.mocked(loginRequest).mockRejectedValue(
      new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password")
    );
    const login = vi.fn();
    renderWithProviders(<LoginForm />, { user: null, login });

    await fillIn("erik@puls.test", "wrong-password");

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password");
    expect(login).not.toHaveBeenCalled();
  });

  it("logs in with the token and user from the API", async () => {
    vi.mocked(loginRequest).mockResolvedValue({ token: "token-123", user: testDoctor });
    const login = vi.fn();
    renderWithProviders(<LoginForm />, { user: null, login });

    await fillIn("erik@puls.test", "password123");

    await waitFor(() => expect(login).toHaveBeenCalledWith("token-123", testDoctor));
  });

  it("explains an automatic logout", () => {
    renderWithProviders(<LoginForm />, { user: null, sessionExpired: true });

    expect(screen.getByText(/session has expired/)).toBeInTheDocument();
  });
});
