import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "../components/Card";
import { ErrorMessage, LoadingMessage, FormError } from "../components/Feedback";
import { FormField } from "../components/FormField";
import { inputClassName } from "../components/formStyles";
import { useClinic, useUpdateClinic } from "../features/clinic/useClinic";
import { usePageTitle } from "../hooks/usePageTitle";
import { clinicFormSchema, type ClinicFormValues } from "../schemas/clinicSchemas";
import type { Clinic } from "../types/clinic";
import { Button } from "../components/Button";
import { PageHeader } from "../components/PageHeader";

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

      <FormField
        id={`${formId}-address`}
        label="Street address (optional)"
        error={errors.addressLine?.message}
      >
        {(field) => (
          <input
            {...field}
            autoComplete="street-address"
            {...register("addressLine")}
            className={inputClassName}
          />
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
            <input
              {...field}
              autoComplete="address-level2"
              {...register("city")}
              className={inputClassName}
            />
          )}
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id={`${formId}-phone`} label="Phone (optional)" error={errors.phone?.message}>
          {(field) => (
            <input {...field} type="tel" {...register("phone")} className={inputClassName} />
          )}
        </FormField>
        <FormField id={`${formId}-email`} label="Email (optional)" error={errors.email?.message}>
          {(field) => (
            <input {...field} type="email" {...register("email")} className={inputClassName} />
          )}
        </FormField>
      </div>

      <FormError message={update.isError ? update.error.message : null} />
      {saved && (
        <p role="status" className="text-sm text-success">
          Clinic details saved.
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" isPending={update.isPending}>
          Save
        </Button>
      </div>
    </form>
  );
}

export default function ClinicSettingsPage() {
  usePageTitle("Clinic settings");
  const { data: clinic, isPending, isError, error, refetch } = useClinic();

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Clinic settings"
        description="Shown in the menu and on the login page. These details are public."
      />

      <div>
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
