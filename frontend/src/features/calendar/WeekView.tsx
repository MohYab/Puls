import type { Appointment } from "../../types/appointment";
import { formatLongDate, isSameDay, toDateString } from "../../utils/date";
import { AppointmentList, HourLines, NowLine, TIME_AXIS_WIDTH, TimeAxis } from "./CalendarGrid";
import { CALENDAR_HEIGHT } from "./constants";

interface WeekViewProps {
  /** Monday to Sunday. */
  days: Date[];
  appointments: Appointment[];
  selectedId?: string | null;
  onAppointmentClick: (appointment: Appointment) => void;
  /** Opens the day in the day view. */
  onDayClick: (day: Date) => void;
}

const isWeekend = (day: Date) => day.getDay() === 0 || day.getDay() === 6;

export function WeekView({
  days,
  appointments,
  selectedId,
  onAppointmentClick,
  onDayClick,
}: WeekViewProps) {
  const today = new Date();

  return (
    // Below the minimum width the week scrolls sideways inside the card, never the page.
    <div className="overflow-x-auto rounded-lg border bg-surface shadow-card">
      <div className="min-w-[36rem]">
        <div className="flex border-b">
          <div aria-hidden="true" className={`${TIME_AXIS_WIDTH} shrink-0 border-e`} />
          {days.map((day) => {
            const isToday = isSameDay(day, today);
            return (
              <div
                key={toDateString(day)}
                className={`min-w-0 flex-1 border-e last:border-e-0 ${isWeekend(day) ? "bg-subtle/60" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => onDayClick(day)}
                  aria-current={isToday ? "date" : undefined}
                  className="flex w-full flex-col items-center gap-0.5 py-2 text-xs hover:bg-subtle"
                >
                  <span className="text-muted">
                    {day.toLocaleDateString("en-GB", { weekday: "short" })}
                  </span>
                  <span
                    className={`flex size-7 items-center justify-center rounded-full text-sm font-semibold ${
                      isToday ? "bg-accent text-white" : "text-ink"
                    }`}
                  >
                    {day.getDate()}
                  </span>
                  <span className="sr-only">
                    {day.toLocaleDateString("en-GB", { month: "long" })}, open day view
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex">
          <TimeAxis />
          {days.map((day) => (
            <div
              key={toDateString(day)}
              role="group"
              aria-label={formatLongDate(day)}
              className={`relative min-w-0 flex-1 border-e last:border-e-0 ${isWeekend(day) ? "bg-subtle/60" : ""}`}
              style={{ height: CALENDAR_HEIGHT }}
            >
              <HourLines />
              <AppointmentList
                appointments={appointments.filter((a) => isSameDay(new Date(a.startTime), day))}
                selectedId={selectedId}
                isNarrow
                onAppointmentClick={onAppointmentClick}
              />
              <NowLine date={day} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}