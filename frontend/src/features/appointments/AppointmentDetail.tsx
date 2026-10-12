import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { FormField } from "../../components/FormField";
import { inputClassName } from "../../components/formStyles";
import { StatusBadge } from "../../components/StatusBadge";
import { formatDate, formatTime, toDateString } from "../../utils/date";
import { useAuth } from "../auth/useAuth";
import { updateAppointment, cancelAppointment } from "./appointmentService";
import { getAppointmentTypes } from "../appointmentTypes/appointmentTypeService";
import { ApiError } from "../../services/apiClient";
import type { Appointment } from "../../types/appointment";

const editSchema = z.object({
  appointmentTypeId: z.string().min(1, "Appointment type is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
});
type EditValues = z.infer<typeof editSchema>;

interface AppointmentDetailProps {
  appointment: Appointment;
  onClose: () => void;
}

export function AppointmentDetail({ appointment, onClose }: AppointmentDetailProps) {
  const { user } = useAuth();
  const formId = useId();
  const [isEditing, setIsEditing] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: appointmentTypes } = useQuery({
    queryKey: ["appointmentTypes"],
    queryFn: getAppointmentTypes,
  });

  const start = new Date(appointment.startTime);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      appointmentTypeId: appointment.appointmentTypeId,
      date: toDateString(start),
      time: start.toTimeString().slice(0, 5),
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: EditValues) =>
      updateAppointment(appointment.id, {
        appointmentTypeId: values.appointmentTypeId,
        startTime: new Date(`${values.date}T${values.time}:00`).toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      onClose();
    },
    onError: (err) => {
      setServerError(err instanceof ApiError ? err.message : "Something went wrong.");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelAppointment(appointment.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      onClose();
    },
  });

  function onSubmit(values: EditValues) {
    setServerError(null);
    updateMutation.mutate(values);
  }

  function closeCancelConfirm() {
    setShowCancelConfirm(false);
    cancelMutation.reset(); // clear a previous error
  }

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <FormField
          id={`${formId}-type`}
          label="Appointment type"
          error={errors.appointmentTypeId?.message}
        >
          {(field) => (
            <select {...field} {...register("appointmentTypeId")} className={inputClassName}>
              {appointmentTypes?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.duration} min)
                </option>
              ))}
            </select>
          )}
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField id={`${formId}-date`} label="Date" error={errors.date?.message}>
            {(field) => (
              <input type="date" {...field} {...register("date")} className={inputClassName} />
            )}
          </FormField>
          <FormField id={`${formId}-time`} label="Time" error={errors.time?.message}>
            {(field) => (
              <input type="time" {...field} {...register("time")} className={inputClassName} />
            )}
          </FormField>
        </div>

        {serverError && (
          <p role="alert" className="text-sm text-red-600">
            {serverError}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 text-sm border rounded"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {updateMutation.isPending ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="font-medium">
          {appointment.patient.firstName} {appointment.patient.lastName}
        </p>
        <p className="text-sm text-gray-600">
          {formatTime(appointment.startTime)} – {appointment.appointmentType.name}
        </p>
        <div className="mt-2">
          <StatusBadge status={appointment.status} />
        </div>
      </div>

      {appointment.status !== "CANCELLED" && (
        <div className="flex items-center justify-end gap-2 pt-2 border-t">
          {user?.role === "DOCTOR" && (
            <Link
              to={`/documentation/${appointment.id}`}
              className="mr-auto px-4 py-2 text-sm border rounded"
            >
              Documentation
            </Link>
          )}
          <button
            type="button"
            onClick={() => setShowCancelConfirm(true)}
            className="px-4 py-2 text-sm border border-red-300 text-red-600 rounded"
          >
            Cancel appointment
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded"
          >
            Edit
          </button>
        </div>
      )}

      {showCancelConfirm && (
        <ConfirmDialog
          title="Cancel appointment"
          message={`Cancel the appointment with ${appointment.patient.firstName} ${appointment.patient.lastName} on ${formatDate(appointment.startTime)} at ${formatTime(appointment.startTime)}? The time will be free for other bookings.`}
          confirmLabel="Cancel appointment"
          cancelLabel="Keep appointment"
          pendingLabel="Cancelling..."
          isPending={cancelMutation.isPending}
          error={
            cancelMutation.isError
              ? cancelMutation.error instanceof ApiError
                ? cancelMutation.error.message
                : "Could not cancel the appointment."
              : null
          }
          onConfirm={() => cancelMutation.mutate()}
          onCancel={closeCancelConfirm}
        />
      )}
    </div>
  );
}
