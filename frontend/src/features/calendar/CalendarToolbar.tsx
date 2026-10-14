interface CalendarToolbarProps {
  date: Date;
  isToday: boolean;
  onPrevDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
  onNewAppointment: () => void;
}

const navButtonClass =
  "rounded border px-3 py-1.5 text-sm hover:bg-gray-50 disabled:cursor-default disabled:opacity-50 disabled:hover:bg-transparent";

export function CalendarToolbar({
  date,
  isToday,
  onPrevDay,
  onNextDay,
  onToday,
  onNewAppointment,
}: CalendarToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onPrevDay}
          aria-label="Previous day"
          className={navButtonClass}
        >
          ←
        </button>
        <button type="button" onClick={onToday} disabled={isToday} className={navButtonClass}>
          Today
        </button>
        <button type="button" onClick={onNextDay} aria-label="Next day" className={navButtonClass}>
          →
        </button>
        <h1 aria-live="polite" className="ml-1 font-medium">
          {date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </h1>
      </div>

      <button
        type="button"
        onClick={onNewAppointment}
        className="w-full rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 sm:w-auto"
      >
        + New appointment
      </button>
    </div>
  );
}
