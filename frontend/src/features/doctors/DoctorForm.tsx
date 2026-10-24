import { useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "../../components/FormField";
import { inputClassName } from "../../components/formStyles";
import { ApiError } from "../../services/apiClient";
import {
  MIN_PASSWORD_LENGTH,
  editDoctorFormSchema,
  newDoctorFormSchema,
  type DoctorFormValues,
} from "../../schemas/doctorSchemas";
import type { Doctor } from "../../types/doctor";
import { useCreateDoctor, useUpdateDoctor } from "./useDoctors";

const EMAIL_TAKEN = "EMAIL_IN_USE";

interface DoctorFormProps {
  doctor: Doctor | null; // null = new doctor
  onSuccess: () => void;
  onCancel: () => void;
}

export function DoctorForm({ doctor, onSuccess, onCancel }: DoctorFormProps) {
  const formId = useId();
  const isNew = doctor === null;
  const create = useCreateDoctor();
  const update = useUpdateDoctor(doctor?.id ?? "");
  const save = isNew ? create : update;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<DoctorFormValues>({
    resolver: zodResolver(isNew ? newDoctorFormSchema : editDoctorFormSchema),
    defaultValues: {
      name: doctor?.user.name ?? "",
      email: doctor?.user.email ?? "",
      specialization: doctor?.specialization ?? "",
      password: "",
    },
  });

  function onError(error: Error) {
    // A taken email belongs to the email field, not to the whole form.
    if (error instanceof ApiError && error.code === EMAIL_TAKEN) {
      setError("email", { message: error.message });
    }
  }

  function onSubmit({ password, ...details }: DoctorFormValues) {
    if (isNew) {
      create.mutate({ ...details, password }, { onSuccess, onError });
    } else {
      update.mutate(details, { onSuccess, onError });
    }
  }

  const isEmailError = save.error instanceof ApiError && save.error.code === EMAIL_TAKEN;
  const formError = save.isError && !isEmailError ? save.error.message : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <FormField
        id={`${formId}-name`}
        label="Name"
        hint='For example "Dr. Anna Berg".'
        error={errors.name?.message}
      >
        {(field) => (
          <input {...field} autoComplete="off" {...register("name")} className={inputClassName} />
        )}
      </FormField>

      <FormField
        id={`${formId}-email`}
        label="Email"
        hint="Used to log in."
        error={errors.email?.message}
      >
        {(field) => (
          <input
            {...field}
            type="email"
            autoComplete="off"
            {...register("email")}
            className={inputClassName}
          />
        )}
      </FormField>

      <FormField
        id={`${formId}-specialization`}
        label="Specialization (optional)"
        error={errors.specialization?.message}
      >
        {(field) => (
          <input
            {...field}
            autoComplete="off"
            {...register("specialization")}
            className={inputClassName}
          />
        )}
      </FormField>

      {isNew && (
        <FormField
          id={`${formId}-password`}
          label="Start password"
          hint={`At least ${MIN_PASSWORD_LENGTH} characters. Give it to the doctor in person; they can change it on My account.`}
          error={errors.password?.message}
        >
          {(field) => (
            <input
              {...field}
              type="password"
              autoComplete="new-password"
              {...register("password")}
              className={inputClassName}
            />
          )}
        </FormField>
      )}

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
          {save.isPending ? "Saving..." : isNew ? "Create doctor" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
