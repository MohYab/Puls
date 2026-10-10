import { prisma } from "../utils/prisma.js";
import { AppError, NotFoundError } from "../utils/errors.js";
import type { CreateAppointmentInput } from "../validators/appointmentValidators.js";
import type {
  UpdateAppointmentInput,
  UpdateStatusInput,
} from "../validators/appointmentValidators.js";
import { getPatientById } from "./patientService.js";

interface GetAppointmentsParams {
  requestingUser: { userId: string; role: "DOCTOR" | "ADMIN"; doctorId: string | null };
  date?: string;
}

export async function getAppointments({ requestingUser, date }: GetAppointmentsParams) {
  const where: Record<string, unknown> = {};

  // Doctor only sees their own appointments; Admin sees all.
  if (requestingUser.role === "DOCTOR") {
    where.doctorId = requestingUser.doctorId;
  }

  if (date) {
    const start = new Date(`${date}T00:00:00`);
    const end = new Date(`${date}T23:59:59.999`);
    where.startTime = { gte: start, lte: end };
  }

  return prisma.appointment.findMany({
    where,
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

  const appointmentTypeId = input.appointmentTypeId ?? existing.appointmentTypeId;
  const startTime = input.startTime ? new Date(input.startTime) : existing.startTime;

  const appointmentType = await prisma.appointmentType.findUnique({
    where: { id: appointmentTypeId },
  });
  if (!appointmentType) {
    throw new NotFoundError("Appointment type not found");
  }

  const endTime = new Date(startTime.getTime() + appointmentType.duration * 60 * 1000);

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
      // Doctor ser bara sina egna besök med patienten; Admin ser alla.
      ...(requestingUser.role === "DOCTOR" && { doctorId: requestingUser.doctorId }),
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
