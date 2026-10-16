import { z } from "zod";

// The calendar grid works in 5-minute steps.
const DURATION_STEP = 5;
const MIN_DURATION = 5;
const MAX_DURATION = 240;

export const appointmentTypeSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60, "Name can be at most 60 characters"),
  duration: z
    .number({ message: "Duration must be a number of minutes" })
    .int("Duration must be whole minutes")
    .min(MIN_DURATION, `Duration must be at least ${MIN_DURATION} minutes`)
    .max(MAX_DURATION, `Duration can be at most ${MAX_DURATION} minutes`)
    .multipleOf(DURATION_STEP, `Duration must be in steps of ${DURATION_STEP} minutes`),
  description: z.string().trim().max(300, "Description can be at most 300 characters").optional(),
});

// PUT replaces all editable fields, so create and update share one schema.
export type AppointmentTypeInput = z.infer<typeof appointmentTypeSchema>;

export const appointmentTypeStatusSchema = z.object({
  isActive: z.boolean({ message: "isActive must be true or false" }),
});

export type AppointmentTypeStatusInput = z.infer<typeof appointmentTypeStatusSchema>;
