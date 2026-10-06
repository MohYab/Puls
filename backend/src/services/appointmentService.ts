import { prisma } from "../utils/prisma.js";

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
