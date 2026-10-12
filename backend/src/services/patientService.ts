import { NotFoundError } from "../utils/errors.js";
import { prisma } from "../utils/prisma.js";

export async function getAllPatients(search?: string) {
  // Every word must match the first or the last name, so "anna andersson" finds Anna Andersson.
  const terms = search?.trim().split(/\s+/).filter(Boolean) ?? [];

  return prisma.patient.findMany({
    where:
      terms.length > 0
        ? {
            AND: terms.map((term) => ({
              OR: [
                { firstName: { contains: term, mode: "insensitive" as const } },
                { lastName: { contains: term, mode: "insensitive" as const } },
              ],
            })),
          }
        : undefined,
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
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
