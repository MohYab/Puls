import {
  CALENDAR_START_HOUR,
  CALENDAR_END_HOUR,
  CALENDAR_HEIGHT,
  PX_PER_MINUTE,
} from "./constants";
import { AppointmentBlock } from "./AppointmentBlock";
import type { Appointment } from "../../types/appointment";

interface DayViewProps {
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
}

export function DayView({ appointments, onAppointmentClick }: DayViewProps) {
  const hours = Array.from(
    { length: CALENDAR_END_HOUR - CALENDAR_START_HOUR },
    (_, i) => CALENDAR_START_HOUR + i
  );

  return (
    <div className="flex border rounded-lg overflow-hidden bg-white">
      <div className="w-16 shrink-0 border-r md:w-16">
        {hours.map((hour) => (
          <div
            key={hour}
            style={{ height: 60 * PX_PER_MINUTE }}
            className="text-xs text-gray-400 text-right pr-2 pt-1 border-b"
          >
            {String(hour).padStart(2, "0")}:00
          </div>
        ))}
      </div>

      <div className="relative flex-1" style={{ height: CALENDAR_HEIGHT }}>
        {hours.map((hour, i) => (
          <div
            key={hour}
            style={{ top: i * 60 * PX_PER_MINUTE, height: 60 * PX_PER_MINUTE }}
            className="absolute left-0 right-0 border-b"
          />
        ))}

        {appointments.map((appointment) => (
          <AppointmentBlock
            key={appointment.id}
            appointment={appointment}
            onClick={onAppointmentClick}
          />
        ))}
      </div>
    </div>
  );
}
