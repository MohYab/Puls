import { Card } from "../../components/Card";
import { ErrorMessage, LoadingMessage } from "../../components/Feedback";
import type { AppointmentStatus } from "../../types/appointment";
import { ALL_STATUSES, STATUS_LABELS } from "../../utils/appointmentStatus";
import type { StatusCounts } from "./dashboardData";

// The same status colours as the badges (design-direction.md, decision 1).
const tileColors: Record<AppointmentStatus, string> = {
  SCHEDULED: "bg-scheduled-bg text-scheduled",
  CONFIRMED: "bg-confirmed-bg text-confirmed",
  COMPLETED: "bg-completed-bg text-completed",
  NO_SHOW: "bg-no-show-bg text-no-show",
  CANCELLED: "bg-cancelled-bg text-cancelled",
};

const layouts = {
  /** Five in a row on wide screens (admin dashboard). */
  row: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
  /** Two columns (the doctor's narrow side column). */
  grid: "grid-cols-2",
} as const;

interface StatusSummaryProps {
  title?: string;
  layout?: keyof typeof layouts;
  counts: StatusCounts | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

// A description list: screen readers read each status with its number ("Scheduled, 2").
export function StatusSummary({
  title = "Today by status",
  layout = "row",
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
        <dl className={`grid gap-3 ${layouts[layout]}`}>
          {ALL_STATUSES.map((status) => (
            // flex-col-reverse: the label comes first for screen readers, the number on top visually.
            <div
              key={status}
              className={`flex flex-col-reverse rounded-lg px-3 py-2.5 ${tileColors[status]}`}
            >
              <dt className="text-sm font-semibold">{STATUS_LABELS[status]}</dt>
              <dd className="font-display text-2xl font-bold tabular-nums">{counts[status]}</dd>
            </div>
          ))}
        </dl>
      )}
    </Card>
  );
}