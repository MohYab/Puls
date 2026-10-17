import { z } from "zod";

// Keep in sync with MAX_NOTE_FIELD_LENGTH in backend/src/validators/noteValidators.ts
export const MAX_NOTE_FIELD_LENGTH = 5000;

const noteField = z
  .string()
  .trim()
  .max(MAX_NOTE_FIELD_LENGTH, `Must be at most ${MAX_NOTE_FIELD_LENGTH} characters`);

export const noteFormSchema = z
  .object({
    reasonForVisit: noteField,
    observation: noteField,
    assessment: noteField,
    plan: noteField,
  })
  .refine((values) => Object.values(values).some((value) => value.length > 0), {
    message: "Write something in at least one field",
    path: ["reasonForVisit"],
  });

export type NoteFormValues = z.infer<typeof noteFormSchema>;

export const shareNoteFormSchema = z.object({
  doctorId: z.string().min(1, "Choose a doctor"),
  // boolean + refine (not z.literal(true)) so the form can start unchecked.
  consentConfirmed: z
    .boolean()
    .refine((checked) => checked, "Confirm that the patient has agreed to sharing"),
});

export type ShareNoteFormValues = z.infer<typeof shareNoteFormSchema>;
