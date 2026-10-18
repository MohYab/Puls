import { createContext } from "react";
import type { User } from "../../types/auth";

export interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  sessionExpired: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
