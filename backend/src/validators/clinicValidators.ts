import { z } from "zod";

const optional = <T extends z.ZodType>(schema: T) => z.union([schema, z.literal("")]).optional();

export const clinicSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name can be at most 100 characters"),
  addressLine: optional(z.string().trim().max(100, "Address can be at most 100 characters")),
  // Swedish postal codes: "123 45" or "12345".
  postalCode: optional(
    z
      .string()
      .trim()
      .regex(/^\d{3} ?\d{2}$/, "Postal code must look like 123 45")
  ),
  city: optional(z.string().trim().max(60, "City can be at most 60 characters")),
  phone: optional(
    z
      .string()
      .trim()
      .max(30, "Phone can be at most 30 characters")
      .regex(/^[0-9 +()-]+$/, "Phone may only contain digits, spaces and + ( ) -")
  ),
  email: optional(z.email("Invalid email address").max(254)),
});

export type ClinicInput = z.infer<typeof clinicSchema>;
