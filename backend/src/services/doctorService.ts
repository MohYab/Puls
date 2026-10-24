import bcrypt from "bcryptjs";
import { prisma } from "../utils/prisma.js";
import { AppError, NotFoundError } from "../utils/errors.js";
import type { CreateDoctorInput, UpdateDoctorInput } from "../validators/doctorValidators.js";

const BCRYPT_ROUNDS = 10;

// Never includes passwordHash.
const doctorSelect = {
  id: true,
  specialization: true,
  user: {
    select: { id: true, name: true, email: true, phone: true, isActive: true, deactivatedAt: true },
  },
} as const;

async function getDoctorOrThrow(id: string) {
  const doctor = await prisma.doctor.findUnique({
    where: { id },
    select: { id: true, userId: true, user: { select: { isActive: true } } },
  });
  if (!doctor) {
    throw new NotFoundError("Doctor not found");
  }
  return doctor;
}

async function assertEmailAvailable(email: string, excludeUserId?: string) {
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing && existing.id !== excludeUserId) {
    throw new AppError(409, "EMAIL_IN_USE", "Another user already has this email address");
  }
}

export async function getAllDoctors({ includeInactive }: { includeInactive: boolean }) {
  return prisma.doctor.findMany({
    where: includeInactive ? {} : { user: { isActive: true } },
    select: doctorSelect,
    orderBy: { user: { name: "asc" } },
  });
}

export async function createDoctor(input: CreateDoctorInput) {
  await assertEmailAvailable(input.email);
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  return prisma.doctor.create({
    data: {
      specialization: input.specialization || null,
      user: {
        create: { name: input.name, email: input.email, passwordHash, role: "DOCTOR" },
      },
    },
    select: doctorSelect,
  });
}

export async function updateDoctor(id: string, input: UpdateDoctorInput) {
  const doctor = await getDoctorOrThrow(id);
  await assertEmailAvailable(input.email, doctor.userId);

  return prisma.doctor.update({
    where: { id },
    data: {
      specialization: input.specialization || null,
      user: { update: { name: input.name, email: input.email } },
    },
    select: doctorSelect,
  });
}

export async function setDoctorActive(id: string, isActive: boolean) {
  const doctor = await getDoctorOrThrow(id);

  if (doctor.user.isActive === isActive) {
    throw new AppError(
      409,
      "DOCTOR_STATUS_UNCHANGED",
      `The doctor is already ${isActive ? "active" : "inactive"}`
    );
  }

  if (!isActive) {
    // A doctor who leaves usually has patients who should be moved to a
    // colleague, one by one, so the admin does that first.
    const futureAppointments = await prisma.appointment.count({
      where: {
        doctorId: id,
        startTime: { gt: new Date() },
        status: { in: ["SCHEDULED", "CONFIRMED"] },
      },
    });
    if (futureAppointments > 0) {
      throw new AppError(
        409,
        "DOCTOR_HAS_APPOINTMENTS",
        `The doctor has ${futureAppointments} future appointment${futureAppointments === 1 ? "" : "s"}. Move or cancel them first.`
      );
    }
  }

  await prisma.user.update({
    where: { id: doctor.userId },
    data: { isActive, deactivatedAt: isActive ? null : new Date() },
  });

  return prisma.doctor.findUniqueOrThrow({ where: { id }, select: doctorSelect });
}
