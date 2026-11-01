import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "../../components/FormField";
import { inputClassName } from "../../components/formStyles";
import { ApiError } from "../../services/apiClient";
import { noteFormSchema, type NoteFormValues } from "../../schemas/noteSchemas";
import type { DocumentationTemplate } from "../../types/documentationTemplate";
import type { ClinicalNote, NoteContent } from "../../types/note";
import { formatDateTime } from "../../utils/date";
import { NOTE_FIELDS, visibleFields } from "./noteFields";
import { SectionNumber } from "./SectionNumber";
import { useSaveNote } from "./useNotes";
import { VitalSignsFields } from "./VitalSignsFields";
import { fromVitalInputs, toVitalInputs } from "./vitals";

const DEFAULT_TEMPLATE_NAME = "General consultation";

function defaultTemplateId(templates: DocumentationTemplate[]): string {
  const preferred = templates.find((t) => t.name === DEFAULT_TEMPLATE_NAME) ?? templates[0];
  return preferred?.id ?? "";
}

/** The API's content (numbers) as form values (text). */
function toFormValues(content: NoteContent | undefined): NoteFormValues {
  return {
    reasonForVisit: content?.reasonForVisit ?? "",
    observation: content?.observation ?? "",
    assessment: content?.assessment ?? "",
    plan: content?.plan ?? "",
    vitals: toVitalInputs(content?.vitals),
  };
}

interface DocumentationFormProps {
  appointmentId: string;
  note: ClinicalNote | null;
  templates: DocumentationTemplate[];
}

export function DocumentationForm({ appointmentId, note, templates }: DocumentationFormProps) {
  const saveNote = useSaveNote(appointmentId, note?.id);
  const [selectedTemplateId, setSelectedTemplateId] = useState(() => defaultTemplateId(templates));

  // An existing note keeps its template (locked); a new note uses the selection.
  const activeTemplateId = note ? note.templateId : selectedTemplateId;
  const activeTemplate = templates.find((t) => t.id === activeTemplateId) ?? null;
  const fields = visibleFields(activeTemplate?.templateContent.sections ?? null, note?.content);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: toFormValues(note?.content),
  });

  function handleTemplateChange(templateId: string) {
    setSelectedTemplateId(templateId);

    // Clear text fields the new template does not have, so no hidden text is saved.
    const sections = templates.find((t) => t.id === templateId)?.templateContent.sections;
    for (const { name } of NOTE_FIELDS) {
      if (sections && !sections.includes(name)) {
        setValue(name, "");
      }
    }
  }

  function onSubmit({ vitals, ...text }: NoteFormValues) {
    saveNote.mutate(
      // vitals is always sent: PUT replaces the whole content.
      {
        content: { ...text, vitals: fromVitalInputs(vitals) },
        templateId: selectedTemplateId || undefined,
      },
      // Reset with the saved content so the form is "clean" again after a save.
      { onSuccess: (saved) => reset(toFormValues(saved.content)) }
    );
  }

  // Reason for visit first, then vital signs, then the template's other fields.
  // Numbers follow the visible sections, so a hidden field leaves no gap.
  const reason = fields.filter(({ name }) => name === "reasonForVisit");
  const rest = fields.filter(({ name }) => name !== "reasonForVisit");
  const vitalsNumber = reason.length + 1;

  const textSection = ({ name, label }: (typeof fields)[number], number: number) => (
    <div key={name} className="flex gap-3">
      <SectionNumber number={number} />
      <div className="min-w-0 flex-1">
        <FormField id={name} label={label} error={errors[name]?.message}>
          {(field) => (
            <textarea {...field} rows={3} {...register(name)} className={inputClassName} />
          )}
        </FormField>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      {note ? (
        <p className="text-sm text-muted">
          Template: <span className="font-medium text-ink">{activeTemplate?.name ?? "None"}</span> ·
          Locked after the first save
        </p>
      ) : (
        <FormField id="template" label="Template" hint="Locked after the first save">
          {(field) => (
            <select
              {...field}
              value={selectedTemplateId}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className={inputClassName}
            >
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          )}
        </FormField>
      )}

      {reason.map((field) => textSection(field, 1))}
      <VitalSignsFields number={vitalsNumber} register={register} errors={errors} />
      {rest.map((field, index) => textSection(field, vitalsNumber + 1 + index))}

      {saveNote.isError && (
        <p role="alert" className="text-sm text-danger">
          {saveNote.error instanceof ApiError ? saveNote.error.message : "Something went wrong."}
        </p>
      )}
      {saveNote.isSuccess && !isDirty && (
        <p role="status" className="text-sm text-completed">
          Documentation saved.
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <p className="text-xs text-muted">
          {note
            ? `Created ${formatDateTime(note.createdAt)} · Last saved ${formatDateTime(note.updatedAt)}`
            : "Not saved yet"}
        </p>
        <button
          type="submit"
          disabled={saveNote.isPending}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saveNote.isPending ? "Saving..." : note ? "Save changes" : "Save documentation"}
        </button>
      </div>
    </form>
  );
}
