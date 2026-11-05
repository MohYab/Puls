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

// Building blocks shared by the day and week views.

const HOURS = Array.from(
  { length: CALENDAR_END_HOUR - CALENDAR_START_HOUR },
  (_, i) => CALENDAR_START_HOUR + i
);

/** Width of the time axis; the week view's header uses it to line up. */
export const TIME_AXIS_WIDTH = "w-14 md:w-16";

export function TimeAxis() {
  // The times are also in each appointment's name, so the axis is hidden from screen readers.
  return (
    <div aria-hidden="true" className={`${TIME_AXIS_WIDTH} shrink-0 border-e`}>
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
  );
}

export function HourLines() {
  return HOURS.map((hour, i) => (
    <div
      key={hour}
      aria-hidden="true"
      style={{ top: i * HOUR_HEIGHT, height: HOUR_HEIGHT }}
      className="absolute inset-x-0 border-b"
    >
      <div className="h-1/2 border-b border-dashed border-border/60" />
    </div>
  ));
}

/** The "now" line, shown only in the column for today and within the opening hours. */
export function NowLine({ date }: { date: Date }) {
  const now = useNow();
  const offset = minutesSinceCalendarStart(now) * PX_PER_MINUTE;

  if (!isSameDay(date, now) || offset < 0 || offset > CALENDAR_HEIGHT) return null;

  return (
    <div
      aria-hidden="true"
      style={{ top: offset }}
      className="pointer-events-none absolute inset-x-0 z-10 flex -translate-y-1/2 items-center"
    >
      <span className="-ms-1 size-2.5 rounded-full bg-accent" />
      <span className="h-0.5 flex-1 bg-accent" />
    </div>
  );
}

interface AppointmentListProps {
  appointments: Appointment[];
  selectedId?: string | null;
  isNarrow?: boolean;
  onAppointmentClick: (appointment: Appointment) => void;
}

export function AppointmentList({
  appointments,
  selectedId,
  isNarrow,
  onAppointmentClick,
}: AppointmentListProps) {
  return (
    <ul aria-label="Appointments">
      {appointments.map((appointment) => (
        <li key={appointment.id}>
          <AppointmentBlock
            appointment={appointment}
            isSelected={appointment.id === selectedId}
            isNarrow={isNarrow}
            onClick={onAppointmentClick}
          />
        </li>
      ))}
    </ul>
  );
}
