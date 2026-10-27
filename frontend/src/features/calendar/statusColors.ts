import type { AppointmentStatus } from "../../types/appointment";

// Same colours as StatusBadge (design tokens). Colour shows the booking
// status only; whether a note exists is shown separately (design decision 1).
export const statusBorderColors: Record<AppointmentStatus, string> = {
  SCHEDULED: "border-l-scheduled bg-scheduled-bg",
  CONFIRMED: "border-l-confirmed bg-confirmed-bg",
  COMPLETED: "border-l-completed bg-completed-bg",
  NO_SHOW: "border-l-no-show bg-no-show-bg",
  CANCELLED: "border-l-cancelled bg-cancelled-bg text-muted",
};