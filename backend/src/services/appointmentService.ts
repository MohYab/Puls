import { prisma } from "../utils/prisma.js";
import { AppError, NotFoundError } from "../utils/errors.js";
import type { CreateAppointmentInput } from "../validators/appointmentValidators.js";
import type {
  UpdateAppointmentInput,
  UpdateStatusInput,
} from "../validators/appointmentValidators.js";
import { getPatientById } from "./patientService.js";

type RequestingUser = { role: "DOCTOR" | "ADMIN"; doctorId: string | null };

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

interface GetAppointmentsParams {
  requestingUser: { userId: string; role: "DOCTOR" | "ADMIN"; doctorId: string | null };
  date?: string;
  /** Admin only: limit to one doctor. Ignored for doctors, who always see their own. */
  doctorId?: string;
}

export async function getAppointments({ requestingUser, date, doctorId }: GetAppointmentsParams) {
  const doctorFilter =
    requestingUser.role === "ADMIN" && doctorId ? { doctorId } : ownDoctorFilter(requestingUser);
  // Doctor only sees their own appointments; Admin sees all.
  const startTimeFilter = date
    ? {
        startTime: {
          gte: new Date(`${date}T00:00:00`),
          lte: new Date(`${date}T23:59:59.999`),
        },
      }
    : {};

  return prisma.appointment.findMany({
    where: { ...doctorFilter, ...startTimeFilter },
    include: {
      patient: { select: { firstName: true, lastName: true } },
      appointmentType: { select: { name: true, duration: true } },
    },
    orderBy: { startTime: "asc" },
  });
}

export async function createAppointment(
  input: CreateAppointmentInput,
  requestingUser: { role: "DOCTOR" | "ADMIN"; doctorId: string | null }
) {
  // Doctors can only book for themselves; Admins can book for any doctor.
  const doctorId = requestingUser.role === "DOCTOR" ? requestingUser.doctorId! : input.doctorId;

  const appointmentType = await prisma.appointmentType.findUnique({
    where: { id: input.appointmentTypeId },
  });
  if (!appointmentType) {
    throw new NotFoundError("Appointment type not found");
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

  // Conflict check: any non-cancelled appointment for this doctor that overlaps.
  const conflict = await prisma.appointment.findFirst({
    where: {
      doctorId,
      status: { not: "CANCELLED" },
      startTime: { lt: endTime },
      endTime: { gt: startTime },
    },
  });

  if (conflict) {
    throw new AppError(
      409,
      "APPOINTMENT_CONFLICT",
      "This time conflicts with an existing appointment for this doctor"
    );
  }

  return prisma.appointment.create({
    data: {
      patientId: input.patientId,
      doctorId,
      appointmentTypeId: input.appointmentTypeId,
      startTime,
      endTime,
      bookingComment: input.bookingComment,
    },
    include: {
      patient: { select: { firstName: true, lastName: true } },
      appointmentType: { select: { name: true, duration: true } },
    },
  });
}

async function assertOwnsAppointment(
  appointmentId: string,
  requestingUser: { role: "DOCTOR" | "ADMIN"; doctorId: string | null }
) {
  const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appointment) {
    throw new NotFoundError("Appointment not found");
  }
  if (requestingUser.role === "DOCTOR" && appointment.doctorId !== requestingUser.doctorId) {
    throw new AppError(403, "FORBIDDEN", "You do not have access to this appointment");
  }
  return appointment;
}

export async function updateAppointment(
  appointmentId: string,
  input: UpdateAppointmentInput,
  requestingUser: { role: "DOCTOR" | "ADMIN"; doctorId: string | null }
) {
  const existing = await assertOwnsAppointment(appointmentId, requestingUser);

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
      throw new NotFoundError("Appointment type not found");
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

  const conflict = await prisma.appointment.findFirst({
    where: {
      id: { not: appointmentId },
      doctorId: existing.doctorId,
      status: { not: "CANCELLED" },
      startTime: { lt: endTime },
      endTime: { gt: startTime },
    },
  });

  if (conflict) {
    throw new AppError(
      409,
      "APPOINTMENT_CONFLICT",
      "This time conflicts with an existing appointment for this doctor"
    );
  }

  return prisma.appointment.update({
    where: { id: appointmentId },
    data: { appointmentTypeId, startTime, endTime, bookingComment: input.bookingComment },
    include: {
      patient: { select: { firstName: true, lastName: true } },
      appointmentType: { select: { name: true, duration: true } },
    },
  });
}

export async function updateAppointmentStatus(
  appointmentId: string,
  input: UpdateStatusInput,
  requestingUser: { role: "DOCTOR" | "ADMIN"; doctorId: string | null }
) {
  await assertOwnsAppointment(appointmentId, requestingUser);

  return prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: input.status },
    include: {
      patient: { select: { firstName: true, lastName: true } },
      appointmentType: { select: { name: true, duration: true } },
    },
  });
}

export async function getAppointmentById(
  appointmentId: string,
  requestingUser: { role: "DOCTOR" | "ADMIN"; doctorId: string | null }
) {
  const appointment = await assertOwnsAppointment(appointmentId, requestingUser);
  return prisma.appointment.findUnique({
    where: { id: appointment.id },
    include: {
      patient: { select: { firstName: true, lastName: true } },
      appointmentType: { select: { name: true, duration: true } },
    },
  });
}

export async function getPatientAppointments(
  patientId: string,
  requestingUser: { role: "DOCTOR" | "ADMIN"; doctorId: string | null }
) {
  // 404 om patienten saknas, istället för en tom lista
  await getPatientById(patientId);

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
