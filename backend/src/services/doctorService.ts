import { prisma } from "../utils/prisma.js";

export async function getAllDoctors() {
  return prisma.doctor.findMany({
    include: { user: { select: { name: true } } },
  });
}
