import { z } from "zod";

// Mirrors backend/src/validators/doctorValidators.ts.
export const MIN_PASSWORD_LENGTH = 10;
export const MAX_PASSWORD_LENGTH = 72;

const baseDoctorSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name can be at most 100 characters"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .refine((value) => z.email().safeParse(value).success, "Invalid email address"),
  specialization: z.string().trim().max(100, "Specialization can be at most 100 characters"),
});

// The same value type for both forms; only the new doctor form checks the password.
export const newDoctorFormSchema = baseDoctorSchema.extend({
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
    .max(MAX_PASSWORD_LENGTH, `Password can be at most ${MAX_PASSWORD_LENGTH} characters`),
});

export const editDoctorFormSchema = baseDoctorSchema.extend({
  password: z.string(),
});

export type DoctorFormValues = z.infer<typeof newDoctorFormSchema>;
