import type { AppointmentStatus } from "../types/appointment";
import { STATUS_LABELS } from "../utils/appointmentStatus";
import { Badge, type BadgeTone } from "./Badge";

// Colour shows the appointment status only (design-direction.md, decision 1).
const statusTones: Record<AppointmentStatus, BadgeTone> = {
  SCHEDULED: "scheduled",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  NO_SHOW: "no-show",
  CANCELLED: "cancelled",
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return <Badge tone={statusTones[status]}>{STATUS_LABELS[status]}</Badge>;
}