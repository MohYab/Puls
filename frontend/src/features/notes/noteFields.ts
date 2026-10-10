import type { NoteContent } from "../../types/note";

export const NOTE_FIELDS: { name: keyof NoteContent; label: string }[] = [
  { name: "reasonForVisit", label: "Reason for visit" },
  { name: "observation", label: "Observation" },
  { name: "assessment", label: "Assessment" },
  { name: "plan", label: "Plan" },
];
