import { z } from "zod";

export const MAX_NOTE_FIELD_LENGTH = 5000;

// Missing fields default to "" so the stored content always has all four keys.
const noteField = z
  .string()
  .trim()
  .max(MAX_NOTE_FIELD_LENGTH, `Must be at most ${MAX_NOTE_FIELD_LENGTH} characters`)
  .default("");

// --- Vital signs ---------------------------------------------------
// Plausibility limits that catch typing mistakes (e.g. 1670 cm), not clinical alarms.

function hasOneDecimalAtMost(value: number): boolean {
  return Math.abs(value * 10 - Math.round(value * 10)) < 1e-9;
}

function measure(min: number, max: number, unit: string, step: 1 | 0.1) {
  const message = `Must be between ${min} and ${max} ${unit}`;
  const base = z.number({ message: "Must be a number" }).min(min, message).max(max, message);
  const withStep =
    step === 1
      ? base.int("Must be a whole number")
      : base.refine(hasOneDecimalAtMost, "At most one decimal");
  return withStep.optional();
}

export const vitalsSchema = z
  .object({
    systolic: measure(50, 260, "mmHg", 1),
    diastolic: measure(30, 160, "mmHg", 1),
    heartRate: measure(20, 250, "/min", 1),
    temperature: measure(30, 45, "°C", 0.1),
    oxygenSaturation: measure(50, 100, "%", 1),
    respiratoryRate: measure(4, 60, "/min", 1),
    weight: measure(0.5, 400, "kg", 0.1),
    height: measure(30, 250, "cm", 1),
  })
  .superRefine((vitals, ctx) => {
    const hasSystolic = vitals.systolic !== undefined;
    const hasDiastolic = vitals.diastolic !== undefined;
    if (hasSystolic !== hasDiastolic) {
      ctx.addIssue({
        code: "custom",
        path: [hasSystolic ? "diastolic" : "systolic"],
        message: "Enter both values",
      });
    } else if (hasSystolic && vitals.systolic! <= vitals.diastolic!) {
      ctx.addIssue({
        code: "custom",
        path: ["systolic"],
        message: "Systolic must be higher than diastolic",
      });
    }
  })
  // Only measured values are stored, an empty object becomes "no vital signs".
  .transform((vitals) => {
    const measured = Object.fromEntries(
      Object.entries(vitals).filter(([, value]) => value !== undefined)
    );
    return Object.keys(measured).length > 0 ? (measured as typeof vitals) : undefined;
  });

export type Vitals = NonNullable<z.infer<typeof vitalsSchema>>;

const noteFields = {
  reasonForVisit: noteField,
  observation: noteField,
  assessment: noteField,
  plan: noteField,
  vitals: vitalsSchema.optional(),
};

// A note with only vital signs is documentation too.
function hasContent(values: {
  reasonForVisit: string;
  observation: string;
  assessment: string;
  plan: string;
  vitals?: Vitals;
}): boolean {
  const hasText = [values.reasonForVisit, values.observation, values.assessment, values.plan].some(
    (value) => value.length > 0
  );
  return hasText || values.vitals !== undefined;
}

const atLeastOneFieldError = { message: "Write something or record a vital sign" };

// Used when editing a note. The template cannot be changed after the first save.
export const noteContentSchema = z.object(noteFields).refine(hasContent, atLeastOneFieldError);

// Used when creating a note. The template is optional.
export const createNoteSchema = z
  .object({ ...noteFields, templateId: z.string().min(1).optional() })
  .refine(hasContent, atLeastOneFieldError);

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
