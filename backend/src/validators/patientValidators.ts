import { z } from "zod";

const name = (label: string) =>
  z.string().trim().min(1, `${label} is required`).max(60, `${label} can be at most 60 characters`);

// Optional text fields: an empty string from a form means "not given".
const optional = <T extends z.ZodType>(schema: T) => z.union([schema, z.literal("")]).optional();

export const patientSchema = z.object({
  firstName: name("First name"),
  lastName: name("Last name"),
  dateOfBirth: z.iso
    .date({ message: "Date of birth must be a date (YYYY-MM-DD)" })
    .refine((value) => value >= "1900-01-01", "Date of birth is too early")
    .refine(
      (value) => value <= new Date().toISOString().slice(0, 10),
      "Date of birth cannot be in the future"
    ),
  phone: optional(
    z
      .string()
      .trim()
      .max(30, "Phone can be at most 30 characters")
      .regex(/^[0-9 +()-]+$/, "Phone may only contain digits, spaces and + ( ) -")
  ),
  email: optional(z.email("Invalid email address").max(254)),
});

export type PatientInput = z.infer<typeof patientSchema>;

export const patientStatusSchema = z.discriminatedUnion("isActive", [
  z.object({
    isActive: z.literal(false),
    reason: z.enum(["DECEASED", "MOVED", "OTHER"], {
      message: "Choose a reason: DECEASED, MOVED or OTHER",
    }),
  }),
  z.object({ isActive: z.literal(true) }),
]);

export type PatientStatusInput = z.infer<typeof patientStatusSchema>;
