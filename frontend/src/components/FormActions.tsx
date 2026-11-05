import { Button } from "./Button";

interface FormActionsProps {
  submitLabel: string;
  pendingLabel?: string;
  isPending: boolean;
  onCancel: () => void;
  cancelLabel?: string;
  /** Destructive actions (e.g. deactivate) get the danger colour. */
  variant?: "primary" | "danger";
  /** For a dialog without a <form>: the button runs this instead of submitting. */
  onConfirm?: () => void;
}

// The same Cancel + Save row in every form and dialog.
export function FormActions({
  submitLabel,
  pendingLabel = "Saving...",
  isPending,
  onCancel,
  cancelLabel = "Cancel",
  variant = "primary",
  onConfirm,
}: FormActionsProps) {
  return (
    <div className="flex flex-wrap justify-end gap-2 pt-2">
      <Button variant="secondary" onClick={onCancel} disabled={isPending}>
        {cancelLabel}
      </Button>
      <Button
        type={onConfirm ? "button" : "submit"}
        variant={variant}
        onClick={onConfirm}
        isPending={isPending}
        pendingText={pendingLabel}
      >
        {submitLabel}
      </Button>
    </div>
  );
}
