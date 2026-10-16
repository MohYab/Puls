import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "../../components/FormField";
import { inputClassName } from "../../components/formStyles";
import { ApiError } from "../../services/apiClient";
import {
  appointmentTypeFormSchema,
  DURATION_STEP,
  MAX_DURATION,
  MIN_DURATION,
  type AppointmentTypeFormValues,
} from "../../schemas/appointmentTypeSchemas";
import type { AppointmentType } from "../../types/appointmentType";
import { useSaveAppointmentType } from "./useAppointmentTypes";

const NAME_TAKEN = "APPOINTMENT_TYPE_EXISTS";
const DEFAULT_DURATION = 30;

interface AppointmentTypeFormProps {
  appointmentType: AppointmentType | null; // null = create a new type
  onSuccess: () => void;
  onCancel: () => void;
}

export function AppointmentTypeForm({
  appointmentType,
  onSuccess,
  onCancel,
}: AppointmentTypeFormProps) {
  const save = useSaveAppointmentType(appointmentType?.id);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<AppointmentTypeFormValues>({
    resolver: zodResolver(appointmentTypeFormSchema),
    defaultValues: {
      name: appointmentType?.name ?? "",
      duration: appointmentType?.duration ?? DEFAULT_DURATION,
      description: appointmentType?.description ?? "",
    },
  });

  function onSubmit(values: AppointmentTypeFormValues) {
    save.mutate(values, {
      onSuccess,
      onError: (error) => {
        // A duplicate name belongs to the name field, not to the whole form.
        if (error instanceof ApiError && error.code === NAME_TAKEN) {
          setError("name", { message: error.message });
        }
      },
    });
  }

  const isNameError = save.error instanceof ApiError && save.error.code === NAME_TAKEN;
  const formError = save.isError && !isNameError ? save.error.message : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <FormField id="type-name" label="Name" error={errors.name?.message}>
        {(field) => (
          <input {...field} type="text" {...register("name")} className={inputClassName} />
        )}
      </FormField>

      <FormField
        id="type-duration"
        label="Duration (minutes)"
        hint={
          appointmentType
            ? "Existing appointments keep their booked length."
            : `${MIN_DURATION}–${MAX_DURATION} minutes, in steps of ${DURATION_STEP}.`
        }
        error={errors.duration?.message}
      >
        {(field) => (
          <input
            {...field}
            type="number"
            inputMode="numeric"
            min={MIN_DURATION}
            max={MAX_DURATION}
            step={DURATION_STEP}
            {...register("duration", { valueAsNumber: true })}
            className={inputClassName}
          />
        )}
      </FormField>

      <FormField
        id="type-description"
        label="Description (optional)"
        error={errors.description?.message}
      >
        {(field) => (
          <textarea {...field} rows={3} {...register("description")} className={inputClassName} />
        )}
      </FormField>

      {formError && (
        <p role="alert" className="text-sm text-red-600">
          {formError}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={save.isPending}
          className="rounded border px-4 py-2 text-sm disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={save.isPending}
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {save.isPending ? "Saving..." : appointmentType ? "Save changes" : "Create type"}
        </button>
      </div>
    </form>
  );
}
