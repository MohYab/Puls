import { Card } from "../../components/Card";
import { formatTime } from "../../utils/date";
import type { Appointment } from "../../types/appointment";

interface NextAppointmentProps {
  appointment: Appointment | null;
  isLoading: boolean;
}

export function NextAppointment({ appointment, isLoading }: NextAppointmentProps) {
  return (
    <Card title="Next appointment">
      {isLoading && <p className="text-sm text-gray-500">Loading...</p>}

      {!isLoading && !appointment && (
        <p className="text-sm text-gray-500">No upcoming appointments today.</p>
      )}

      {!isLoading && appointment && (
        <div className="flex flex-col gap-1">
          <p className="font-medium">
            {appointment.patient.firstName} {appointment.patient.lastName}
          </p>
          <p className="text-sm text-gray-600">{formatTime(appointment.startTime)}</p>
          <p className="text-sm text-gray-600">{appointment.appointmentType.name}</p>
        </div>
      )}
    </Card>
  );
}
