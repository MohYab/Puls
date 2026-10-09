import { formatTime } from "../../utils/date";
import { statusBorderColors } from "./statusColors";
import { PX_PER_MINUTE, minutesSinceCalendarStart } from "./constants";
import type { Appointment } from "../../types/appointment";

interface AppointmentBlockProps {
  appointment: Appointment;
  onClick: (appointment: Appointment) => void;
}

export function AppointmentBlock({ appointment, onClick }: AppointmentBlockProps) {
  const top = minutesSinceCalendarStart(new Date(appointment.startTime)) * PX_PER_MINUTE;
  const height = appointment.appointmentType.duration * PX_PER_MINUTE;

  return (
    <button
      onClick={() => onClick(appointment)}
      style={{ top, height }}
      className={`absolute left-1 right-1 rounded border-l-4 px-2 py-1 text-left text-xs overflow-hidden hover:shadow-md transition-shadow ${statusBorderColors[appointment.status]}`}
    >
      <div className="font-medium">
        {formatTime(appointment.startTime)} – {appointment.patient.firstName}{" "}
        {appointment.patient.lastName}
      </div>
      <div className="text-gray-600">{appointment.appointmentType.name}</div>
    </button>
  );
}
