import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "../../components/FormField";
import { inputClassName } from "../../components/formStyles";
import { MIN_PASSWORD_LENGTH } from "../../schemas/doctorSchemas";
import { passwordFormSchema, type PasswordFormValues } from "../../schemas/accountSchemas";
import { ApiError } from "../../services/apiClient";
import { useChangePassword } from "./useAccount";
import { FormError } from "../../components/Feedback";
import { Button } from "../../components/Button";

export function PasswordForm() {
  const formId = useId();
  const change = useChangePassword();
  const [changed, setChanged] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  function onSubmit({ currentPassword, newPassword }: PasswordFormValues) {
    setChanged(false);
    change.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          reset();
          setChanged(true);
        },
        onError: (error) => {
          if (error instanceof ApiError && error.code === "INVALID_CURRENT_PASSWORD") {
            setError("currentPassword", { message: error.message });
          }
        },
      }
    );
  }

  const isCurrentPasswordError =
    change.error instanceof ApiError && change.error.code === "INVALID_CURRENT_PASSWORD";

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <FormField
        id={`${formId}-current`}
        label="Current password"
        error={errors.currentPassword?.message}
      >
        {(field) => (
          <input
            {...field}
            type="password"
            autoComplete="current-password"
            {...register("currentPassword")}
            className={inputClassName}
          />
        )}
      </FormField>

      <FormField
        id={`${formId}-new`}
        label="New password"
        hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
        error={errors.newPassword?.message}
      >
        {(field) => (
          <input
            {...field}
            type="password"
            autoComplete="new-password"
            {...register("newPassword")}
            className={inputClassName}
          />
        )}
      </FormField>

      <FormField
        id={`${formId}-confirm`}
        label="Repeat new password"
        error={errors.confirmPassword?.message}
      >
        {(field) => (
          <input
            {...field}
            type="password"
            autoComplete="new-password"
            {...register("confirmPassword")}
            className={inputClassName}
          />
        )}
      </FormField>

      <FormError
        message={change.isError && !isCurrentPasswordError ? change.error.message : null}
      />
      {changed && (
        <p role="status" className="text-sm text-success">
          Password changed.
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" isPending={change.isPending}>
          Change password
        </Button>
      </div>
    </form>
  );
}
