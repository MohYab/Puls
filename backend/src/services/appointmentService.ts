import { prisma } from "../utils/prisma.js";
import { AppError, NotFoundError, ValidationError } from "../utils/errors.js";
import type {
  CreateAppointmentInput,
  UpdateAppointmentInput,
  UpdateStatusInput,
} from "../validators/appointmentValidators.js";
import {
  canChangeStatus,
  isFinalStatus,
  requiresStartedAppointment,
  statusLabel,
} from "../utils/appointmentStatus.js";
import { getPatientById } from "./patientService.js";
import { OPENING_HOURS_LABEL, isWithinOpeningHours } from "../utils/openingHours.js";

import type { RequestingUser } from "../types/requestingUser.js";

// Shape of an appointment in lists and details.
const appointmentInclude = {
  // Name and date of birth together identify the patient (avoids mixing up namesakes).
  patient: { select: { firstName: true, lastName: true, dateOfBirth: true } },
  appointmentType: { select: { name: true, duration: true } },
  doctor: { select: { user: { select: { name: true } } } },
} as const;

// Reads only: adds the note's id so we know whether it exists. The content is never selected.
const appointmentReadInclude = {
  ...appointmentInclude,
  note: { select: { id: true } },
} as const;

/**
 * Replaces the note relation with a hasNote flag. Only doctors get the flag:
 * admins have no access to clinical notes, not even to whether one exists (decision #56).
 */
function toAppointmentResponse<T extends { note: { id: string } | null }>(
  appointment: T,
  requestingUser: RequestingUser
) {
  const { note, ...rest } = appointment;
  return requestingUser.role === "DOCTOR" ? { ...rest, hasNote: note !== null } : rest;
}

/**
 * Where-filter that limits a query to the requesting doctor's own rows.
 * Admins get no filter. A doctor without a linked doctor profile is rejected,
 * because an empty filter would otherwise mean "all doctors".
 */
function ownDoctorFilter(requestingUser: RequestingUser): { doctorId?: string } {
  if (requestingUser.role !== "DOCTOR") {
    return {};
  }
  if (!requestingUser.doctorId) {
    throw new AppError(403, "FORBIDDEN", "No doctor profile is linked to this user");
  }
  return { doctorId: requestingUser.doctorId };
}

// One conflict rule for booking, editing and restoring a cancelled appointment.
async function assertNoConflict(
  doctorId: string,
  startTime: Date,
  endTime: Date,
  excludeAppointmentId?: string
) {
  const conflict = await prisma.appointment.findFirst({
    where: {
      doctorId,
      status: { not: "CANCELLED" },
      startTime: { lt: endTime },
      endTime: { gt: startTime },
      ...(excludeAppointmentId && { id: { not: excludeAppointmentId } }),
    },
  });
  if (conflict) {
    throw new AppError(
      409,
      "APPOINTMENT_CONFLICT",
      "This time conflicts with an existing appointment for this doctor"
    );
  }
}

function assertWithinOpeningHours(startTime: Date, endTime: Date) {
  if (!isWithinOpeningHours(startTime, endTime)) {
    throw new ValidationError(`Appointments must be between ${OPENING_HOURS_LABEL}`);
  }
}
async function assertOwnsAppointment(appointmentId: string, requestingUser: RequestingUser) {
  const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appointment) {
    throw new NotFoundError("Appointment not found");
  }
  if (requestingUser.role === "DOCTOR" && appointment.doctorId !== requestingUser.doctorId) {
    throw new AppError(403, "FORBIDDEN", "You do not have access to this appointment");
  }
  return appointment;
}

// --- Queries -----------------------------------------------------------------

interface GetAppointmentsParams {
  requestingUser: RequestingUser;
  date?: string;
  /** Inclusive range (YYYY-MM-DD), at most 7 days. Validated in the controller. */
  from?: string;
  to?: string;
  /** Admin only: limit to one doctor. Ignored for doctors, who always see their own. */
  doctorId?: string;
}

