import { useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "../../components/FormField";
import { inputClassName } from "../../components/formStyles";
import { Modal } from "../../components/Modal";
import { correctionFormSchema, type CorrectionFormValues } from "../../schemas/appointmentSchemas";
import type { Appointment } from "../../types/appointment";
import { STATUS_LABELS, correctionTargets } from "../../utils/appointmentStatus";
import { useUpdateAppointmentStatus } from "./useAppointments";

interface CorrectStatusDialogProps {
  appointment: Appointment;
  onClose: () => void;
  onDone: () => void;
}

// Admin only: correct a final status. The reason is saved in the status history.
export function CorrectStatusDialog({ appointment, onClose, onDone }: CorrectStatusDialogProps) {
  const formId = useId();
  const updateStatus = useUpdateAppointmentStatus(appointment.id);
  const targets = correctionTargets(appointment.status, appointment.startTime);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CorrectionFormValues>({
    resolver: zodResolver(correctionFormSchema),
    defaultValues: { reason: "" },
  });

  function onSubmit(values: CorrectionFormValues) {
    updateStatus.mutate(values, { onSuccess: onDone });
  }

  return (
    <Modal title="Correct status" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <p className="text-sm text-gray-700">
          Current status: <span className="font-medium">{STATUS_LABELS[appointment.status]}</span>.
          The correction and its reason are saved in the appointment's history.
        </p>

        <FormField
          id={`${formId}-status`}
          label="New status"
          hint="Completed and no-show require that the appointment has started. A cancelled appointment can only be restored if the time is still free."
          error={errors.status?.message}
        >
          {(field) => (
            <select {...field} {...register("status")} className={inputClassName}>
              <option value="">Select status</option>
              {targets.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          )}
        </FormField>

        <FormField
          id={`${formId}-reason`}
          label="Reason"
          hint="For example: Marked as no-show by mistake, the patient attended."
          error={errors.reason?.message}
        >
          {(field) => (
            <textarea {...field} rows={3} {...register("reason")} className={inputClassName} />
          )}
        </FormField>

        {updateStatus.isError && (
          <p role="alert" className="text-sm text-red-600">
            {updateStatus.error.message}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={updateStatus.isPending}
            className="rounded border px-4 py-2 text-sm disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateStatus.isPending}
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {updateStatus.isPending ? "Saving..." : "Save correction"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
