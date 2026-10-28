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

// Week view: one request per week. The limit stops anyone fetching a whole year at once.
export const MAX_RANGE_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

const isoDate = z.iso.date({ message: "Dates must be valid and in the format YYYY-MM-DD" });

export const listAppointmentsQuerySchema = z
  .object({
    date: isoDate.optional(),
    from: isoDate.optional(),
    to: isoDate.optional(),
    doctorId: z.string().min(1).optional(),
  })
  .superRefine((query, ctx) => {
    const issue = (message: string) => ctx.addIssue({ code: "custom", message });

    if (query.date && (query.from || query.to)) {
      issue("Use either date or from/to, not both");
      return;
    }
    if ((query.from === undefined) !== (query.to === undefined)) {
      issue("from and to must be used together");
      return;
    }
    if (query.from && query.to) {
      // Date.parse reads YYYY-MM-DD as UTC midnight, so daylight saving time does not matter here.
      const days = (Date.parse(query.to) - Date.parse(query.from)) / DAY_MS + 1;
      if (days < 1) issue("from must be on or before to");
      else if (days > MAX_RANGE_DAYS) issue(`At most ${MAX_RANGE_DAYS} days at a time`);
    }
  });

export type ListAppointmentsQuery = z.infer<typeof listAppointmentsQuerySchema>;