import { z } from "zod";
import { passwordSchema } from "./doctorValidators.js";

const optional = <T extends z.ZodType>(schema: T) => z.union([schema, z.literal("")]).optional();

export const accountSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name can be at most 100 characters"),
  phone: optional(
    z
      .string()
      .trim()
      .max(30, "Phone can be at most 30 characters")
      .regex(/^[0-9 +()-]+$/, "Phone may only contain digits, spaces and + ( ) -")
  ),
  // Only used for doctors; ignored for admins.
  specialization: optional(
    z.string().trim().max(100, "Specialization can be at most 100 characters")
  ),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password"),
  newPassword: passwordSchema,
});

export type AccountInput = z.infer<typeof accountSchema>;
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;
