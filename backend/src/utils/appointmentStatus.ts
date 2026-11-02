// Same values as the AppointmentStatus enum in schema.prisma.
export type AppointmentStatus = "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

const FINAL_STATUSES: readonly AppointmentStatus[] = ["COMPLETED", "NO_SHOW", "CANCELLED"];

// The normal workflow, the same for doctors and admins. No reason needed.
const ALLOWED_TRANSITIONS: Record<AppointmentStatus, readonly AppointmentStatus[]> = {
  SCHEDULED: ["CONFIRMED", "COMPLETED", "NO_SHOW", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "NO_SHOW", "CANCELLED"],
  COMPLETED: [],
  // The patient arrived late: what happened, not a mistake (decision ak).
  NO_SHOW: ["COMPLETED"],
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

// A final status locks the appointment: it cannot be edited, and its status
// only changes through the workflow above or a correction.
export function isFinalStatus(status: AppointmentStatus): boolean {
  return FINAL_STATUSES.includes(status);
}

/**
 * Any other change away from a final status is a correction of a mistake.
 * Doctors (own appointments) and admins may correct, with a reason (decision al).
 * Who may touch the appointment at all is checked by assertOwnsAppointment.
 */
export function isCorrection(from: AppointmentStatus, to: AppointmentStatus): boolean {
  return isFinalStatus(from) && !ALLOWED_TRANSITIONS[from].includes(to);
}

export function canChangeStatus(from: AppointmentStatus, to: AppointmentStatus): boolean {
  if (from === to) return false;
  return ALLOWED_TRANSITIONS[from].includes(to) || isCorrection(from, to);
}

// You cannot say what happened at a visit before it has started.
export function requiresStartedAppointment(to: AppointmentStatus): boolean {
  return to === "COMPLETED" || to === "NO_SHOW";
}
