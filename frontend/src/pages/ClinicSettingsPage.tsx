import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "../components/Card";
import { ErrorMessage, LoadingMessage } from "../components/Feedback";
import { FormField } from "../components/FormField";
import { inputClassName } from "../components/formStyles";
import { useClinic, useUpdateClinic } from "../features/clinic/useClinic";
import { usePageTitle } from "../hooks/usePageTitle";
import { clinicFormSchema, type ClinicFormValues } from "../schemas/clinicSchemas";
import type { Clinic } from "../types/clinic";

function ClinicForm({ clinic }: { clinic: Clinic }) {
  const formId = useId();
  const update = useUpdateClinic();
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClinicFormValues>({
    resolver: zodResolver(clinicFormSchema),
    defaultValues: {
      name: clinic.name,
      addressLine: clinic.addressLine ?? "",
      postalCode: clinic.postalCode ?? "",
      city: clinic.city ?? "",
      phone: clinic.phone ?? "",
      email: clinic.email ?? "",
    },
  });

  function onSubmit(values: ClinicFormValues) {
    setSaved(false);
    update.mutate(values, { onSuccess: () => setSaved(true) });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <FormField id={`${formId}-name`} label="Clinic name" error={errors.name?.message}>
        {(field) => <input {...field} {...register("name")} className={inputClassName} />}
      </FormField>

      <FormField id={`${formId}-address`} label="Street address (optional)" error={errors.addressLine?.message}>
        {(field) => (
          <input {...field} autoComplete="street-address" {...register("addressLine")} className={inputClassName} />
        )}
      </FormField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[10rem_1fr]">
        <FormField id={`${formId}-postal`} label="Postal code" error={errors.postalCode?.message}>
          {(field) => (
            <input
              {...field}
              inputMode="numeric"
              autoComplete="postal-code"
              {...register("postalCode")}
              className={inputClassName}
            />
          )}
        </FormField>
        <FormField id={`${formId}-city`} label="City" error={errors.city?.message}>
          {(field) => (
            <input {...field} autoComplete="address-level2" {...register("city")} className={inputClassName} />
          )}
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id={`${formId}-phone`} label="Phone (optional)" error={errors.phone?.message}>
          {(field) => <input {...field} type="tel" {...register("phone")} className={inputClassName} />}
        </FormField>
        <FormField id={`${formId}-email`} label="Email (optional)" error={errors.email?.message}>
          {(field) => <input {...field} type="email" {...register("email")} className={inputClassName} />}
        </FormField>
      </div>

      {update.isError && (
        <p role="alert" className="text-sm text-red-600">
          {update.error.message}
        </p>
      )}
      {saved && (
        <p role="status" className="text-sm text-green-700">
          Clinic details saved.
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={update.isPending}
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {update.isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}

export default function ClinicSettingsPage() {
  usePageTitle("Clinic settings");
  const { data: clinic, isPending, isError, error, refetch } = useClinic();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-900">Clinic settings</h1>
      <p className="mt-1 text-sm text-gray-600">
        Shown in the menu and on the login page. These details are public.
      </p>

      <div className="mt-6">
        {isPending && <LoadingMessage>Loading clinic details...</LoadingMessage>}
        {isError && <ErrorMessage message={error.message} onRetry={() => refetch()} />}
        {clinic && (
          <Card title="Clinic">
            <ClinicForm clinic={clinic} />
          </Card>
        )}
      </div>
    </div>
  );
}