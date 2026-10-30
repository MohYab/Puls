import { Link } from "react-router-dom";
import { Avatar } from "../../components/Avatar";
import { Card } from "../../components/Card";
import { EmptyMessage, ErrorMessage, LoadingMessage } from "../../components/Feedback";
import { StatusBadge } from "../../components/StatusBadge";
import type { Appointment } from "../../types/appointment";
import { formatTimeRange } from "../../utils/date";

interface NextAppointmentProps {
  appointment: Appointment | null;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function NextAppointment({ appointment, isLoading, isError, onRetry }: NextAppointmentProps) {
  const isReady = !isLoading && !isError;

  return (
    <Card title="Next patient" variant="highlight">
      {isLoading && <LoadingMessage />}

      {isError && <ErrorMessage message="Could not load the next patient." onRetry={onRetry} />}

      {/* Without !isError, a failed load would say "No more patients today", which is not true. */}
      {isReady && !appointment && <EmptyMessage>No more patients today.</EmptyMessage>}

      {isReady && appointment && <NextPatient appointment={appointment} />}
    </Card>
  );
}



function NextPatient({ appointment }: { appointment: Appointment }) {
  const name = `${appointment.patient.firstName} ${appointment.patient.lastName}`;

  return (
    <div className="flex items-start gap-3">
      <Avatar name={name} />
      <div className="min-w-0">
        <Link
          to={`/patients/${appointment.patientId}`}
          className="block truncate text-lg font-semibold text-ink hover:underline"
        >
          {name}
        </Link>
        <p className="text-sm text-muted">
          <span className="tabular-nums">
            {formatTimeRange(appointment.startTime, appointment.endTime)}
          </span>{" "}
          · {appointment.appointmentType.name}
        </p>
        <div className="mt-2">
          <StatusBadge status={appointment.status} />
        </div>
      </div>
    </div>
  );
}