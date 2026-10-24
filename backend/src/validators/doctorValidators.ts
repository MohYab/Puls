import { z } from "zod";

// bcrypt only uses the first 72 bytes of a password.
export const MIN_PASSWORD_LENGTH = 10;
export const MAX_PASSWORD_LENGTH = 72;

export const passwordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
  .max(MAX_PASSWORD_LENGTH, `Password can be at most ${MAX_PASSWORD_LENGTH} characters`);

const doctorFields = {
  name: z.string().trim().min(1, "Name is required").max(100, "Name can be at most 100 characters"),
  // Emails are stored in lower case, so login is case-insensitive.
  email: z
    .email("Invalid email address")
    .max(254)
    .transform((value) => value.toLowerCase()),
  specialization: z
    .union([
      z.string().trim().max(100, "Specialization can be at most 100 characters"),
      z.literal(""),
    ])
    .optional(),
};

export const createDoctorSchema = z.object({ ...doctorFields, password: passwordSchema });
export const updateDoctorSchema = z.object(doctorFields);
export const doctorStatusSchema = z.object({
  isActive: z.boolean({ message: "isActive must be true or false" }),
});

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;
export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>;
