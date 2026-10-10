import { z } from "zod";

export const MAX_NOTE_FIELD_LENGTH = 5000;

// Missing fields default to "" so the stored content always has all four keys.
const noteField = z
  .string()
  .trim()
  .max(MAX_NOTE_FIELD_LENGTH, `Must be at most ${MAX_NOTE_FIELD_LENGTH} characters`)
  .default("");

export const noteContentSchema = z
  .object({
    reasonForVisit: noteField,
    observation: noteField,
    assessment: noteField,
    plan: noteField,
  })
  .refine((content) => Object.values(content).some((value) => value.length > 0), {
    message: "Write something in at least one field",
  });

export type NoteContentInput = z.infer<typeof noteContentSchema>;
