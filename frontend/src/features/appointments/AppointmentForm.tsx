import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  appointmentFormSchema,
  type AppointmentFormValues,
} from "../../schemas/appointmentSchemas";
import { getPatients } from "../patients/patientService";
import { getDoctors } from "../doctors/doctorService";
import { getAppointmentTypes } from "../appointmentTypes/appointmentTypeService";
import { createAppointment } from "./appointmentService";
import { useAuth } from "../auth/useAuth";
import { ApiError } from "../../services/apiClient";
import { toDateString } from "../../utils/date";

interface AppointmentFormProps {
  defaultDate: Date;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AppointmentForm({ defaultDate, onSuccess, onCancel }: AppointmentFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const { data: patients } = useQuery({ queryKey: ["patients"], queryFn: () => getPatients() });
  const { data: doctors } = useQuery({ queryKey: ["doctors"], queryFn: getDoctors });
  const { data: appointmentTypes } = useQuery({
    queryKey: ["appointmentTypes"],
    queryFn: getAppointmentTypes,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      date: toDateString(defaultDate),
      doctorId: user?.role === "DOCTOR" ? (user.doctorId ?? "") : "",
    },
  });

  const mutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      onSuccess();
    },
    onError: (err) => {
      setServerError(err instanceof ApiError ? err.message : "Something went wrong.");
    },
  });

  function onSubmit(values: AppointmentFormValues) {
    setServerError(null);
    const startTime = new Date(`${values.date}T${values.time}:00`).toISOString();
    mutation.mutate({
      patientId: values.patientId,
      doctorId: values.doctorId,
      appointmentTypeId: values.appointmentTypeId,
      startTime,
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">Patient</label>
        <select {...register("patientId")} className="w-full border rounded px-3 py-2">
          <option value="">Select patient</option>
          {patients?.map((p) => (
            <option key={p.id} value={p.id}>
              {p.firstName} {p.lastName}
            </option>
          ))}
        </select>
        {errors.patientId && (
          <p className="text-sm text-red-600 mt-1">{errors.patientId.message}</p>
        )}
      </div>

      {user?.role === "ADMIN" && (
        <div>
          <label className="block text-sm font-medium mb-1">Doctor</label>
          <select {...register("doctorId")} className="w-full border rounded px-3 py-2">
            <option value="">Select doctor</option>
            {doctors?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.user.name}
              </option>
            ))}
          </select>
          {errors.doctorId && (
            <p className="text-sm text-red-600 mt-1">{errors.doctorId.message}</p>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Appointment type</label>
        <select {...register("appointmentTypeId")} className="w-full border rounded px-3 py-2">
          <option value="">Select type</option>
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
          {errors.date && <p className="text-sm text-red-600 mt-1">{errors.date.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Time</label>
          <input type="time" {...register("time")} className="w-full border rounded px-3 py-2" />
          {errors.time && <p className="text-sm text-red-600 mt-1">{errors.time.message}</p>}
        </div>
      </div>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm border rounded">
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
