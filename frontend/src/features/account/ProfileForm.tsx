import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "../../components/FormField";
import { inputClassName } from "../../components/formStyles";
import { accountFormSchema, type AccountFormValues } from "../../schemas/accountSchemas";
import type { Account } from "../../types/account";
import { useAuth } from "../auth/useAuth";
import { useUpdateAccount } from "./useAccount";
import { FormError } from "../../components/Feedback";
import { Button } from "../../components/Button";

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
        <p className="mb-1 text-sm font-medium text-ink">Email</p>
        <p className="text-sm text-ink">{account.email}</p>
        <p className="mt-1 text-xs text-muted">
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

      <FormError message={update.isError ? update.error.message : null} />
      {saved && (
        <p role="status" className="text-sm text-success">
          Profile saved.
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" isPending={update.isPending}>
          Save profile
        </Button>
      </div>
    </form>
  );
}
