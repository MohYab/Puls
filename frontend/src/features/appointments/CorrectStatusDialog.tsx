import { useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "../../components/FormField";
import { inputClassName } from "../../components/formStyles";
import { Modal } from "../../components/Modal";
import { correctionFormSchema, type CorrectionFormValues } from "../../schemas/appointmentSchemas";
import type { Appointment, AppointmentStatus } from "../../types/appointment";
import { STATUS_LABELS, isCorrection, statusTargets } from "../../utils/appointmentStatus";
import { useUpdateAppointmentStatus } from "./useAppointments";
import { FormError } from "../../components/Feedback";
import { FormActions } from "../../components/FormActions";

interface CorrectStatusDialogProps {
  appointment: Appointment;
  /** The status chosen in the status menu, already selected. */
  defaultStatus?: AppointmentStatus;
  onClose: () => void;
  onDone: () => void;
}

// Correct a final status: doctors and admins.
// The reason is saved in the status history.
export function CorrectStatusDialog({
  appointment,
  defaultStatus,
  onClose,
  onDone,
}: CorrectStatusDialogProps) {
  const formId = useId();
  const updateStatus = useUpdateAppointmentStatus(appointment.id);
  // Only real corrections (not no-show → completed), with the same safeguards as the API.
  const targets = statusTargets(appointment).filter((to) => isCorrection(appointment.status, to));

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CorrectionFormValues>({
    resolver: zodResolver(correctionFormSchema),
    defaultValues: { status: defaultStatus, reason: "" },
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
