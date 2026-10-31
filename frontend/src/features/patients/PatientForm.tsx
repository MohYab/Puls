import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "../../components/FormField";
import { inputClassName } from "../../components/formStyles";
import { patientFormSchema, type PatientFormValues } from "../../schemas/patientSchemas";
import type { Patient } from "../../types/patient";
import { toDateString } from "../../utils/date";
import { useSavePatient } from "./usePatients";
import { ApiError } from "../../services/apiClient";
import { DuplicatePatientNotice } from "./DuplicatePatientNotice";

interface PatientFormProps {
  patient: Patient | null; // null = new patient
  onSuccess: (patient: Patient) => void;
  onCancel: () => void;
}

export function PatientForm({ patient, onSuccess, onCancel }: PatientFormProps) {
  const formId = useId();
  const save = useSavePatient(patient?.id);
  // What was sent, so the duplicate notice searches for that and not for later edits.
  const [submitted, setSubmitted] = useState<PatientFormValues | null>(null);
  const isDuplicate = save.error instanceof ApiError && save.error.code === "PATIENT_EXISTS";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      firstName: patient?.firstName ?? "",
      lastName: patient?.lastName ?? "",
      // Stored as UTC midnight, so the first ten characters are the date.
      dateOfBirth: patient?.dateOfBirth.slice(0, 10) ?? "",
      phone: patient?.phone ?? "",
      email: patient?.email ?? "",
    },
  });

  function onSubmit(values: PatientFormValues) {
    setSubmitted(values);
    save.mutate(values, { onSuccess });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id={`${formId}-first`} label="First name" error={errors.firstName?.message}>
          {(field) => (
            <input
              {...field}
              autoComplete="off"
              {...register("firstName")}
              className={inputClassName}
            />
          )}
        </FormField>
        <FormField id={`${formId}-last`} label="Last name" error={errors.lastName?.message}>
          {(field) => (
            <input
              {...field}
              autoComplete="off"
              {...register("lastName")}
              className={inputClassName}
            />
          )}
        </FormField>
      </div>
      <FormField id={`${formId}-dob`} label="Date of birth" error={errors.dateOfBirth?.message}>
        {(field) => (
          <input
            {...field}
            type="date"
            min="1900-01-01"
            max={toDateString(new Date())}
            {...register("dateOfBirth")}
            className={inputClassName}
          />
        )}
      </FormField>
      <FormField id={`${formId}-phone`} label="Phone (optional)" error={errors.phone?.message}>
        {(field) => (
          <input
            {...field}
            type="tel"
            autoComplete="off"
            {...register("phone")}
            className={inputClassName}
          />
        )}
      </FormField>
      <FormField id={`${formId}-email`} label="Email (optional)" error={errors.email?.message}>
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
      {/* A duplicate concerns the whole patient, not one field, so it is shown here. */}
      {isDuplicate && submitted && (
        <DuplicatePatientNotice
          firstName={submitted.firstName}
          lastName={submitted.lastName}
          dateOfBirth={submitted.dateOfBirth}
          excludeId={patient?.id}
          onOpen={onCancel}
        />
      )}{" "}
      {save.isError && !isDuplicate && (
        <p role="alert" className="text-sm text-red-600">
          {save.error.message}
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
          {save.isPending ? "Saving..." : patient ? "Save changes" : "Create patient"}
        </button>
      </div>
    </form>
  );
}
