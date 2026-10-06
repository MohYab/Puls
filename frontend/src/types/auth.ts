export type Role = "DOCTOR" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  doctorId: string | null;
}

export interface LoginResponse {
  token: string;
  user: User;
}
