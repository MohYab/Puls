import { Button } from "./Button";

interface StateMessageProps {
  title: string;
  text: string;
  onRetry?: () => void;
}

// A whole page that cannot be shown: not found, no access, could not load.
export function StateMessage({ title, text, onRetry }: StateMessageProps) {
  return (
    <div className="mt-6 rounded-lg border bg-surface p-5 shadow-card">
      <h1 className="font-display text-lg font-semibold text-ink">{title}</h1>
      <p className="mt-1 text-sm text-muted">{text}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} className="mt-3">
          Try again
        </Button>
      )}
    </div>
  );
}
