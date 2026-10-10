import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "../../services/apiClient";
import { noteFormSchema, type NoteFormValues } from "../../schemas/noteSchemas";
import type { ClinicalNote } from "../../types/note";
import { formatDateTime } from "../../utils/date";
import { useSaveNote } from "./useNotes";
import { NOTE_FIELDS } from "./noteFields";

const EMPTY_VALUES: NoteFormValues = {
  reasonForVisit: "",
  observation: "",
  assessment: "",
  plan: "",
};

interface DocumentationFormProps {
  appointmentId: string;
  note: ClinicalNote | null;
}

export function DocumentationForm({ appointmentId, note }: DocumentationFormProps) {
  const saveNote = useSaveNote(appointmentId, note?.id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: note?.content ?? EMPTY_VALUES,
  });

  function onSubmit(values: NoteFormValues) {
    // Reset with the saved content so the form is "clean" again after a save.
    saveNote.mutate(values, { onSuccess: (saved) => reset(saved.content) });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      {NOTE_FIELDS.map(({ name, label }) => (
        <div key={name}>
          <label htmlFor={name} className="mb-1 block text-sm font-medium">
            {label}
          </label>
          <textarea
            id={name}
            rows={4}
            aria-invalid={!!errors[name]}
            {...register(name)}
            className="w-full rounded border px-3 py-2 text-sm"
          />
          {errors[name] && (
            <p role="alert" className="mt-1 text-sm text-red-600">
              {errors[name]?.message}
            </p>
          )}
        </div>
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
