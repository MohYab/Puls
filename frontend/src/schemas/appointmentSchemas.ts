import { z } from "zod";
import { CLOSING_HOUR, CLOSING_TIME, OPENING_HOUR, OPENING_TIME } from "../config/openingHours";

function minutesOfDay(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// The start time must be inside the opening hours. Whether the appointment also
// ends before closing depends on the type's duration; the API checks that.
export const appointmentTimeSchema = z
  .string()
  .min(1, "Time is required")
  .refine(
    (time) => minutesOfDay(time) >= OPENING_HOUR * 60 && minutesOfDay(time) < CLOSING_HOUR * 60,
    `Choose a time between ${OPENING_TIME} and ${CLOSING_TIME}`
  );

export const appointmentFormSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  appointmentTypeId: z.string().min(1, "Appointment type is required"),
  date: z.string().min(1, "Date is required"),
  time: appointmentTimeSchema,
});

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

export const correctionFormSchema = z.object({
  status: z.enum(["SCHEDULED", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"], {
    message: "Choose a new status",
  }),
  reason: z
    .string()
    .trim()
    .min(10, "Write a reason, at least 10 characters")
    .max(300, "Reason can be at most 300 characters"),
});

export type CorrectionFormValues = z.infer<typeof correctionFormSchema>;
