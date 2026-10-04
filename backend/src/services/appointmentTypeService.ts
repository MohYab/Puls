import { prisma } from "../utils/prisma.js";

export async function getAllAppointmentTypes() {
  return prisma.appointmentType.findMany({
    orderBy: { name: "asc" },
  });
}
