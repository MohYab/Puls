import type { ReactElement, ReactNode } from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthContext, type AuthContextValue } from "../features/auth/AuthContext";
import type { User } from "../types/auth";

export const testDoctor: User = {
  id: "user-erik",
  name: "Dr. Erik Lindqvist",
  email: "erik@puls.test",
  role: "DOCTOR",
  doctorId: "doctor-erik",
};

export const testAdmin: User = {
  id: "user-admin",
  name: "Admin",
  email: "admin@puls.test",
  role: "ADMIN",
  doctorId: null,
};

interface RenderOptions {
  user?: User | null;
  sessionExpired?: boolean;
  login?: (token: string, user: User) => void;
  logout?: () => void;
}

// Renders a component with the same providers as the app: TanStack Query,
// the auth context (with a fake user) and a router. Every test gets a fresh
// query client, so no cached data leaks between tests.
export function renderWithProviders(
  ui: ReactElement,
  {
    user = testDoctor,
    sessionExpired = false,
    login = () => {},
    logout = () => {},
  }: RenderOptions = {}
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  const auth: AuthContextValue = {
    user,
    isLoading: false,
    sessionExpired,
    login,
    logout,
    updateUser: () => {},
  };

  function Providers({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={auth}>
          <MemoryRouter>{children}</MemoryRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Providers });
}
