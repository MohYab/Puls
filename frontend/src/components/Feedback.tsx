import type { ReactNode } from "react";
import { Button } from "./Button";

export function LoadingMessage({ children = "Loading..." }: { children?: ReactNode }) {
  return (
    <p role="status" className="text-sm text-muted">
      {children}
    </p>
  );
}

export function EmptyMessage({ children }: { children: ReactNode }) {
  return <p className="text-sm text-muted">{children}</p>;
}

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

// role="alert": read out at once. An error must never look like an empty state (#25).
export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div role="alert" className="rounded-lg border border-danger/20 bg-danger-subtle p-3 text-sm">
      <p className="text-danger">{message}</p>
      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry} className="mt-2">
          Try again
        </Button>
      )}
    </div>
  );
}

// role="status": announced politely, without interrupting. For "saved" and similar.
export function SuccessMessage({ children }: { children: ReactNode }) {
  return (
    <p
      role="status"
      className="rounded-lg border border-success/20 bg-success-subtle p-3 text-sm text-success"
    >
      {children}
    </p>
  );
}
