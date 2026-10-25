import { createContext } from "react";
import type { User } from "../../types/auth";

export interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  sessionExpired: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  /** Updates the stored user after the user edits their own account. */
  updateUser: (changes: Partial<Pick<User, "name">>) => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
