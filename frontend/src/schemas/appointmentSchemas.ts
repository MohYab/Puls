import { z } from "zod";

export const appointmentFormSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  appointmentTypeId: z.string().min(1, "Appointment type is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
});

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;
