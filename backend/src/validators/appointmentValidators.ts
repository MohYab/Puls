import { z } from "zod";

export const createAppointmentSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  appointmentTypeId: z.string().min(1, "Appointment type is required"),
  startTime: z.string().datetime({ message: "Invalid start time" }),
  bookingComment: z.string().optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;

export const updateAppointmentSchema = z.object({
  appointmentTypeId: z.string().min(1).optional(),
  startTime: z.string().datetime().optional(),
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
