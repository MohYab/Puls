interface CalendarToolbarProps {
  date: Date;
  onPrevDay: () => void;
  onNextDay: () => void;
  onNewAppointment: () => void;
}

export function CalendarToolbar({
  date,
  onPrevDay,
  onNextDay,
  onNewAppointment,
}: CalendarToolbarProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <button onClick={onPrevDay} className="px-2 py-1 border rounded hover:bg-gray-50">
          ←
        </button>
        <span className="font-medium">
          {date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </span>
        <button onClick={onNextDay} className="px-2 py-1 border rounded hover:bg-gray-50">
          →
        </button>
      </div>

      <button
        onClick={onNewAppointment}
        className="bg-blue-600 text-white rounded px-4 py-2 text-sm"
      >
        + New appointment
      </button>
    </div>
  );
}
