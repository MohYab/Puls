import { Link } from "react-router-dom";
import { Card } from "../../components/Card";
import { EmptyMessage, ErrorMessage, LoadingMessage } from "../../components/Feedback";
import type { AppointmentsToDocument } from "../appointments/appointmentService";
import { useAppointmentsToDocument } from "../appointments/useAppointments";
import { formatDateTime } from "../../utils/date";

// Completed visits without a note, oldest first: the longest-waiting is the most urgent.
export function ToDocumentList() {
  const { data, isLoading, isError, refetch } = useAppointmentsToDocument();

  return (
    <Card title="To document" actions={data && <CountLabel data={data} />}>
      {isLoading && <LoadingMessage />}

      {isError && (
        <ErrorMessage message="Could not load visits to document." onRetry={() => refetch()} />
      )}

      {data && data.total === 0 && <EmptyMessage>All completed visits are documented.</EmptyMessage>}

      {data && data.appointments.length > 0 && (
        <ul className="divide-y">
          {data.appointments.map((appointment) => {
            const name = `${appointment.patient.firstName} ${appointment.patient.lastName}`;
            return (
              <li key={appointment.id} className="flex items-center gap-3 py-2.5 text-sm">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-ink">{name}</span>
                  <span className="block truncate text-muted">
                    <span className="tabular-nums">{formatDateTime(appointment.startTime)}</span>{" "}
                    · {appointment.appointmentType.name}
                  </span>
                </span>
                <Link
                  to={`/documentation/${appointment.id}`}
                  className="shrink-0 font-medium text-accent hover:underline"
                >
                  Document
                  <span className="sr-only">, {name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

function CountLabel({ data }: { data: AppointmentsToDocument }) {
  if (data.total === 0) return null;
  const shown = data.appointments.length;
  return (
    <span className="text-sm text-muted">
      {data.total > shown ? `Oldest ${shown} of ${data.total}` : `${data.total} waiting`}
    </span>
  );
}