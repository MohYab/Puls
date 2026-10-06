import type { AppointmentStatus } from "../types/appointment";

const statusStyles: Record<AppointmentStatus, string> = {
  SCHEDULED: "bg-blue-100 text-blue-800",
  CONFIRMED: "bg-green-100 text-green-800",
  COMPLETED: "bg-gray-100 text-gray-700",
  CANCELLED: "bg-red-100 text-red-800",
  NO_SHOW: "bg-yellow-100 text-yellow-800",
};

const statusLabels: Record<AppointmentStatus, string> = {
  SCHEDULED: "Scheduled",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No-show",
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[status]}`}>
      {statusLabels[status]}
    </span>
  );
}
