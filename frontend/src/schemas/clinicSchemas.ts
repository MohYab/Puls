import { z } from "zod";

// Mirrors backend/src/validators/clinicValidators.ts.
const optionalMatching = (pattern: RegExp, message: string) =>
  z.string().trim().refine((value) => value === "" || pattern.test(value), message);

export const clinicFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name can be at most 100 characters"),
  addressLine: z.string().trim().max(100, "Address can be at most 100 characters"),
  postalCode: optionalMatching(/^\d{3} ?\d{2}$/, "Postal code must look like 123 45"),
  city: z.string().trim().max(60, "City can be at most 60 characters"),
  phone: optionalMatching(/^[0-9 +()-]+$/, "Phone may only contain digits, spaces and + ( ) -"),
  email: z
    .string()
    .trim()
    .refine((value) => value === "" || z.email().safeParse(value).success, "Invalid email address"),
});

export type ClinicFormValues = z.infer<typeof clinicFormSchema>;