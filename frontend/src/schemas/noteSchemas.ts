import { z } from "zod";
import { VITAL_LIMITS } from "../config/vitals";
import type { VitalKey } from "../types/note";

// Keep in sync with MAX_NOTE_FIELD_LENGTH in backend/src/validators/noteValidators.ts
export const MAX_NOTE_FIELD_LENGTH = 5000;

const noteField = z
  .string()
  .trim()
  .max(MAX_NOTE_FIELD_LENGTH, `Must be at most ${MAX_NOTE_FIELD_LENGTH} characters`);

// --- Vital signs: the form holds text, the API gets numbers -----------------------

/** null = not measured. A comma is accepted as decimal separator. NaN = not a number. */
export function parseVital(raw: string): number | null {
  const text = raw.trim();
  return text === "" ? null : Number(text.replace(",", "."));
}

function hasOneDecimalAtMost(value: number): boolean {
  return Math.abs(value * 10 - Math.round(value * 10)) < 1e-9;
}

// Same limits and messages as the backend, so the user sees the error at the field.
function vitalInput(key: VitalKey) {
  const { min, max, step, unit } = VITAL_LIMITS[key];
  return z.string().superRefine((raw, ctx) => {
    const value = parseVital(raw);
    if (value === null) return;
    const issue = (message: string) => ctx.addIssue({ code: "custom", message });

    if (!Number.isFinite(value)) issue("Must be a number");
    else if (value < min || value > max) issue(`Must be between ${min} and ${max} ${unit}`);
    else if (step === 1 && !Number.isInteger(value)) issue("Must be a whole number");
    else if (step === 0.1 && !hasOneDecimalAtMost(value)) issue("At most one decimal");
  });
}

const vitalsFormSchema = z
  .object({
    systolic: vitalInput("systolic"),
    diastolic: vitalInput("diastolic"),
    heartRate: vitalInput("heartRate"),
    temperature: vitalInput("temperature"),
    oxygenSaturation: vitalInput("oxygenSaturation"),
    respiratoryRate: vitalInput("respiratoryRate"),
    weight: vitalInput("weight"),
    height: vitalInput("height"),
  })
  .superRefine((vitals, ctx) => {
    const systolic = parseVital(vitals.systolic);
    const diastolic = parseVital(vitals.diastolic);
    if ((systolic === null) !== (diastolic === null)) {
      ctx.addIssue({
        code: "custom",
        path: [systolic === null ? "systolic" : "diastolic"],
        message: "Enter both values",
      });
    } else if (systolic !== null && diastolic !== null && systolic <= diastolic) {
      ctx.addIssue({
        code: "custom",
        path: ["systolic"],
        message: "Systolic must be higher than diastolic",
      });
    }
  });

export const noteFormSchema = z
  .object({
    reasonForVisit: noteField,
    observation: noteField,
    assessment: noteField,
    plan: noteField,
    vitals: vitalsFormSchema,
  })
  .refine(
    (values) =>
      [values.reasonForVisit, values.observation, values.assessment, values.plan].some(
        (value) => value.length > 0
      ) || Object.values(values.vitals).some((value) => value.trim() !== ""),
    { message: "Write something or record a vital sign", path: ["reasonForVisit"] }
  );

export type NoteFormValues = z.infer<typeof noteFormSchema>;

export const shareNoteFormSchema = z.object({
  doctorId: z.string().min(1, "Choose a doctor"),
  // boolean + refine (not z.literal(true)) so the form can start unchecked.
  consentConfirmed: z
    .boolean()
    .refine((checked) => checked, "Confirm that the patient has agreed to sharing"),
});

export type ShareNoteFormValues = z.infer<typeof shareNoteFormSchema>;
