import type { Role } from "../../types/auth";
import type { PatientAppointment } from "../../types/appointment";
import { isFinalStatus } from "../../utils/appointmentStatus";

// Pure functions for the patient page: no React, easy to unit test.

/**
 * The earliest appointment that has not started and has no final status.
 * The history comes newest first, so the order is not relied on.
 */
export function findNextPatientAppointment(
  appointments: readonly PatientAppointment[],
  now: Date = new Date()
): PatientAppointment | null {
  const upcoming = appointments.filter(
    (appointment) =>
      !isFinalStatus(appointment.status) && Date.parse(appointment.startTime) > now.getTime()
  );
  if (upcoming.length === 0) return null;

  return upcoming.reduce((earliest, appointment) =>
    Date.parse(appointment.startTime) < Date.parse(earliest.startTime) ? appointment : earliest
  );
}

export interface DocumentationAction {
  label: "Open note" | "Document";
  to: string;
}

/**
 * The documentation link for a row in the history. An existing note is always
 * shown (it may have been written during the visit); a completed visit without
 * one can be documented. Admins never get a link (decision #56).
 */
export function documentationAction(
  appointment: PatientAppointment,
  role: Role | undefined
): DocumentationAction | null {
  if (role !== "DOCTOR") return null;

  const to = `/documentation/${appointment.id}`;
  if (appointment.hasNote) return { label: "Open note", to };
  if (appointment.status === "COMPLETED") return { label: "Document", to };
  return null;
}
