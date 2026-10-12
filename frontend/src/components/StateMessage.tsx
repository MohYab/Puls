interface StateMessageProps {
  title: string;
  text: string;
  onRetry?: () => void;
}

export function StateMessage({ title, text, onRetry }: StateMessageProps) {
  return (
    <div className="mt-6 rounded-md border border-gray-200 bg-white p-4">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      <p className="mt-1 text-sm text-gray-600">{text}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-3 rounded border px-3 py-1.5 text-sm">
          Try again
        </button>
      )}
    </div>
  );
}
