import type { Role } from "./auth";

// Shape returned by GET /api/account.
export interface Account {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  specialization: string | null; // always null for admins
}

export interface AccountInput {
  name: string;
  phone: string;
  specialization: string;
}

export interface PasswordChangeInput {
  currentPassword: string;
  newPassword: string;
}
