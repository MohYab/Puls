import { z } from "zod";
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "./doctorSchemas";

export const accountFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name can be at most 100 characters"),
  phone: z
    .string()
    .trim()
    .max(30, "Phone can be at most 30 characters")
    .refine(
      (value) => value === "" || /^[0-9 +()-]+$/.test(value),
      "Phone may only contain digits, spaces and + ( ) -"
    ),
  specialization: z.string().trim().max(100, "Specialization can be at most 100 characters"),
});

export type AccountFormValues = z.infer<typeof accountFormSchema>;

export const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z
      .string()
      .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
      .max(MAX_PASSWORD_LENGTH, `Password can be at most ${MAX_PASSWORD_LENGTH} characters`),
    confirmPassword: z.string(),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "The passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    message: "The new password must be different from the current one",
    path: ["newPassword"],
  });

export type PasswordFormValues = z.infer<typeof passwordFormSchema>;
