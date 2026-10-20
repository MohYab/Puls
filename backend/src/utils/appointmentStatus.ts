import type { Role } from "../types/requestingUser.js";
// Same values as the AppointmentStatus enum in schema.prisma.
export type AppointmentStatus = "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

const FINAL_STATUSES: readonly AppointmentStatus[] = ["COMPLETED", "NO_SHOW", "CANCELLED"];

// The normal workflow, the same for doctors and admins.
const ALLOWED_TRANSITIONS: Record<AppointmentStatus, readonly AppointmentStatus[]> = {
  SCHEDULED: ["CONFIRMED", "COMPLETED", "NO_SHOW", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "NO_SHOW", "CANCELLED"],
  COMPLETED: [],
  NO_SHOW: [],
  CANCELLED: [],
};

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  SCHEDULED: "scheduled",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "a no-show",
};

export function statusLabel(status: AppointmentStatus): string {
  return STATUS_LABELS[status];
}

// A final status locks the appointment: no edit, and no further status change
// except an admin correction.
export function isFinalStatus(status: AppointmentStatus): boolean {
  return FINAL_STATUSES.includes(status);
}

// Admins may correct a final status to any other status. The service adds the
// safeguards (reason, start time, clinical note, conflicts) and logs the change.
export function canChangeStatus(
  from: AppointmentStatus,
  to: AppointmentStatus,
  role: Role
): boolean {
  if (from === to) return false;
  if (ALLOWED_TRANSITIONS[from].includes(to)) return true;
  return role === "ADMIN" && isFinalStatus(from);
}

// You cannot say what happened at a visit before it has started.
export function requiresStartedAppointment(to: AppointmentStatus): boolean {
  return to === "COMPLETED" || to === "NO_SHOW";
}
