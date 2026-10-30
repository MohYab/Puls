import type { Appointment, AppointmentStatus } from "../../types/appointment";
import { ALL_STATUSES, isFinalStatus } from "../../utils/appointmentStatus";

// Pure functions for the dashboards: no React, no fetching, easy to unit test.

export type StatusCounts = Record<AppointmentStatus, number>;

/** Every status is present, also with 0, so the summary always has the same five boxes. */
export function countByStatus(appointments: readonly Appointment[]): StatusCounts {
  const counts = Object.fromEntries(ALL_STATUSES.map((status) => [status, 0])) as StatusCounts;
  for (const appointment of appointments) {
    counts[appointment.status] += 1;
  }
  return counts;
}

/**
 * The earliest appointment that has not started and has no final status
 * (completed, no-show, cancelled). Does not rely on the API's order.
 */
export function findNextAppointment(
  appointments: readonly Appointment[],
  now: Date = new Date()
): Appointment | null {
  const upcoming = appointments.filter(
    (appointment) =>
      !isFinalStatus(appointment.status) && Date.parse(appointment.startTime) > now.getTime()
  );
  if (upcoming.length === 0) return null;

  return upcoming.reduce((earliest, appointment) =>
    Date.parse(appointment.startTime) < Date.parse(earliest.startTime) ? appointment : earliest
  );
}

export interface DoctorDay {
  doctorId: string;
  doctorName: string;
  count: number;
  firstStart: string;
  lastEnd: string;
}

const collator = new Intl.Collator("sv");

/**
 * One row per doctor with at least one appointment that is not cancelled,
 * sorted by name. A doctor whose appointments are all cancelled is not working.
 */
export function groupByDoctor(appointments: readonly Appointment[]): DoctorDay[] {
  const byDoctor = new Map<string, DoctorDay>();

  for (const appointment of appointments) {
    if (appointment.status === "CANCELLED") continue;

    const day = byDoctor.get(appointment.doctorId);
    if (!day) {
      byDoctor.set(appointment.doctorId, {
        doctorId: appointment.doctorId,
        doctorName: appointment.doctor.user.name,
        count: 1,
        firstStart: appointment.startTime,
        lastEnd: appointment.endTime,
      });
      continue;
    }

    day.count += 1;
    if (Date.parse(appointment.startTime) < Date.parse(day.firstStart)) {
      day.firstStart = appointment.startTime;
    }
    if (Date.parse(appointment.endTime) > Date.parse(day.lastEnd)) {
      day.lastEnd = appointment.endTime;
    }
  }

  return [...byDoctor.values()].sort((a, b) => collator.compare(a.doctorName, b.doctorName));
}