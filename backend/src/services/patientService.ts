import { NotFoundError } from "../utils/errors.js";
import { prisma } from "../utils/prisma.js";

export async function getAllPatients(search?: string) {
  return prisma.patient.findMany({
    where: search
      ? {
          OR: [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { lastName: "asc" },
  });
}

export async function getPatientById(id: string) {
  const patient = await prisma.patient.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      dateOfBirth: true,
      phone: true,
      email: true,
    },
  });

  if (!patient) {
    throw new NotFoundError("Patient not found");
  }

  return patient;
}