// Midnight in the server's time zone, which must be the clinic's (TZ=Europe/Stockholm, decision #57).
function startOfDay(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00`);
}

export async function getAppointments({
  requestingUser,
  date,
  from,
  to,
  doctorId,
}: GetAppointmentsParams) {
  const doctorFilter =
    requestingUser.role === "ADMIN" && doctorId ? { doctorId } : ownDoctorFilter(requestingUser);

  // One day is a range from and to the same date.
  const range = from && to ? { from, to } : date ? { from: date, to: date } : null;

  let startTimeFilter = {};
  if (range) {
    const end = startOfDay(range.to);
    end.setDate(end.getDate() + 1); // calendar day, not +24 h (safe across DST)
    startTimeFilter = { startTime: { gte: startOfDay(range.from), lt: end } };
  }

  const appointments = await prisma.appointment.findMany({
    where: { ...doctorFilter, ...startTimeFilter },
    include: appointmentReadInclude,
    orderBy: { startTime: "asc" },
  });
  return appointments.map((appointment) => toAppointmentResponse(appointment, requestingUser));
}

/** How many undocumented visits the dashboard lists; `total` tells how many there are. */
export const TO_DOCUMENT_LIMIT = 20;

/**
 * The doctor's completed visits that have no clinical note yet, oldest first
 * (the longest-waiting visit is the most urgent). Only the note's existence is
 * checked; its content is never read.
 */
export async function getAppointmentsToDocument(requestingUser: RequestingUser) {
  const where = {
    ...ownDoctorFilter(requestingUser),
    status: "COMPLETED" as const,
    note: { is: null },
  };

  // No transaction: with the pg driver adapter, a read with includes inside a
  // transaction sends its queries at once on one connection (a known Prisma 7
  // issue; pg warns, and pg 9 will reject it). Outside a transaction each query
  // gets its own pooled connection. The list and the total may differ for a
  // moment if a note is saved in between; the dashboard refetches, so that is fine.
  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: appointmentInclude,
      orderBy: { startTime: "asc" },
      take: TO_DOCUMENT_LIMIT,
    }),
    prisma.appointment.count({ where }),
  ]);

  // Same shape as other appointment responses for doctors (decision #56).
  return {
    appointments: appointments.map((appointment) => ({ ...appointment, hasNote: false })),
    total,
  };
}

export async function getAppointmentById(appointmentId: string, requestingUser: RequestingUser) {
  const appointment = await assertOwnsAppointment(appointmentId, requestingUser);
  const result = await prisma.appointment.findUnique({
    where: { id: appointment.id },
    include: appointmentReadInclude,
  });
  return result && toAppointmentResponse(result, requestingUser);
}

export async function getPatientAppointments(patientId: string, requestingUser: RequestingUser) {
  await getPatientById(patientId); // 404 if the patient does not exist

  return prisma.appointment.findMany({
    where: {
      patientId,
      // Doctors only see their own visits with the patient; admins see all.
      ...ownDoctorFilter(requestingUser),
    },
    orderBy: { startTime: "desc" },
    select: {
      id: true,
      startTime: true,
      endTime: true,
      status: true,
      doctor: { select: { id: true, user: { select: { name: true } } } },
      appointmentType: { select: { id: true, name: true } },
    },
  });
}

// --- Booking and editing ------------------------------------------------------

export async function createAppointment(
  input: CreateAppointmentInput,
  requestingUser: RequestingUser
) {
  // Doctors can only book for themselves; admins can book for any doctor.
  const doctorId = requestingUser.role === "DOCTOR" ? requestingUser.doctorId : input.doctorId;
  if (!doctorId) {
    throw new AppError(403, "FORBIDDEN", "No doctor profile is linked to this user");
  }

  // Unknown ids in the body are invalid input (400), like templateId and
  // note sharing. Checked here so the database never sees a broken reference.
  const [patient, doctor, appointmentType] = await Promise.all([
    prisma.patient.findUnique({ where: { id: input.patientId }, select: { isActive: true } }),
    prisma.doctor.findUnique({
      where: { id: doctorId },
      select: { user: { select: { isActive: true } } },
    }),
    prisma.appointmentType.findUnique({ where: { id: input.appointmentTypeId } }),
  ]);
  if (!patient) {
    throw new ValidationError("Patient not found");
  }
  if (!patient.isActive) {
    throw new AppError(400, "PATIENT_INACTIVE", "This patient is inactive and cannot be booked");
  }
  if (!doctor) {
    throw new ValidationError("Doctor not found");
  }
  if (!doctor.user.isActive) {
    throw new AppError(
      400,
      "DOCTOR_INACTIVE",
      "This doctor is no longer active and cannot be booked"
    );
  }
  if (!appointmentType) {
    throw new ValidationError("Appointment type not found");
  }
  if (!appointmentType.isActive) {
    throw new AppError(
      400,
      "APPOINTMENT_TYPE_INACTIVE",
      "This appointment type is no longer in use"
    );
  }

  const startTime = new Date(input.startTime);
  if (startTime < new Date()) {
    throw new AppError(400, "VALIDATION_ERROR", "Cannot book an appointment in the past");
  }
  const endTime = new Date(startTime.getTime() + appointmentType.duration * 60 * 1000);

  assertWithinOpeningHours(startTime, endTime);
  await assertNoConflict(doctorId, startTime, endTime);

  return prisma.appointment.create({
    data: {
      patientId: input.patientId,
      doctorId,
      appointmentTypeId: input.appointmentTypeId,
      startTime,
      endTime,
      bookingComment: input.bookingComment,
    },
    include: appointmentInclude,
  });
}

export async function updateAppointment(
  appointmentId: string,
  input: UpdateAppointmentInput,
  requestingUser: RequestingUser
) {
  const existing = await assertOwnsAppointment(appointmentId, requestingUser);

  // A final status locks the appointment, also for admins. An admin first
  // corrects the status (logged), then the appointment can be edited again.
  if (isFinalStatus(existing.status)) {
    throw new AppError(
      409,
      "APPOINTMENT_LOCKED",
      `This appointment is ${statusLabel(existing.status)} and cannot be edited`
    );
  }

  const newTypeId = input.appointmentTypeId;
  const typeChanged = newTypeId !== undefined && newTypeId !== existing.appointmentTypeId;
  const appointmentTypeId = typeChanged ? newTypeId : existing.appointmentTypeId;
  const startTime = input.startTime ? new Date(input.startTime) : existing.startTime;

  // Keep the booked length unless the type changes, so editing an old
  // appointment is not affected by a later change of the type's duration.
  let durationMs = existing.endTime.getTime() - existing.startTime.getTime();

  if (typeChanged) {
    const appointmentType = await prisma.appointmentType.findUnique({
      where: { id: appointmentTypeId },
    });
    if (!appointmentType) {
      throw new ValidationError("Appointment type not found");
    }
    if (!appointmentType.isActive) {
      throw new AppError(
        400,
        "APPOINTMENT_TYPE_INACTIVE",
        "This appointment type is no longer in use"
      );
    }
    durationMs = appointmentType.duration * 60 * 1000;
  }

  const endTime = new Date(startTime.getTime() + durationMs);
  assertWithinOpeningHours(startTime, endTime);
  await assertNoConflict(existing.doctorId, startTime, endTime, appointmentId);

  return prisma.appointment.update({
    where: { id: appointmentId },
    data: { appointmentTypeId, startTime, endTime, bookingComment: input.bookingComment },
    include: appointmentInclude,
  });
}

// --- Status ----------------------------------------------------------------

export async function updateAppointmentStatus(
  appointmentId: string,
  input: UpdateStatusInput,
  requestingUser: RequestingUser
) {
  const existing = await assertOwnsAppointment(appointmentId, requestingUser);
  const from = existing.status;
  const to = input.status;
  const isCorrection = isFinalStatus(from);

  if (from === to) {
    throw new AppError(
      409,
      "INVALID_STATUS_TRANSITION",
      `The appointment is already ${statusLabel(to)}`
    );
  }

  if (!canChangeStatus(from, to, requestingUser.role)) {
    const message = isCorrection
      ? `This appointment is ${statusLabel(from)} and can no longer be changed. Contact an administrator to correct it`
      : `An appointment cannot go from ${statusLabel(from)} to ${statusLabel(to)}`;
    throw new AppError(409, "INVALID_STATUS_TRANSITION", message);
  }

  // Safeguards. A correction must not create new errors.
  if (isCorrection && !input.reason) {
    throw new ValidationError("A reason is required when correcting a final status");
  }
  if (requiresStartedAppointment(to) && existing.startTime > new Date()) {
    throw new AppError(
      409,
      "INVALID_STATUS_TRANSITION",
      `An appointment cannot be marked ${statusLabel(to)} before it has started`
    );
  }
  if (to === "CANCELLED") {
    const note = await prisma.clinicalNote.findUnique({
      where: { appointmentId },
      select: { id: true },
    });
    if (note) {
      throw new AppError(
        409,
        "INVALID_STATUS_TRANSITION",
        "An appointment with a clinical note cannot be cancelled"
      );
    }
  }
  // Restoring a cancelled appointment takes the time slot back.
  if (from === "CANCELLED") {
    await assertNoConflict(existing.doctorId, existing.startTime, existing.endTime, appointmentId);
  }

  // The change and its history entry are saved together, or not at all.
  const [updated] = await prisma.$transaction([
    prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: to },
      include: appointmentInclude,
    }),
    prisma.appointmentStatusChange.create({
      data: {
        appointmentId,
        fromStatus: from,
        toStatus: to,
        changedByUserId: requestingUser.userId,
        reason: input.reason || null,
      },
    }),
  ]);

  return updated;
}
