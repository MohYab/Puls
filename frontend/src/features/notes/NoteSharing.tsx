import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "../../components/Card";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { EmptyMessage, ErrorMessage, LoadingMessage } from "../../components/Feedback";
import { FormField } from "../../components/FormField";
import { inputClassName } from "../../components/formStyles";
import { shareNoteFormSchema, type ShareNoteFormValues } from "../../schemas/noteSchemas";
import type { ClinicalNote, NoteShare } from "../../types/note";
import { formatDate } from "../../utils/date";
import { useDoctors } from "../doctors/useDoctors";
import { useNoteShares, useRevokeNoteShare, useShareNote } from "./useNotes";

// Shown on the documentation page for a saved note. Only the author gets here,
// because the page requires that the doctor owns the appointment.
export function NoteSharing({ note }: { note: ClinicalNote }) {
  const formId = useId();
  const sharesQuery = useNoteShares(note.id);
  const doctorsQuery = useDoctors();
  const share = useShareNote(note.id);
  const revoke = useRevokeNoteShare(note.id);
  const [toRevoke, setToRevoke] = useState<NoteShare | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ShareNoteFormValues>({
    resolver: zodResolver(shareNoteFormSchema),
    defaultValues: { doctorId: "", consentConfirmed: false },
  });

  // Not yourself, and not doctors who already have access.
  const sharedDoctorIds = new Set(sharesQuery.data?.map((s) => s.doctor.id));
  const availableDoctors =
    doctorsQuery.data?.filter((d) => d.id !== note.doctorId && !sharedDoctorIds.has(d.id)) ?? [];

  function onSubmit(values: ShareNoteFormValues) {
    share.mutate(values.doctorId, { onSuccess: () => reset() });
  }

  function closeRevokeDialog() {
    setToRevoke(null);
    revoke.reset();
  }

  function confirmRevoke() {
    if (!toRevoke) return;
    revoke.mutate(toRevoke.doctor.id, { onSuccess: () => setToRevoke(null) });
  }

  const consentId = `${formId}-consent`;
  const consentErrorId = `${consentId}-error`;

  return (
    <Card title="Sharing">
      <p className="text-sm text-gray-600">
        Doctors you share with can read this note on the patient page. They cannot edit it.
      </p>

      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-900">Shared with</h3>
        <div className="mt-2" aria-live="polite">
          {sharesQuery.isPending && <LoadingMessage>Loading...</LoadingMessage>}
          {sharesQuery.isError && (
            <ErrorMessage
              message="Could not load who this note is shared with."
              onRetry={() => sharesQuery.refetch()}
            />
          )}
          {sharesQuery.data && sharesQuery.data.length === 0 && (
            <EmptyMessage>Not shared with anyone.</EmptyMessage>
          )}
          {sharesQuery.data && sharesQuery.data.length > 0 && (
            <ul className="divide-y rounded border">
              {sharesQuery.data.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                >
                  <span>
                    <span className="font-medium text-gray-900">{s.doctor.user.name}</span>
                    <span className="ml-2 text-xs text-gray-500">
                      since {formatDate(s.createdAt)}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setToRevoke(s)}
                    aria-label={`Stop sharing with ${s.doctor.user.name}`}
                    className="text-red-700 hover:underline"
                  >
                    Revoke
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-6 flex flex-col gap-4 border-t pt-4"
      >
        <h3 className="text-sm font-medium text-gray-900">Share with a doctor</h3>

        {doctorsQuery.isError && (
          <ErrorMessage
            message="Could not load the list of doctors."
            onRetry={() => doctorsQuery.refetch()}
          />
        )}

        <FormField id={`${formId}-doctor`} label="Doctor" error={errors.doctorId?.message}>
          {(field) => (
            <select
              {...field}
              {...register("doctorId")}
              disabled={!doctorsQuery.data}
              className={inputClassName}
            >
              <option value="">
                {doctorsQuery.isPending ? "Loading doctors..." : "Select doctor"}
              </option>
              {availableDoctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.user.name}
                </option>
              ))}
            </select>
          )}
        </FormField>

        <div>
          <label htmlFor={consentId} className="flex items-start gap-2 text-sm text-gray-900">
            <input
              id={consentId}
              type="checkbox"
              aria-invalid={errors.consentConfirmed ? "true" : undefined}
              aria-describedby={errors.consentConfirmed ? consentErrorId : undefined}
              {...register("consentConfirmed")}
              className="mt-0.5"
            />
            <span>
              The patient has agreed that this note may be shared with the selected doctor.
            </span>
          </label>
          {errors.consentConfirmed && (
            <p id={consentErrorId} role="alert" className="mt-1 text-sm text-red-600">
              {errors.consentConfirmed.message}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Prototype: consent is confirmed by the doctor, not recorded from the patient.
          </p>
        </div>

        {share.isError && (
          <p role="alert" className="text-sm text-red-600">
            {share.error.message}
          </p>
        )}
        {share.isSuccess && (
          <p role="status" className="text-sm text-green-700">
            Note shared.
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={share.isPending}
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {share.isPending ? "Sharing..." : "Share note"}
          </button>
        </div>
      </form>

      {toRevoke && (
        <ConfirmDialog
          title="Stop sharing"
          message={`${toRevoke.doctor.user.name} will no longer be able to read this note. The sharing history is kept.`}
          confirmLabel="Stop sharing"
          cancelLabel="Keep sharing"
          pendingLabel="Revoking..."
          isPending={revoke.isPending}
          error={revoke.isError ? revoke.error.message : null}
          onConfirm={confirmRevoke}
          onCancel={closeRevokeDialog}
        />
      )}
    </Card>
  );
}
