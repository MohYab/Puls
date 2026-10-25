import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { User } from "../../types/auth";
import { onUnauthorized } from "../../services/authEvents";
import { AuthContext } from "./AuthContext";

function getStoredUser(): User | null {
  const storedUser = localStorage.getItem("user");
  return storedUser ? JSON.parse(storedUser) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [sessionExpired, setSessionExpired] = useState(false);
  const isLoading = false;

  function login(token: string, user: User) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setSessionExpired(false);
    setUser(user);
  }

  // Clears the token and all cached server data, so the next user on the same
  // computer never sees the previous user's patients or notes.
  const endSession = useCallback(
    (expired: boolean) => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      queryClient.clear();
      setSessionExpired(expired);
      setUser(null);
    },
    [queryClient]
  );

  function logout() {
    endSession(false);
  }

  // Keeps the name in the header and in localStorage in step with My account.
  function updateUser(changes: Partial<Pick<User, "name">>) {
    if (!user) return;
    const next = { ...user, ...changes };
    localStorage.setItem("user", JSON.stringify(next));
    setUser(next);
  }

  // The API client reports a rejected token; ProtectedRoute then redirects
  // to /login because user is null.
  useEffect(() => onUnauthorized(() => endSession(true)), [endSession]);

  return (
    <AuthContext.Provider value={{ user, isLoading, sessionExpired, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
