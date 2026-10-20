import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FormField } from "../../components/FormField";
import { inputClassName } from "../../components/formStyles";
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
import { OPENING_TIME, CLOSING_TIME } from "../../config/openingHours";

interface AppointmentFormProps {
  defaultDate: Date;
  /** Admin only: the doctor selected in the calendar. Doctors always book for themselves. */
  defaultDoctorId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AppointmentForm({
  defaultDate,
  defaultDoctorId,
  onSuccess,
  onCancel,
}: AppointmentFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const formId = useId();
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
    formState: { errors },
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      date: toDateString(defaultDate),
      doctorId: user?.role === "DOCTOR" ? (user.doctorId ?? "") : (defaultDoctorId ?? ""),
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
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <FormField id={`${formId}-patient`} label="Patient" error={errors.patientId?.message}>
        {(field) => (
          <select {...field} {...register("patientId")} className={inputClassName}>
            <option value="">Select patient</option>
            {patients?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.firstName} {p.lastName}
              </option>
            ))}
          </select>
        )}
      </FormField>

      {user?.role === "ADMIN" && (
        <FormField id={`${formId}-doctor`} label="Doctor" error={errors.doctorId?.message}>
          {(field) => (
            <select {...field} {...register("doctorId")} className={inputClassName}>
              <option value="">Select doctor</option>
              {doctors?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.user.name}
                </option>
              ))}
            </select>
          )}
        </FormField>
      )}

      <FormField
        id={`${formId}-type`}
        label="Appointment type"
        error={errors.appointmentTypeId?.message}
      >
        {(field) => (
          <select {...field} {...register("appointmentTypeId")} className={inputClassName}>
            <option value="">Select type</option>
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
        <p role="alert" className="text-sm text-red-600">
          {serverError}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm border rounded">
          Cancel
        </button>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {mutation.isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
