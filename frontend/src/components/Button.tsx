import type { ButtonHTMLAttributes } from "react";
import { buttonClassName, type ButtonSize, type ButtonVariant } from "./buttonStyles";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Disables the button and shows pendingText while a request is running. */
  isPending?: boolean;
  pendingText?: string;
}

export function Button({
  variant = "primary",
  size = "md",
  isPending = false,
  pendingText = "Saving...",
  type = "button",
  disabled,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isPending}
      aria-busy={isPending || undefined}
      className={`${buttonClassName(variant, size)} ${className}`}
      {...rest}
    >
      {isPending ? pendingText : children}
    </button>
  );
}
