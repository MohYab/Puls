import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { Button } from "../../components/Button";
import { buttonClassName } from "../../components/buttonStyles";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "../../components/FormField";
import { inputClassName } from "../../components/formStyles";
import { StatusBadge } from "../../components/StatusBadge";
import { ApiError } from "../../services/apiClient";
import type { Appointment } from "../../types/appointment";
import { STATUS_PHRASES, isFinalStatus } from "../../utils/appointmentStatus";
import { formatDuration, formatTimeRange, formatWeekdayDate, toDateString } from "../../utils/date";
import { useAppointmentTypes } from "../appointmentTypes/useAppointmentTypes";
import { useAuth } from "../auth/useAuth";
import { AppointmentStatusActions } from "./AppointmentStatusActions";
import { CorrectStatusDialog } from "./CorrectStatusDialog";
import { updateAppointment } from "./appointmentService";
import { appointmentTimeSchema } from "../../schemas/appointmentSchemas";
import { CLOSING_TIME, OPENING_TIME } from "../../config/openingHours";

const editSchema = z.object({
  appointmentTypeId: z.string().min(1, "Appointment type is required"),
  date: z.string().min(1, "Date is required"),
  time: appointmentTimeSchema,
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
  const [showCorrection, setShowCorrection] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const isDoctor = user?.role === "DOCTOR";
  const isAdmin = user?.role === "ADMIN";
  const isLocked = isFinalStatus(appointment.status);
  // Unchanged rule: everything except cancelled appointments can be documented.
  const canDocument = isDoctor && appointment.status !== "CANCELLED";

  const { data: appointmentTypes } = useAppointmentTypes();

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

  function onSubmit(values: EditValues) {
    setServerError(null);
    updateMutation.mutate(values);
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
              {/* The booked type may have been deactivated; keep it selectable for this appointment. */}
              {appointmentTypes &&
                !appointmentTypes.some((t) => t.id === appointment.appointmentTypeId) && (
                  <option value={appointment.appointmentTypeId}>
                    {appointment.appointmentType.name} (inactive)
                  </option>
                )}
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
              <input
                type="time"
                min={OPENING_TIME}
                max={CLOSING_TIME}
                step={300}
                {...field}
                {...register("time")}
                className={inputClassName}
              />
            )}
          </FormField>
        </div>

        {serverError && (
          <p role="alert" className="text-sm text-danger">
            {serverError}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={() => setIsEditing(false)}>
            Back
          </Button>
          <Button type="submit" isPending={updateMutation.isPending} pendingText="Saving...">
            Save changes
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            to={`/patients/${appointment.patientId}`}
            className="font-display text-lg font-semibold text-ink hover:underline"
          >
            {appointment.patient.firstName} {appointment.patient.lastName}
          </Link>
          <p className="mt-0.5 text-sm text-muted">{appointment.appointmentType.name}</p>
        </div>
        <StatusBadge status={appointment.status} />
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        <dt className="text-muted">Date</dt>
        <dd>{formatWeekdayDate(appointment.startTime)}</dd>
        <dt className="text-muted">Time</dt>
        <dd className="tabular-nums">
          {formatTimeRange(appointment.startTime, appointment.endTime)}
        </dd>
        <dt className="text-muted">Length</dt>
        {/* The booked length (end − start), not the type's current duration. */}
        <dd>{formatDuration(appointment.startTime, appointment.endTime)}</dd>
        <dt className="text-muted">Doctor</dt>
        <dd>{appointment.doctor.user.name}</dd>
        {appointment.bookingComment && (
          <>
            <dt className="text-muted">Comment</dt>
            <dd className="whitespace-pre-line">{appointment.bookingComment}</dd>
          </>
        )}
        {/* Only doctors get the flag (decision #56). */}
        {appointment.hasNote !== undefined && (
          <>
            <dt className="text-muted">Documentation</dt>
            <dd>{appointment.hasNote ? "Documented" : "Not documented"}</dd>
          </>
        )}
      </dl>

      <div className="flex flex-col gap-3 border-t pt-4">
        {isLocked ? (
          <p className="text-sm text-muted">
            This appointment is {STATUS_PHRASES[appointment.status]} and can no longer be changed.
            {isDoctor && " Contact an administrator to correct it."}
          </p>
        ) : (
          <AppointmentStatusActions appointment={appointment} onDone={onClose} />
        )}

        <div className="flex flex-wrap items-center gap-2">
          {canDocument && (
            <Link
              to={`/documentation/${appointment.id}`}
              className={buttonClassName(appointment.hasNote ? "secondary" : "accent", "md")}
            >
              <FileText aria-hidden="true" className="size-4" />
              {appointment.hasNote ? "Open documentation" : "Document visit"}
            </Link>
          )}
          <div className="ms-auto flex gap-2">
            {isLocked && isAdmin && (
              <Button variant="secondary" onClick={() => setShowCorrection(true)}>
                Correct status
              </Button>
            )}
            {!isLocked && (
              <Button variant="secondary" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            )}
          </div>
        </div>
      </div>

      {showCorrection && (
        <CorrectStatusDialog
          appointment={appointment}
          onClose={() => setShowCorrection(false)}
          onDone={onClose}
        />
      )}
    </div>
  );
}
