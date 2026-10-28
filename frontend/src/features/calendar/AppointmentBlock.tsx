import { FileCheck2 } from "lucide-react";
import type { Appointment } from "../../types/appointment";
import { STATUS_PHRASES } from "../../utils/appointmentStatus";
import { formatTime, formatTimeRange } from "../../utils/date";
import { COMPACT_MAX_MINUTES, PX_PER_MINUTE, minutesSinceCalendarStart } from "./constants";
import { statusBorderColors } from "./statusColors";

interface AppointmentBlockProps {
  appointment: Appointment;
  isSelected?: boolean;
  onClick: (appointment: Appointment) => void;
}

export function AppointmentBlock({ appointment, isSelected = false, onClick }: AppointmentBlockProps) {  
  const { startTime, endTime, status, patient, appointmentType, hasNote } = appointment;
  const top = minutesSinceCalendarStart(new Date(startTime)) * PX_PER_MINUTE;
  // Use the booked length, not the type's current duration (an admin may change it later).
  const durationMinutes = (new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000;
  const height = durationMinutes * PX_PER_MINUTE;

  const isCompact = durationMinutes <= COMPACT_MAX_MINUTES;
  const isCancelled = status === "CANCELLED";
  const patientName = `${patient.firstName} ${patient.lastName}`;

  // Colour is never the only signal: status and documentation are also in text for screen readers,
  // and cancelled appointments are struck through.
  const nameClass = `truncate font-medium ${isCancelled ? "text-muted line-through" : "text-ink"}`;
  const hiddenDetails = (
    <span className="sr-only">
      {isCompact && `, ${appointmentType.name}`}, {STATUS_PHRASES[status]}
      {hasNote && ", documented"}
    </span>
  );
  const noteIcon = hasNote && (
    <FileCheck2 aria-hidden="true" className="size-3.5 shrink-0 text-completed" />
  );

  return (
    <button
      type="button"
      onClick={() => onClick(appointment)}
      aria-current={isSelected || undefined}
      style={{ top, height }}
      className={`absolute inset-x-1 overflow-hidden rounded-md border-s-4 text-start text-xs leading-4 transition-shadow hover:shadow-pop ${
        isCompact ? "flex items-center gap-1.5 px-2" : "px-2 py-1"
      } ${statusBorderColors[status]} ${isSelected ? "z-10 ring-2 ring-accent" : ""}`}
    >
      {isCompact ? (
        <>
          <span className="shrink-0 tabular-nums text-muted">{formatTime(startTime)}</span>
          <span className={nameClass}>{patientName}</span>
          {noteIcon}
        </>
      ) : (
        <>
          <span className="flex items-center gap-1">
            <span className={nameClass}>{patientName}</span>
            {noteIcon}
          </span>
          <span className="block truncate text-muted">
            <span className="tabular-nums">{formatTimeRange(startTime, endTime)}</span> ·{" "}
            {appointmentType.name}
          </span>
        </>
      )}
      {hiddenDetails}
    </button>
  );
}
