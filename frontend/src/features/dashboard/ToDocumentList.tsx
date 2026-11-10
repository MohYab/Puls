import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar } from "../../components/Avatar";
import { Badge } from "../../components/Badge";
import { Card } from "../../components/Card";
import { EmptyMessage, ErrorMessage, LoadingMessage } from "../../components/Feedback";
import type { AppointmentsToDocument } from "../appointments/appointmentService";
import { formatRelativeDay, formatTime } from "../../utils/date";

// The dashboard is an overview: show a few visits and let the user expand the rest.
const COLLAPSED_COUNT = 5;

interface ToDocumentListProps {
  data: AppointmentsToDocument | undefined;
  now: Date;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

// Oldest first: the longest-waiting visit is the most urgent.
export function ToDocumentList({ data, now, isLoading, isError, onRetry }: ToDocumentListProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const listId = useId();

  const appointments = data?.appointments ?? [];
  // Counts loaded visits, not data.total: the API returns at most a limited number.
  const hiddenCount = appointments.length - COLLAPSED_COUNT;
  const canCollapse = hiddenCount > 0;
  const visibleAppointments =
    isExpanded || !canCollapse ? appointments : appointments.slice(0, COLLAPSED_COUNT);
  const showsAllLoaded = visibleAppointments.length === appointments.length;

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

      {data && appointments.length > 0 && (
        <>
          <ul id={listId} className="flex flex-col gap-2">
            {visibleAppointments.map((appointment) => {
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

          {canCollapse && (
            <button
              type="button"
              aria-expanded={isExpanded}
              aria-controls={listId}
              onClick={() => setIsExpanded((expanded) => !expanded)}
              className="mt-3 inline-flex items-center gap-1 font-semibold text-accent hover:underline"
            >
              {isExpanded ? "Show less" : `Show more`}
              <ChevronDown
                aria-hidden="true"
                className={`size-4 transition-transform motion-reduce:transition-none ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </button>
          )}

          {showsAllLoaded && data.total > appointments.length && (
            <p className="mt-3 text-sm text-muted">
              Showing the oldest {appointments.length} of {data.total}.
            </p>
          )}
        </>
      )}
    </Card>
  );
}
