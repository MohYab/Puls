import type { NoteContent, NoteTextField } from "../../types/note";

export const NOTE_FIELDS: { name: NoteTextField; label: string }[] = [
  { name: "reasonForVisit", label: "Reason for visit" },
  { name: "observation", label: "Observation" },
  { name: "assessment", label: "Assessment" },
  { name: "plan", label: "Plan" },
];

// The fields to show for a template (null = no template = all fields).
// A field that already has text is always shown, so saved text can never be hidden.
export function visibleFields(sections: readonly NoteTextField[] | null, content?: NoteContent) {
  return NOTE_FIELDS.filter(
    ({ name }) => sections === null || sections.includes(name) || Boolean(content?.[name])
  );
}
