import { z } from "zod";

export const createAppointmentSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  appointmentTypeId: z.string().min(1, "Appointment type is required"),
  // ISO 8601 with Z or an offset, e.g. 2026-10-24T08:00:00.000Z or 2026-10-24T10:00:00+02:00.
  startTime: z.iso.datetime({ offset: true, message: "Invalid start time" }),
  bookingComment: z.string().optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;

export const updateAppointmentSchema = z.object({
  appointmentTypeId: z.string().min(1).optional(),
  startTime: z.iso.datetime({ offset: true, message: "Invalid start time" }).optional(),
  bookingComment: z.string().optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(["SCHEDULED", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]),
  // Required (checked in the service) when an admin corrects a final status.
  reason: z
    .string()
    .trim()
    .min(10, "At least 10 characters")
    .max(300, "At most 300 characters")
    .optional(),
});

export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
