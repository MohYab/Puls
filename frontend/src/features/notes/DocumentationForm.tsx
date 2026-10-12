import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "../../components/FormField";
import { inputClassName } from "../../components/formStyles";
import { ApiError } from "../../services/apiClient";
import { noteFormSchema, type NoteFormValues } from "../../schemas/noteSchemas";
import type { DocumentationTemplate } from "../../types/documentationTemplate";
import type { ClinicalNote } from "../../types/note";
import { formatDateTime } from "../../utils/date";
import { NOTE_FIELDS, visibleFields } from "./noteFields";
import { useSaveNote } from "./useNotes";

const DEFAULT_TEMPLATE_NAME = "General consultation";

const EMPTY_VALUES: NoteFormValues = {
  reasonForVisit: "",
  observation: "",
  assessment: "",
  plan: "",
};

function defaultTemplateId(templates: DocumentationTemplate[]): string {
  const preferred = templates.find((t) => t.name === DEFAULT_TEMPLATE_NAME) ?? templates[0];
  return preferred?.id ?? "";
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
    defaultValues: note?.content ?? EMPTY_VALUES,
  });

  function handleTemplateChange(templateId: string) {
    setSelectedTemplateId(templateId);

    // Clear fields the new template does not have, so no hidden text is saved.
    const sections = templates.find((t) => t.id === templateId)?.templateContent.sections;
    for (const { name } of NOTE_FIELDS) {
      if (sections && !sections.includes(name)) {
        setValue(name, "");
      }
    }
  }

  function onSubmit(values: NoteFormValues) {
    saveNote.mutate(
      { content: values, templateId: selectedTemplateId || undefined },
      // Reset with the saved content so the form is "clean" again after a save.
      { onSuccess: (saved) => reset(saved.content) }
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      {note ? (
        <p className="text-sm text-gray-600">
          Template:{" "}
          <span className="font-medium text-gray-900">{activeTemplate?.name ?? "None"}</span>
        </p>
      ) : (
        <FormField id="template" label="Template" hint={activeTemplate?.description ?? undefined}>
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

      {fields.map(({ name, label }) => (
        <FormField key={name} id={name} label={label} error={errors[name]?.message}>
          {(field) => (
            <textarea {...field} rows={4} {...register(name)} className={inputClassName} />
          )}
        </FormField>
      ))}

      {saveNote.isError && (
        <p role="alert" className="text-sm text-red-600">
          {saveNote.error instanceof ApiError ? saveNote.error.message : "Something went wrong."}
        </p>
      )}
      {saveNote.isSuccess && !isDirty && (
        <p role="status" className="text-sm text-green-700">
          Documentation saved.
        </p>
      )}

      <div className="flex items-center justify-between gap-4 pt-2">
        <p className="text-xs text-gray-500">
          {note
            ? `Created ${formatDateTime(note.createdAt)} · Last updated ${formatDateTime(note.updatedAt)}`
            : "Not saved yet"}
        </p>
        <button
          type="submit"
          disabled={saveNote.isPending}
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {saveNote.isPending ? "Saving..." : note ? "Save changes" : "Save documentation"}
        </button>
      </div>
    </form>
  );
}
