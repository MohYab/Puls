// The logged-in user as the API sees it: set on req.user by authenticate and
// passed to services for permission checks. Defined once, used everywhere.
export type Role = "DOCTOR" | "ADMIN";

export interface RequestingUser {
  userId: string;
  role: Role;
  /** Set for doctors; null for admins (who have no doctor profile). */
  doctorId: string | null;
}
