import { z } from "zod";

// Mirrors backend/src/validators/appointmentTypeValidators.ts
export const DURATION_STEP = 5;
export const MIN_DURATION = 5;
export const MAX_DURATION = 240;

export const appointmentTypeFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60, "Name can be at most 60 characters"),
  duration: z
    .number({ message: "Enter the duration in minutes" })
    .int("Duration must be whole minutes")
    .min(MIN_DURATION, `Duration must be at least ${MIN_DURATION} minutes`)
    .max(MAX_DURATION, `Duration can be at most ${MAX_DURATION} minutes`)
    .multipleOf(DURATION_STEP, `Duration must be in steps of ${DURATION_STEP} minutes`),
  description: z.string().trim().max(300, "Description can be at most 300 characters"),
});

export type AppointmentTypeFormValues = z.infer<typeof appointmentTypeFormSchema>;
