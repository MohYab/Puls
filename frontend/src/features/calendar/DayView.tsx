import type { Appointment } from "../../types/appointment";
import { useNow } from "../../hooks/useNow";
import { isSameDay } from "../../utils/date";
import { AppointmentBlock } from "./AppointmentBlock";
import {
  CALENDAR_END_HOUR,
  CALENDAR_HEIGHT,
  CALENDAR_START_HOUR,
  HOUR_HEIGHT,
  PX_PER_MINUTE,
  minutesSinceCalendarStart,
} from "./constants";

interface DayViewProps {
  date: Date;
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
}

const HOURS = Array.from(
  { length: CALENDAR_END_HOUR - CALENDAR_START_HOUR },
  (_, i) => CALENDAR_START_HOUR + i
);

export function DayView({ date, appointments, onAppointmentClick }: DayViewProps) {
  const now = useNow();
  const nowOffset = minutesSinceCalendarStart(now) * PX_PER_MINUTE;
  // Only on today's date, and only within the opening hours.
  const showNowLine = isSameDay(date, now) && nowOffset >= 0 && nowOffset <= CALENDAR_HEIGHT;

  return (
    <div className="flex overflow-hidden rounded-lg border bg-surface shadow-card">
      {/* The times are also in each appointment's name, so the axis is hidden from screen readers. */}
      <div aria-hidden="true" className="w-14 shrink-0 border-e md:w-16">
        {HOURS.map((hour) => (
          <div
            key={hour}
            style={{ height: HOUR_HEIGHT }}
            className="pe-2 pt-1 text-end text-xs tabular-nums text-muted"
          >
            {String(hour).padStart(2, "0")}:00
          </div>
        ))}
      </div>

      <div className="relative min-w-0 flex-1" style={{ height: CALENDAR_HEIGHT }}>
        {HOURS.map((hour, i) => (
          <div
            key={hour}
            aria-hidden="true"
            style={{ top: i * HOUR_HEIGHT, height: HOUR_HEIGHT }}
            className="absolute inset-x-0 border-b"
          >
            <div className="h-1/2 border-b border-dashed border-border/60" />
          </div>
        ))}

        <ul aria-label="Appointments">
          {appointments.map((appointment) => (
            <li key={appointment.id}>
              <AppointmentBlock appointment={appointment} onClick={onAppointmentClick} />
            </li>
          ))}
        </ul>

        {showNowLine && (
          <div
            aria-hidden="true"
            style={{ top: nowOffset }}
            className="pointer-events-none absolute inset-x-0 z-10 flex -translate-y-1/2 items-center"
          >
            <span className="-ms-1 size-2.5 rounded-full bg-accent" />
            <span className="h-0.5 flex-1 bg-accent" />
          </div>
        )}
      </div>
    </div>
  );
}
