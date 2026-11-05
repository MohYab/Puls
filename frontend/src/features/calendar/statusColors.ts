import type { AppointmentStatus } from "../../types/appointment";

// Same colours as StatusBadge (design tokens). Colour shows the booking
// status only; whether a note exists is shown separately (design decision 1).
export const statusBorderColors: Record<AppointmentStatus, string> = {
  SCHEDULED: "border-s-scheduled bg-scheduled-bg",
  CONFIRMED: "border-s-confirmed bg-confirmed-bg",
  COMPLETED: "border-s-completed bg-completed-bg",
  NO_SHOW: "border-s-no-show bg-no-show-bg",
  CANCELLED: "border-s-cancelled bg-cancelled-bg",
};
