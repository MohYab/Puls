import { z } from "zod";

export const appointmentFormSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  appointmentTypeId: z.string().min(1, "Appointment type is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
});

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

export const correctionFormSchema = z.object({
  status: z.enum(["SCHEDULED", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"], {
    message: "Choose a new status",
  }),
  reason: z
    .string()
    .trim()
    .min(10, "Write a reason of at least 10 characters")
    .max(300, "Reason can be at most 300 characters"),
});

export type CorrectionFormValues = z.infer<typeof correctionFormSchema>;
