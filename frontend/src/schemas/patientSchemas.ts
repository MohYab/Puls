import { z } from "zod";
import { toDateString } from "../utils/date";

// Mirrors backend/src/validators/patientValidators.ts.
const name = (label: string) =>
  z.string().trim().min(1, `${label} is required`).max(60, `${label} can be at most 60 characters`);

export const patientFormSchema = z.object({
  firstName: name("First name"),
  lastName: name("Last name"),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine(
      (value) => value >= "1900-01-01" && value <= toDateString(new Date()),
      "Enter a date of birth between 1900 and today"
    ),
  phone: z
    .string()
    .trim()
    .max(30, "Phone can be at most 30 characters")
    .refine(
      (value) => value === "" || /^[0-9 +()-]+$/.test(value),
      "Phone may only contain digits, spaces and + ( ) -"
    ),
  email: z
    .string()
    .trim()
    .max(254, "Email is too long")
    .refine((value) => value === "" || z.email().safeParse(value).success, "Invalid email address"),
});

export type PatientFormValues = z.infer<typeof patientFormSchema>;
