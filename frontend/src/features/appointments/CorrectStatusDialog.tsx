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
import { FormError } from "../../components/Feedback";
import { FormActions } from "../../components/FormActions";

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
        <p className="text-sm text-ink">
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

        <FormError message={updateStatus.isError ? updateStatus.error.message : null} />
        <FormActions
          submitLabel="Save correction"
          isPending={updateStatus.isPending}
          onCancel={onClose}
        />
      </form>
    </Modal>
  );
}
