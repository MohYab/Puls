import { Link } from "react-router-dom";
import { Card } from "../../components/Card";
import { EmptyMessage, ErrorMessage, LoadingMessage } from "../../components/Feedback";
import { StatusBadge } from "../../components/StatusBadge";
import type { Appointment } from "../../types/appointment";
import { formatTimeRange } from "../../utils/date";

interface TodayScheduleProps {
  appointments: Appointment[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function TodaySchedule({ appointments, isLoading, isError, onRetry }: TodayScheduleProps) {
  const isReady = !isLoading && !isError;
  return (
    <Card
      title="Today's schedule"
      actions={
        <Link to="/calendar" className="text-sm font-medium text-accent hover:underline">
          Open calendar
        </Link>
      }
    >
      {isLoading && <LoadingMessage />}

      {isError && <ErrorMessage message="Could not load today's schedule." onRetry={onRetry} />}

      {isReady && appointments.length === 0 && <EmptyMessage>No appointments today.</EmptyMessage>}

      {isReady && appointments.length > 0 && (
        <ul className="divide-y">
          {appointments.map((appointment) => (
            <ScheduleRow key={appointment.id} appointment={appointment} />
          ))}
        </ul>
      )}
    </Card>
  );
}

function ScheduleRow({ appointment }: { appointment: Appointment }) {
  const name = `${appointment.patient.firstName} ${appointment.patient.lastName}`;
  const isCancelled = appointment.status === "CANCELLED";

  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 text-sm">
      <span className="w-24 shrink-0 tabular-nums text-muted">
        {formatTimeRange(appointment.startTime, appointment.endTime)}
      </span>
      <span className="min-w-0 flex-1">
        <Link
          to={`/patients/${appointment.patientId}`}
          className={`font-medium hover:underline ${isCancelled ? "text-muted line-through" : "text-ink"}`}
        >
          {name}
        </Link>
        <span className="block truncate text-muted">{appointment.appointmentType.name}</span>
      </span>
      <StatusBadge status={appointment.status} />
      {appointment.status === "COMPLETED" && (
        <Link
          to={`/documentation/${appointment.id}`}
          className="font-medium text-accent hover:underline"
        >
          {appointment.hasNote ? "Open documentation" : "Document visit"}
          {/* Several rows have the same link text: the name makes each one clear. */}
          <span className="sr-only">, {name}</span>
        </Link>
      )}
    </li>
  );
}