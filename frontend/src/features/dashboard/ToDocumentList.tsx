import { Link } from "react-router-dom";
import { Avatar } from "../../components/Avatar";
import { Badge } from "../../components/Badge";
import { Card } from "../../components/Card";
import { EmptyMessage, ErrorMessage, LoadingMessage } from "../../components/Feedback";
import type { AppointmentsToDocument } from "../appointments/appointmentService";
import { formatRelativeDay, formatTime } from "../../utils/date";

interface ToDocumentListProps {
  data: AppointmentsToDocument | undefined;
  now: Date;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

// Oldest first: the longest-waiting visit is the most urgent.
export function ToDocumentList({ data, now, isLoading, isError, onRetry }: ToDocumentListProps) {
  return (
    <Card
      title="To document"
      // Neutral, not amber: colour only means booking status (design-direction.md, 1).
      badge={
        data &&
        data.total > 0 && (
          <Badge>
            {data.total}
            <span className="sr-only"> waiting</span>
          </Badge>
        )
      }
    >
      <p className="-mt-2 mb-3 text-sm text-muted">Completed visits without a note</p>

      {isLoading && <LoadingMessage />}
      {isError && <ErrorMessage message="Could not load visits to document." onRetry={onRetry} />}
      {data && data.total === 0 && (
        <EmptyMessage>All completed visits are documented.</EmptyMessage>
      )}

      {data && data.appointments.length > 0 && (
        <>
          <ul className="flex flex-col gap-2">
            {data.appointments.map((appointment) => {
              const name = `${appointment.patient.firstName} ${appointment.patient.lastName}`;
              return (
                <li key={appointment.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <Avatar name={name} size="sm" />
                  <span className="min-w-0 flex-1 leading-snug">
                    <span className="block truncate font-semibold text-ink">{name}</span>
                    <span className="block truncate text-sm tabular-nums text-muted">
                      {formatRelativeDay(appointment.startTime, now)}{" "}
                      {formatTime(appointment.startTime)} · {appointment.appointmentType.name}
                    </span>
                  </span>
                  <Link
                    to={`/documentation/${appointment.id}`}
                    className="shrink-0 font-semibold text-accent hover:underline"
                  >
                    Document
                    <span className="sr-only">, {name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          {data.total > data.appointments.length && (
            <p className="mt-3 text-sm text-muted">
              Showing the oldest {data.appointments.length} of {data.total}.
            </p>
          )}
        </>
      )}
    </Card>
  );
}
