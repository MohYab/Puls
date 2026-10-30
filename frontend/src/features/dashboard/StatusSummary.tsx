import { Card } from "../../components/Card";
import { ErrorMessage, LoadingMessage } from "../../components/Feedback";
import { StatusBadge } from "../../components/StatusBadge";
import { ALL_STATUSES } from "../../utils/appointmentStatus";
import type { StatusCounts } from "./dashboardData";

interface StatusSummaryProps {
  title?: string;
  counts: StatusCounts | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

// Used by both dashboards. A description list, so screen readers read
// each status with its number ("Completed, 2").
export function StatusSummary({
  title = "Today by status",
  counts,
  isLoading,
  isError,
  onRetry,
}: StatusSummaryProps) {
  return (
    <Card title={title}>
      {isLoading && <LoadingMessage />}

      {isError && (
        <ErrorMessage message="Could not load today's appointments." onRetry={onRetry} />
      )}

      {counts && !isLoading && !isError && (
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {ALL_STATUSES.map((status) => (
            <div key={status} className="flex flex-col items-start gap-2 rounded-lg border p-3">
              <dt>
                <StatusBadge status={status} />
              </dt>
              <dd
                className={`text-2xl font-semibold tabular-nums ${
                  status === "CANCELLED" ? "text-muted" : "text-ink"
                }`}
              >
                {counts[status]}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </Card>
  );
}