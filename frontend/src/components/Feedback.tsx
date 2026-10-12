import type { ReactNode } from "react";

export function LoadingMessage({ children = "Loading..." }: { children?: ReactNode }) {
  return (
    <p role="status" className="text-sm text-gray-600">
      {children}
    </p>
  );
}

export function EmptyMessage({ children }: { children: ReactNode }) {
  return <p className="text-sm text-gray-600">{children}</p>;
}

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm">
      <p className="text-red-800">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 rounded bg-red-700 px-3 py-1.5 text-white hover:bg-red-800"
        >
          Try again
        </button>
      )}
    </div>
  );
}
