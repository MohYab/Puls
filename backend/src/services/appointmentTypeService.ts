import { prisma } from "../utils/prisma.js";
import { AppError, NotFoundError } from "../utils/errors.js";
import type { AppointmentTypeInput } from "../validators/appointmentTypeValidators.js";

export async function getAllAppointmentTypes({ includeInactive }: { includeInactive: boolean }) {
  return prisma.appointmentType.findMany({
    where: includeInactive ? {} : { isActive: true },
    orderBy: { name: "asc" },
  });
}

async function getAppointmentTypeOrThrow(id: string) {
  const type = await prisma.appointmentType.findUnique({ where: { id } });
  if (!type) {
    throw new NotFoundError("Appointment type not found");
  }
  return type;
}

// Names are compared case-insensitively: "Vaccination" and "vaccination" are the same type.
async function assertNameAvailable(name: string, excludeId?: string) {
  const existing = await prisma.appointmentType.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      ...(excludeId && { id: { not: excludeId } }),
    },
  });
  if (existing) {
    throw new AppError(
      409,
      "APPOINTMENT_TYPE_EXISTS",
      `An appointment type named "${existing.name}" already exists`
    );
  }
}

export async function createAppointmentType(input: AppointmentTypeInput) {
  await assertNameAvailable(input.name);

  return prisma.appointmentType.create({
    data: {
      name: input.name,
      duration: input.duration,
      description: input.description || null,
    },
  });
}

export async function updateAppointmentType(id: string, input: AppointmentTypeInput) {
  await getAppointmentTypeOrThrow(id);
  await assertNameAvailable(input.name, id);

  // Booked appointments keep their own endTime, so a new duration only
  // affects appointments booked after the change.
  return prisma.appointmentType.update({
    where: { id },
    data: {
      name: input.name,
      duration: input.duration,
      description: input.description || null,
    },
  });
}

export async function setAppointmentTypeActive(id: string, isActive: boolean) {
  await getAppointmentTypeOrThrow(id);

  return prisma.appointmentType.update({
    where: { id },
    data: { isActive },
  });
}
