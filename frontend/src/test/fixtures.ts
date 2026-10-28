import type { Appointment } from "../types/appointment";

export function makeAppointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: "a1",
    patientId: "p1",
    doctorId: "d1",
    appointmentTypeId: "t1",
    startTime: "2026-10-27T09:30:00.000Z", // 10:30 in Stockholm
    endTime: "2026-10-27T10:15:00.000Z",
    status: "COMPLETED",
    bookingComment: null,
    createdAt: "2026-10-20T08:00:00.000Z",
    updatedAt: "2026-10-20T08:00:00.000Z",
    patient: { firstName: "Anna", lastName: "Andersson" },
    appointmentType: { name: "General consultation", duration: 45 },
    doctor: { user: { name: "Erik Lindqvist" } },
    ...overrides,
  };
}