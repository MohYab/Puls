import type { Appointment, AppointmentStatus } from "../../types/appointment";
import { ALL_STATUSES, isFinalStatus } from "../../utils/appointmentStatus";
import { calculateAge, formatBirthDate } from "../../utils/date";

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
  /** Appointments that are not cancelled. */
  count: number;
  completed: number;
  noShow: number;
  /** Start of the next appointment that has not started and has no final status. */
  nextStart: string | null;
}

const collator = new Intl.Collator("sv");

/**
 * One row per doctor with at least one appointment that is not cancelled,
 * sorted by name. A doctor whose appointments are all cancelled is not working.
 */
export function groupByDoctor(
  appointments: readonly Appointment[],
  now: Date = new Date()
): DoctorDay[] {
  const byDoctor = new Map<string, DoctorDay>();

  for (const appointment of appointments) {
    if (appointment.status === "CANCELLED") continue;

    let day = byDoctor.get(appointment.doctorId);
    if (!day) {
      day = {
        doctorId: appointment.doctorId,
        doctorName: appointment.doctor.user.name,
        count: 0,
        completed: 0,
        noShow: 0,
        nextStart: null,
      };
      byDoctor.set(appointment.doctorId, day);
    }

    day.count += 1;
    if (appointment.status === "COMPLETED") day.completed += 1;
    if (appointment.status === "NO_SHOW") day.noShow += 1;

    const start = Date.parse(appointment.startTime);
    const isUpcoming = !isFinalStatus(appointment.status) && start > now.getTime();
    if (isUpcoming && (day.nextStart === null || start < Date.parse(day.nextStart))) {
      day.nextStart = appointment.startTime;
    }
  }

  return [...byDoctor.values()].sort((a, b) => collator.compare(a.doctorName, b.doctorName));
}

/** "Good morning" before 12, "Good afternoon" before 18, then "Good evening". */
export function greetingFor(now: Date = new Date()): string {
  const hour = now.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/**
 * "1 appointment", "6 appointments". English plurals only; a translated app
 * would use Intl.PluralRules (Arabic has more plural forms than two).
 */
export function countLabel(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

/** "1985-03-12 · 41 y": with the name, it identifies the patient. */
export function birthDateAndAge(dateOfBirth: string, now: Date = new Date()): string {
  return `${formatBirthDate(dateOfBirth)} · ${calculateAge(dateOfBirth, now)} y`;
}
