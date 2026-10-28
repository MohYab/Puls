import type { Appointment } from "../../types/appointment";
import { AppointmentList, HourLines, NowLine, TimeAxis } from "./CalendarGrid";
import { CALENDAR_HEIGHT } from "./constants";

interface DayViewProps {
  date: Date;
  appointments: Appointment[];
  selectedId?: string | null;
  onAppointmentClick: (appointment: Appointment) => void;
}

export function DayView({ date, appointments, selectedId, onAppointmentClick }: DayViewProps) {
  return (
    <div className="flex overflow-hidden rounded-lg border bg-surface shadow-card">
      <TimeAxis />
      <div className="relative min-w-0 flex-1" style={{ height: CALENDAR_HEIGHT }}>
        <HourLines />
        <AppointmentList
          appointments={appointments}
          selectedId={selectedId}
          onAppointmentClick={onAppointmentClick}
        />
        <NowLine date={date} />
      </div>
    </div>
  );
}