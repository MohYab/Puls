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
