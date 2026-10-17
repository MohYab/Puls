import { z } from "zod";

export const MAX_NOTE_FIELD_LENGTH = 5000;

// Missing fields default to "" so the stored content always has all four keys.
const noteField = z
  .string()
  .trim()
  .max(MAX_NOTE_FIELD_LENGTH, `Must be at most ${MAX_NOTE_FIELD_LENGTH} characters`)
  .default("");

const noteFields = {
  reasonForVisit: noteField,
  observation: noteField,
  assessment: noteField,
  plan: noteField,
};

function hasAtLeastOneField(values: {
  reasonForVisit: string;
  observation: string;
  assessment: string;
  plan: string;
}): boolean {
  return [values.reasonForVisit, values.observation, values.assessment, values.plan].some(
    (value) => value.length > 0
  );
}

const atLeastOneFieldError = { message: "Write something in at least one field" };

// Used when editing a note. The template cannot be changed after the first save.
export const noteContentSchema = z
  .object(noteFields)
  .refine(hasAtLeastOneField, atLeastOneFieldError);

// Used when creating a note. The template is optional.
export const createNoteSchema = z
  .object({ ...noteFields, templateId: z.string().min(1).optional() })
  .refine(hasAtLeastOneField, atLeastOneFieldError);

export type NoteContentInput = z.infer<typeof noteContentSchema>;
export type CreateNoteInput = z.infer<typeof createNoteSchema>;

export const shareNoteSchema = z.object({
  doctorId: z.string().min(1, "Choose a doctor"),
  // Simulated consent: the author confirms that the patient has agreed.
  consentConfirmed: z.literal(true, {
    message: "Confirm that the patient has agreed to sharing",
  }),
});

export type ShareNoteInput = z.infer<typeof shareNoteSchema>;
