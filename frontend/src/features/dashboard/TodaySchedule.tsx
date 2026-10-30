import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Avatar } from "../../components/Avatar";
import { Badge } from "../../components/Badge";
import { Card } from "../../components/Card";
import { EmptyMessage, ErrorMessage, LoadingMessage } from "../../components/Feedback";
import { StatusBadge } from "../../components/StatusBadge";
import type { Appointment } from "../../types/appointment";
import { formatDuration, formatTime } from "../../utils/date";
import { birthDateAndAge } from "./dashboardData";

interface TodayScheduleProps {
  appointments: Appointment[];
  nextId: string | null;
  now: Date;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function TodaySchedule({ appointments, nextId, now, isLoading, isError, onRetry }: TodayScheduleProps) {
  const isReady = !isLoading && !isError;

  return (
    <Card
      title="Today's schedule"
      badge={
        isReady && (
          <Badge>
            {appointments.length}
            <span className="sr-only"> appointments</span>
          </Badge>
        )
      }
      actions={
        <Link
          to="/calendar"
          className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
        >
          Open calendar
          <ArrowRight aria-hidden="true" className="size-4 rtl:rotate-180" />
        </Link>
      }
    >
      {isLoading && <LoadingMessage />}
      {isError && <ErrorMessage message="Could not load today's schedule." onRetry={onRetry} />}
      {isReady && appointments.length === 0 && <EmptyMessage>No appointments today.</EmptyMessage>}

      {isReady && appointments.length > 0 && (
        // Full-width rows: cancel the card's padding.
        <ul className="-mx-4 -mb-4 divide-y md:-mx-5 md:-mb-5">
          {appointments.map((appointment) => (
            <ScheduleRow
              key={appointment.id}
              appointment={appointment}
              isNext={appointment.id === nextId}
              now={now}
            />
          ))}
        </ul>
      )}
    </Card>
  );
}

interface ScheduleRowProps {
  appointment: Appointment;
  isNext: boolean;
  now: Date;
}

function ScheduleRow({ appointment, isNext, now }: ScheduleRowProps) {
  const { startTime, endTime, patient, status } = appointment;
  const name = `${patient.firstName} ${patient.lastName}`;
  const isCancelled = status === "CANCELLED";

  return (
    <li
      className={`flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 md:px-5 ${isNext ? "bg-accent-subtle" : ""}`}
    >
      <span className="w-14 shrink-0 leading-tight tabular-nums">
        <span className="block font-semibold text-ink">{formatTime(startTime)}</span>
        <span className="text-xs text-muted">{formatDuration(startTime, endTime)}</span>
      </span>
      <Avatar name={name} size="sm" />
      <span className="min-w-0 flex-[1_1_12rem] leading-snug">
        <span className={`block font-semibold ${isCancelled ? "text-muted line-through" : "text-ink"}`}>
          {name}
          {/* Colour is never the only signal for the next appointment. */}
          {isNext && <span className="ms-2 text-xs font-semibold text-accent">Next</span>}
        </span>
        <span className="block truncate text-sm tabular-nums text-muted">
          {birthDateAndAge(patient.dateOfBirth, now)} · {appointment.appointmentType.name}
        </span>
      </span>
      <StatusBadge status={status} />
      <span className="w-36 text-end">
        <RowAction appointment={appointment} name={name} />
      </span>
    </li>
  );
}

const linkClass = "font-semibold text-accent hover:underline";

// Completed: documentation. Scheduled or confirmed: the patient. No-show, cancelled: nothing.
function RowAction({ appointment, name }: { appointment: Appointment; name: string }) {
  // Several rows share the same link text: the name makes each one clear (WCAG 2.4.4).
  const forName = <span className="sr-only">, {name}</span>;

  if (appointment.status === "COMPLETED") {
    return (
      <Link to={`/documentation/${appointment.id}`} className={linkClass}>
        {appointment.hasNote ? "Open documentation" : "Document visit"}
        {forName}
      </Link>
    );
  }
  if (appointment.status === "SCHEDULED" || appointment.status === "CONFIRMED") {
    return (
      <Link to={`/patients/${appointment.patientId}`} className={linkClass}>
        Open
        {forName}
      </Link>
    );
  }
  return null;
}