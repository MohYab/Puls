import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "../../components/FormField";
import { inputClassName } from "../../components/formStyles";
import { accountFormSchema, type AccountFormValues } from "../../schemas/accountSchemas";
import type { Account } from "../../types/account";
import { useAuth } from "../auth/useAuth";
import { useUpdateAccount } from "./useAccount";

export function ProfileForm({ account }: { account: Account }) {
  const formId = useId();
  const { updateUser } = useAuth();
  const update = useUpdateAccount();
  const [saved, setSaved] = useState(false);
  const isDoctor = account.role === "DOCTOR";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: account.name,
      phone: account.phone ?? "",
      specialization: account.specialization ?? "",
    },
  });

  function onSubmit(values: AccountFormValues) {
    setSaved(false);
    update.mutate(values, {
      onSuccess: (updated) => {
        updateUser({ name: updated.name });
        setSaved(true);
      },
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <FormField id={`${formId}-name`} label="Name" error={errors.name?.message}>
        {(field) => (
          <input {...field} autoComplete="name" {...register("name")} className={inputClassName} />
        )}
      </FormField>

      <div>
        <p className="mb-1 text-sm font-medium">Email</p>
        <p className="text-sm text-gray-900">{account.email}</p>
        <p className="mt-1 text-xs text-gray-500">
          Your email is used to log in. Contact an administrator to change it.
        </p>
      </div>

      <FormField id={`${formId}-phone`} label="Work phone (optional)" error={errors.phone?.message}>
        {(field) => (
          <input
            {...field}
            type="tel"
            autoComplete="tel"
            {...register("phone")}
            className={inputClassName}
          />
        )}
      </FormField>

      {isDoctor && (
        <FormField
          id={`${formId}-specialization`}
          label="Specialization (optional)"
          error={errors.specialization?.message}
        >
          {(field) => (
            <input {...field} {...register("specialization")} className={inputClassName} />
          )}
        </FormField>
      )}

      {update.isError && (
        <p role="alert" className="text-sm text-red-600">
          {update.error.message}
        </p>
      )}
      {saved && (
        <p role="status" className="text-sm text-green-700">
          Profile saved.
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={update.isPending}
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {update.isPending ? "Saving..." : "Save profile"}
        </button>
      </div>
    </form>
  );
}
