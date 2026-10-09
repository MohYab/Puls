import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { StatusBadge } from "../../components/StatusBadge";
import { formatTime, toDateString } from "../../utils/date";
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
  const [isEditing, setIsEditing] = useState(false);
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
    formState: { errors, isSubmitting },
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

  function handleCancelAppointment() {
    if (confirm("Cancel this appointment?")) {
      cancelMutation.mutate();
    }
  }

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Appointment type</label>
          <select {...register("appointmentTypeId")} className="w-full border rounded px-3 py-2">
            {appointmentTypes?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.duration} min)
              </option>
            ))}
          </select>
          {errors.appointmentTypeId && (
            <p className="text-sm text-red-600 mt-1">{errors.appointmentTypeId.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input type="date" {...register("date")} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Time</label>
            <input type="time" {...register("time")} className="w-full border rounded px-3 py-2" />
          </div>
        </div>

        {serverError && <p className="text-sm text-red-600">{serverError}</p>}

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
            disabled={isSubmitting}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save changes"}
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
        <div className="flex justify-end gap-2 pt-2 border-t">
          <button
            onClick={handleCancelAppointment}
            disabled={cancelMutation.isPending}
            className="px-4 py-2 text-sm border border-red-300 text-red-600 rounded disabled:opacity-50"
          >
            {cancelMutation.isPending ? "Cancelling..." : "Cancel appointment"}
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded"
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
}
