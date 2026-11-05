import type { AppointmentStatus } from "../types/appointment";

// Mirrors backend/src/utils/appointmentStatus.ts. The backend decides; this
// copy only decides which buttons and options to show.

export const ALL_STATUSES: readonly AppointmentStatus[] = [
  "SCHEDULED",
  "CONFIRMED",
  "COMPLETED",
  "NO_SHOW",
  "CANCELLED",
];

const FINAL_STATUSES: readonly AppointmentStatus[] = ["COMPLETED", "NO_SHOW", "CANCELLED"];

const ALLOWED_TRANSITIONS: Record<AppointmentStatus, readonly AppointmentStatus[]> = {
  SCHEDULED: ["CONFIRMED", "COMPLETED", "NO_SHOW", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "NO_SHOW", "CANCELLED"],
  COMPLETED: [],
  // The patient arrived late (decision ak).
  NO_SHOW: ["COMPLETED"],
  CANCELLED: [],
};

// Short labels for badges and options.
export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  SCHEDULED: "Scheduled",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No-show",
};

// For sentences: "This appointment is ...", "Mark ... as ...".
export const STATUS_PHRASES: Record<AppointmentStatus, string> = {
  SCHEDULED: "scheduled",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "a no-show",
};

export function isFinalStatus(status: AppointmentStatus): boolean {
  return FINAL_STATUSES.includes(status);
}

export function hasStarted(startTime: string, now: Date = new Date()): boolean {
  return new Date(startTime) <= now;
}

function requiresStarted(status: AppointmentStatus): boolean {
  return status === "COMPLETED" || status === "NO_SHOW";
}

// Status changes offered in the normal workflow (doctors and admins).
export function workflowTargets(status: AppointmentStatus, startTime: string): AppointmentStatus[] {
  return ALLOWED_TRANSITIONS[status].filter((to) => !requiresStarted(to) || hasStarted(startTime));
}

// Statuses an admin can correct a final status to.
export function correctionTargets(
  status: AppointmentStatus,
  startTime: string
): AppointmentStatus[] {
  return ALL_STATUSES.filter(
    (to) => to !== status && (!requiresStarted(to) || hasStarted(startTime))
  );
}

/**
 * A change away from a final status that is not part of the workflow: a correction,
 * which needs a reason. Doctors (own appointments) and admins (decision al).
 */
export function isCorrection(from: AppointmentStatus, to: AppointmentStatus): boolean {
  return isFinalStatus(from) && !ALLOWED_TRANSITIONS[from].includes(to);
}

/**
 * Every status the appointment can change to, for the status menu. Applies the same
 * safeguards as the API, so the menu never offers a change that would be rejected.
 */
export function statusTargets(
  appointment: { status: AppointmentStatus; startTime: string; hasNote?: boolean },
  now: Date = new Date()
): AppointmentStatus[] {
  const { status, startTime, hasNote = false } = appointment;
  const candidates = isFinalStatus(status)
    ? ALL_STATUSES.filter((to) => to !== status)
    : ALLOWED_TRANSITIONS[status];

  return candidates.filter(
    (to) =>
      (!requiresStarted(to) || hasStarted(startTime, now)) &&
      // An appointment with a clinical note cannot be cancelled.
      !(to === "CANCELLED" && hasNote)
  );
}
