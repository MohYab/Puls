import { Link } from "react-router-dom";
import { Badge } from "../../components/Badge";
import { Card } from "../../components/Card";
import { EmptyMessage, ErrorMessage, LoadingMessage } from "../../components/Feedback";
import { StatusBadge } from "../../components/StatusBadge";
import { formatDate, formatTime } from "../../utils/date";
import { useAuth } from "../auth/useAuth";
import { documentationAction } from "./patientData";
import { usePatientAppointments } from "./usePatients";

const cell = "px-4 py-3 md:px-5";

export function AppointmentHistory({ patientId }: { patientId: string }) {
  const { user } = useAuth();
  // Admins have no access to notes, not even a link (decision #56).
  const isDoctor = user?.role === "DOCTOR";
  const { data: appointments, isPending, isError, refetch } = usePatientAppointments(patientId);

  return (
    <Card
      title="Appointment history"
      badge={
        appointments &&
        appointments.length > 0 && (
          <Badge>
            {appointments.length}
            <span className="sr-only"> appointments</span>
          </Badge>
        )
      }
    >
      {isPending && <LoadingMessage>Loading appointments...</LoadingMessage>}
      {isError && (
        <ErrorMessage message="Could not load appointment history." onRetry={() => refetch()} />
      )}
      {appointments && appointments.length === 0 && (
        <EmptyMessage>This patient has no appointments yet.</EmptyMessage>
      )}

      {appointments && appointments.length > 0 && (
        // Full width, and scrolls inside the card on a phone.
        <div className="-mx-4 -mb-4 overflow-x-auto md:-mx-5 md:-mb-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs font-semibold uppercase tracking-wide text-muted">
                <th scope="col" className={`${cell} text-start`}>
                  Date
                </th>
                <th scope="col" className={`${cell} text-start`}>
                  Doctor
                </th>
                <th scope="col" className={`${cell} text-start`}>
                  Type
                </th>
                <th scope="col" className={`${cell} text-start`}>
                  Status
                </th>
                {isDoctor && (
                  <th scope="col" className={cell}>
                    <span className="sr-only">Documentation</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y">
              {appointments.map((appointment) => {
                const action = documentationAction(appointment, user?.role);
                const date = formatDate(appointment.startTime);
                return (
                  <tr key={appointment.id} className="hover:bg-subtle">
                    <td className={`${cell} whitespace-nowrap tabular-nums`}>
                      <span className="font-semibold text-ink">{date}</span>{" "}
                      <span className="text-muted">{formatTime(appointment.startTime)}</span>
                    </td>
                    <td className={`${cell} whitespace-nowrap`}>{appointment.doctor.user.name}</td>
                    <td className={cell}>{appointment.appointmentType.name}</td>
                    <td className={cell}>
                      <StatusBadge status={appointment.status} />
                    </td>
                    {isDoctor && (
                      <td className={`${cell} whitespace-nowrap text-end`}>
                        {action && (
                          <Link
                            to={action.to}
                            className="font-semibold text-accent hover:underline"
                          >
                            {action.label}
                            {/* Several rows share the link text: the date makes each one clear. */}
                            <span className="sr-only">, {date}</span>
                          </Link>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
