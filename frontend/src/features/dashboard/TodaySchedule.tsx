import { Card } from "../../components/Card";
import { EmptyMessage, LoadingMessage } from "../../components/Feedback";
import { StatusBadge } from "../../components/StatusBadge";
import { formatTime } from "../../utils/date";
import type { Appointment } from "../../types/appointment";

interface TodayScheduleProps {
  appointments: Appointment[];
  isLoading: boolean;
}

export function TodaySchedule({ appointments, isLoading }: TodayScheduleProps) {
  return (
    <Card title="Today's schedule">
      {isLoading && <LoadingMessage />}

      {!isLoading && appointments.length === 0 && (
        <EmptyMessage>No appointments today.</EmptyMessage>
      )}

      {!isLoading && appointments.length > 0 && (
        <ul className="flex flex-col gap-2">
          {appointments.map((appointment) => (
            <li key={appointment.id} className="flex items-center justify-between text-sm">
              <span>
                <span className="font-medium">{formatTime(appointment.startTime)}</span> –{" "}
                {appointment.patient.firstName} {appointment.patient.lastName}
              </span>
              <StatusBadge status={appointment.status} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
