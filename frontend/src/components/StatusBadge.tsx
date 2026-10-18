import type { AppointmentStatus } from "../types/appointment";
import { STATUS_LABELS } from "../utils/appointmentStatus";

const statusStyles: Record<AppointmentStatus, string> = {
  SCHEDULED: "bg-blue-100 text-blue-800",
  CONFIRMED: "bg-green-100 text-green-800",
  COMPLETED: "bg-gray-100 text-gray-700",
  CANCELLED: "bg-red-100 text-red-800",
  NO_SHOW: "bg-yellow-100 text-yellow-800",
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
